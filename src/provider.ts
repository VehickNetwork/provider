import {
  ApiNetworkProvider,
  TransactionOnNetwork,
} from "@elrondnetwork/erdjs-network-providers/out";
import {
  AbiRegistry,
  Address,
  AddressValue,
  ContractFunction,
  IAddress,
  ResultsParser,
  SmartContract,
  SmartContractAbi,
  TypedOutcomeBundle,
} from "@elrondnetwork/erdjs/out";
import { IScInfo } from "./interfaces";
import { VehickHistoryOnNetwork } from "./history";
import { IPagination } from "@elrondnetwork/erdjs-network-providers/out/interface";
import axios, { AxiosResponse } from "axios";
import { VinData } from "./vindata";
import { VehickOnNetwork } from "./vehickOnNetwork";
import { NonFungibleTokenOnNetwork } from "./tokens";
import { Nonce } from "@elrondnetwork/erdjs-network-providers/out/primitives";

const nhtsa = require("nhtsa");

export class VehickCustomProvider extends ApiNetworkProvider {
  private scInfo?: IScInfo;

  constructor(url: string, scInfo?: IScInfo) {
    super(url);
    this.scInfo = scInfo;
  }

  async getVehickHistory(
    vehickAddress: IAddress,
    _pagination?: IPagination //should implement pagination
  ): Promise<VehickHistoryOnNetwork[]> {
    let response: any[] = await this.doGetGeneric(
      `accounts/${this.scInfo?.address}/transactions?sender=${vehickAddress}&status=success`
    );

    let history = response.map((item) =>
      VehickHistoryOnNetwork.fromApiHttpResponse(
        TransactionOnNetwork.fromApiHttpResponse(item.txHash, item)
      )
    );

    return history;
  }

  async getNonFungibleTokenByIdentifier(
    identifier: string
  ): Promise<NonFungibleTokenOnNetwork> {
    let response = await this.doGetGeneric(`nfts/${identifier}`);
    let token = NonFungibleTokenOnNetwork.fromApiHttpResponse(response);
    return token;
  }

  async queryContractByAbi(
    args: any[]
  ): Promise<TypedOutcomeBundle | undefined> {
    try {
      if (
        this.scInfo?.abiUrl ||
        this.scInfo?.abiName ||
        this.scInfo?.endpoint
      ) {
        let abiResponse: AxiosResponse = await axios.get(this.scInfo.abiUrl!);
        let abiRegistry = AbiRegistry.create(await abiResponse.data);
        let abi = new SmartContractAbi(abiRegistry, [this.scInfo.abiName!]);

        let contract = new SmartContract({
          address: this.scInfo.address,
          abi: abi,
        });

        let view_query = contract.createQuery({
          func: new ContractFunction(this.scInfo.endpoint!),
          args: args,
        });
        let ViewQueryResponse = await this.queryContract(view_query);
        let ViewEndpointDefinition = contract.getEndpoint(
          this.scInfo.endpoint!
        );

        let parsedQuery = new ResultsParser().parseQueryResponse(
          ViewQueryResponse,
          ViewEndpointDefinition
        );

        return parsedQuery;
      }
      return;
    } catch (error) {
      return;
    }
  }

  async getVinData(vinToDecode: string): Promise<VinData> {
    const { data } = await nhtsa.decodeVinFlatFormat(vinToDecode);
    let response = data.Results[0];
    let vinData = new VinData();

    vinData.make = response.Make;
    vinData.model = response.Model;
    vinData.manufacturer = response.Manufacturer;
    vinData.bodyType = response.BodyClass;
    vinData.doors = response.Doors;
    vinData.driveTrain = response.DriveType;
    vinData.engineDisplacement = response.DisplacementCC;
    vinData.engineHP = response.EngineHP;
    vinData.year = response.ModelYear;
    vinData.fuelType = response.FuelTypePrimary;

    return vinData;
  }

  async getVehick(address: IAddress): Promise<VehickOnNetwork> {
    let queryResponse = await this.queryContractByAbi([
      new AddressValue(new Address(address.bech32())),
    ]);

    let vehickOnNetwork = VehickOnNetwork.fromContractQuery(queryResponse);

    let nftSyncronized = await this.getNonFungibleTokenByIdentifier(
      `${vehickOnNetwork.ticker}-${new Nonce(
        vehickOnNetwork.tickerNonce
      ).hex()}`
    );

    vehickOnNetwork.address = address;
    vehickOnNetwork.owner = nftSyncronized.owner;
    vehickOnNetwork.identifier = nftSyncronized.identifier;

    return vehickOnNetwork;
  }
}

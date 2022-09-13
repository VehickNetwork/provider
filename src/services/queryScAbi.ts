import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers/out";
import {
  SmartContract,
  SmartContractAbi,
  ContractFunction,
  ResultsParser,
  AbiRegistry,
} from "@elrondnetwork/erdjs";
import { IScInfo } from "../interfaces";
import axios, { AxiosResponse } from "axios";

export const queryScAbi = async (
  scInfo: IScInfo,
  args: any[],
  endpoint: string,
  proxy_url: string
) => {
  try {
    if (scInfo?.abiUrl || scInfo?.abiName) {
      let abiResponse: AxiosResponse = await axios.get(scInfo.abiUrl!);
      let abiRegistry = AbiRegistry.create(await abiResponse.data);
      let abi = new SmartContractAbi(abiRegistry, [scInfo.abiName!]);

      let networkProvider = new ProxyNetworkProvider(proxy_url);
      let contract = new SmartContract({
        address: scInfo.address,
        abi: abi,
      });

      let view_query = contract.createQuery({
        func: new ContractFunction(endpoint),
        args: args,
      });
      let ViewQueryResponse = await networkProvider.queryContract(view_query);
      let ViewEndpointDefinition = contract.getEndpoint(endpoint);

      let parsedQuery = new ResultsParser().parseQueryResponse(
        ViewQueryResponse,
        ViewEndpointDefinition
      );

      return parsedQuery;
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

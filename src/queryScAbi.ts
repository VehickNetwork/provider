import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers/out";
import {
  SmartContract,
  SmartContractAbi,
  ContractFunction,
  ResultsParser,
  AbiRegistry,
} from "@elrondnetwork/erdjs";
import { IVehickNetworkConfig } from "./interfaces";
import axios, { AxiosResponse } from "axios";

export const queryScAbi = async (
  vehickNetworkConfig: IVehickNetworkConfig,
  endpoint: string,
  args: any[]
) => {
  try {
    if (
      vehickNetworkConfig.scInfo?.abiUrl ||
      vehickNetworkConfig.scInfo?.abiName
    ) {
      let abiResponse: AxiosResponse = await axios.get(
        vehickNetworkConfig.scInfo.abiUrl!
      );
      let abiRegistry = AbiRegistry.create(await abiResponse.data);
      let abi = new SmartContractAbi(abiRegistry, [
        vehickNetworkConfig.scInfo.abiName!,
      ]);

      let networkProvider = new ProxyNetworkProvider(
        vehickNetworkConfig.proxy_url
      );
      let contract = new SmartContract({
        address: vehickNetworkConfig.scInfo.address,
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

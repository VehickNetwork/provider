import {
  ApiNetworkProvider,
  NonFungibleTokenOfAccountOnNetwork,
  TransactionOnNetwork,
} from "@elrondnetwork/erdjs-network-providers/out";
import { IAddress } from "@elrondnetwork/erdjs/out";
import { IScInfo } from "./interfaces";
import { VehickHistoryOnNetwork } from "./history";
import { IPagination } from "@elrondnetwork/erdjs-network-providers/out/interface";
import axios, { AxiosResponse } from "axios";
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
  ): Promise<NonFungibleTokenOfAccountOnNetwork> {
    let response = await this.doGetGeneric(`nfts/${identifier}`);
    let token =
      NonFungibleTokenOfAccountOnNetwork.fromApiHttpResponse(response);
    return token;
  }

  async queryContractByAbi() {
    //Implement queryScAbi
  }
}

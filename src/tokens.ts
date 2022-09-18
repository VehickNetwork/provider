import { NonFungibleTokenOfAccountOnNetwork } from "@elrondnetwork/erdjs-network-providers/out";
import { Address, IAddress } from "@elrondnetwork/erdjs/out";

export class NonFungibleTokenOnNetwork extends NonFungibleTokenOfAccountOnNetwork {
  owner: IAddress = new Address("");

  constructor(init?: Partial<NonFungibleTokenOfAccountOnNetwork>) {
    super();
    Object.assign(this, init);
  }

  static fromApiHttpResponse(payload: any): NonFungibleTokenOnNetwork {
    let result = new NonFungibleTokenOnNetwork(
      NonFungibleTokenOfAccountOnNetwork.fromApiHttpResponse(payload)
    );
    result.owner = payload.owner || "";
    return result;
  }
}

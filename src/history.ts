import { TransactionOnNetwork } from "@elrondnetwork/erdjs-network-providers/out";
import { TransactionDecoder } from "@elrondnetwork/transaction-decoder";

export class VehickHistoryOnNetwork {
  txHash: string = "";
  timestamp: number = 0;
  functionName: string = "";
  functionArgs: string[] = [""];

  constructor(init?: Partial<VehickHistoryOnNetwork>) {
    Object.assign(this, init);
  }

  static fromApiHttpResponse(
    payload: TransactionOnNetwork
  ): VehickHistoryOnNetwork {
    let metadata = new TransactionDecoder().getTransactionMetadata({
      sender: payload.sender.bech32(),
      receiver: payload.receiver.bech32(),
      data: payload.data.toString("base64"),
      value: payload.value.toString(),
      type: payload.type,
    });

    let result = new VehickHistoryOnNetwork();

    (result.txHash = payload["hash"] || ""),
      (result.timestamp = payload["timestamp"] || 0),
      (result.functionName = metadata["functionName"] || ""),
      (result.functionArgs = metadata["functionArgs"] || []),
      console.log(result);
    return result;
  }
}

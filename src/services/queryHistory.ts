import { TransactionOnNetwork } from "@elrondnetwork/erdjs-network-providers/out";
import { TransactionDecoder } from "@elrondnetwork/transaction-decoder";
import axios from "axios";
import { ITransactionHistory, IScInfo } from "../interfaces";

export const queryHistory = async (
  scInfo: IScInfo,
  vehick_address: string,
  proxy_url: string,
  skip_elements?: number
) => {
  let history: ITransactionHistory[] = [];
  try {
    const { data } = await axios.get(
      `${proxy_url}/accounts/${
        scInfo.address
      }/transactions?sender=${vehick_address}&status=success&from=${
        skip_elements != undefined ? skip_elements : 0
      }`, // skip_elements should implement pagination on the result page
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    data.forEach((transaction: any) => {
      let transactionOnNetwork = TransactionOnNetwork.fromApiHttpResponse(
        transaction.txHash,
        transaction
      );
      let metadata = new TransactionDecoder().getTransactionMetadata({
        sender: transactionOnNetwork.sender.bech32(),
        receiver: transactionOnNetwork.receiver.bech32(),
        data: transactionOnNetwork.data.toString("base64"),
        value: transactionOnNetwork.value.toString(),
        type: transactionOnNetwork.type,
      });

      history.push({
        txHash: transactionOnNetwork.hash,
        timestamp: transactionOnNetwork.timestamp,
        functionName: metadata.functionName!,
        functionArgs: metadata.functionArgs,
      });
    });

    return history;
  } catch (error) {
    return undefined;
  }
};

import { Address } from "@elrondnetwork/erdjs/out";

export interface ITransactionHistory {
  txHash: string;
  functionName: string;
  functionArgs: string[];
  timestamp: number;
}

export interface IScInfo {
  address: Address;
  abiUrl?: string;
  abiName?: string;
}

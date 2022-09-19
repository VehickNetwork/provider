import { Address, IAddress } from "@elrondnetwork/erdjs/out";
import { VehickHistoryOnNetwork } from "./history";
import { IVinData } from "./interfaces";
import { VehickOnNetwork } from "./vehickOnNetwork";
import { VinData } from "./vindata";

export class Vehick {
  readonly address: IAddress = new Address();
  owner: IAddress = new Address("");
  identifier: string = "";
  ticker: string = "";
  tickerNonce: number = 0;
  vin: string = "";
  mileage: number = 0;
  measureUnit: string = "";
  currentDtcCodes: string[] = [];
  vinData: IVinData = new VinData();
  history: VehickHistoryOnNetwork[] = [new VehickHistoryOnNetwork()];

  /**
   * Creates an vehick object from an address
   */
  constructor(address: IAddress) {
    this.address = address;
  }
  /**
   * Updates vehick properties.
   */
  update(init: Partial<VehickOnNetwork>) {
    Object.assign(this, init);
  }
  /**
   * Updates vehick history transactions
   */
  updateHistory(history: VehickHistoryOnNetwork[]) {
    this.history = history;
  }
  /**
   * Updates vin decoded information
   */
  updateVinData(vinData: IVinData) {
    this.vinData = vinData;
  }
}

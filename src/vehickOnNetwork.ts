import {
  Address,
  BytesValue,
  IAddress,
  INonce,
  TypedOutcomeBundle,
} from "@elrondnetwork/erdjs/out";

export class VehickOnNetwork {
  address: IAddress = new Address("");
  owner: IAddress = new Address("");
  ticker: string = "";
  tickerNonce: number = 0;
  identifier: string = "";
  vin: string = "";
  mileage: number = 0;
  measureUnit: string = "";
  currentDtcCodes: string[] = [];

  constructor(init?: Partial<VehickOnNetwork>) {
    Object.assign(this, init);
  }

  static fromContractQuery(payload?: TypedOutcomeBundle): VehickOnNetwork {
    let vehickOnNetwork = new VehickOnNetwork();

    let addressSyncronized = payload?.firstValue?.valueOf();

    vehickOnNetwork.ticker = addressSyncronized.nft.token_identifier;
    vehickOnNetwork.tickerNonce = addressSyncronized.nft.nft_nonce;

    vehickOnNetwork.vin = new BytesValue(addressSyncronized.vin).toString();

    vehickOnNetwork.mileage = addressSyncronized.mileage.toString();

    vehickOnNetwork.measureUnit = new BytesValue(
      addressSyncronized.measure_unit
    ).toString();

    vehickOnNetwork.currentDtcCodes = addressSyncronized.dtc_codes.map(
      (buf: Buffer) => {
        return new BytesValue(buf).toString();
      }
    );
    return vehickOnNetwork;
  }
}

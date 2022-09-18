import {
  Address,
  BytesValue,
  IAddress,
  TypedOutcomeBundle,
} from "@elrondnetwork/erdjs/out";
import { setNftNoncePrefix } from "./helpers";

export class VehickOnNetwork {
  address: IAddress = new Address("");
  owner: IAddress = new Address("");
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

    vehickOnNetwork.identifier = this.buildIdentifier(
      addressSyncronized.nft.token_identifier,
      addressSyncronized.nft.nft_nonce
    );

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

  private static buildIdentifier(token_identifier: string, nonce: number) {
    return token_identifier.concat("-", setNftNoncePrefix(nonce));
  }
}

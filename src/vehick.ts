import {
  Address,
  AddressValue,
  BytesValue,
  IAddress,
} from "@elrondnetwork/erdjs/out";
import { queryScAbi } from "./services/queryScAbi";
import { IScInfo, ITransactionHistory } from "./interfaces";
import { setNftNoncePrefix } from "./helpers";
import { queryHistory } from "./services/queryHistory";
import { queryNftbyIdentifier } from "./services/queryNftbyIdentifier";

export class Vehick {
  address!: IAddress;
  owner!: IAddress;
  nft_identifier!: string;
  vin: string = "";
  mileage: number = 0;
  measure_unit: string = "";
  current_dtc_codes: string[] = [];
  history: ITransactionHistory[] = [];

  constructor(value?: Address | string) {
    if (!value) {
      return;
    }
    if (value instanceof Address) {
      this.address = value;
    }
    if (typeof value === "string") {
      this.nft_identifier = value;
    }
  }

  async networkSync(scInfo: IScInfo, proxy_url: string) {
    if (this.address) {
      let queryResponse = await queryScAbi(
        scInfo,
        [new AddressValue(this.address)],
        "getCarView",
        proxy_url
      );

      let addressSyncronized = queryResponse?.firstValue?.valueOf();

      this.nft_identifier = Vehick.buildIdentifier(
        addressSyncronized.nft.token_identifier,
        addressSyncronized.nft.nft_nonce
      );

      this.vin = new BytesValue(addressSyncronized.vin).toString();

      this.mileage = addressSyncronized.mileage.toString();

      this.measure_unit = new BytesValue(
        addressSyncronized.measure_unit
      ).toString();

      this.current_dtc_codes = addressSyncronized.dtc_codes.map(
        (buf: Buffer) => {
          return new BytesValue(buf).toString();
        }
      );
    } else {
      let nftSyncronized = await queryNftbyIdentifier(
        this.nft_identifier,
        proxy_url
      );
      this.owner = nftSyncronized.owner;
      this.address = new Address(
        Buffer.from(nftSyncronized.attributes, "base64")
      );
      await this.networkSync(scInfo, proxy_url);
    }

    if (!this.owner) {
      let nftSyncronized = await queryNftbyIdentifier(
        this.nft_identifier,
        proxy_url
      );
      this.owner = nftSyncronized.owner;
    }

    this.history = await queryHistory(scInfo, this.address.bech32(), proxy_url); // first page of history (25 elements maximum)
  }

  async nextPage(scInfo: IScInfo, proxy_url: string, skip_elements: number) {
    this.history = await queryHistory(
      scInfo,
      this.address.bech32(),
      proxy_url,
      skip_elements
    );
  }

  static buildIdentifier(token_identifier: string, nonce: number) {
    return token_identifier.concat("-", setNftNoncePrefix(nonce));
  }

  valueOf() {
    return {
      address: this.address.bech32() || "",
      nft_identifier: this.nft_identifier || "",
      vin: this.vin,
      owner: this.owner || "",
      current_mileage: this.mileage,
      measure_unit: this.measure_unit,
      current_dtc_codes: this.current_dtc_codes,
      history: this.history,
    };
  }
}

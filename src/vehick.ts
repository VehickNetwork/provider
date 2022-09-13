import {
  Address,
  AddressValue,
  BytesValue,
  IAddress,
} from "@elrondnetwork/erdjs/out";
import { queryScAbi } from "./services/queryScAbi";
import {
  IScInfo,
  ITransactionHistory,
  IVehickNetworkConfig,
  IVinData,
} from "./interfaces";
import { setNftNoncePrefix } from "./helpers";
import { queryHistory } from "./services/queryHistory";
import { queryNftbyIdentifier } from "./services/queryNftbyIdentifier";
import { queryVin } from "./services/queryVin";

export class Vehick {
  address!: IAddress;
  owner!: IAddress;
  nft_identifier!: string;
  vin: string = "";
  mileage: number = 0;
  measure_unit: string = "";
  current_dtc_codes: string[] = [];
  history!: ITransactionHistory[] | undefined;
  vinData!: IVinData | undefined;

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

  async networkSync(vehickNetworkConfig: IVehickNetworkConfig) {
    if (this.address) {
      let queryResponse = await queryScAbi(
        vehickNetworkConfig,
        [new AddressValue(this.address)],
        "getCarView"
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
        vehickNetworkConfig.proxy_url
      );
      this.owner = nftSyncronized.owner;
      this.address = new Address(
        Buffer.from(nftSyncronized.attributes, "base64")
      );
      await this.networkSync(vehickNetworkConfig);
    }

    if (!this.owner) {
      let nftSyncronized = await queryNftbyIdentifier(
        this.nft_identifier,
        vehickNetworkConfig.proxy_url
      );
      this.owner = nftSyncronized.owner;
    }
  }

  async nextPage(
    vehickNetworkConfig: IVehickNetworkConfig,
    skip_elements: number
  ) {
    this.history = await queryHistory(
      vehickNetworkConfig,
      this.address.bech32(),

      skip_elements
    );
  }

  async historySync(vehickNetworkConfig: IVehickNetworkConfig) {
    this.history = await queryHistory(
      vehickNetworkConfig,
      this.address.bech32()
    );
  }

  async vinSync() {
    let vinQuery = await queryVin(this.vin);
    if (!vinQuery) {
      return;
    }
    let vinData: IVinData = {
      make: vinQuery.Make,
      model: vinQuery.Model,
      manufacturer: vinQuery.Manufacturer,
      bodyType: vinQuery.BodyClass,
      doors: vinQuery.Doors,
      driveTrain: vinQuery.DriveType,
      engineDisplacement: vinQuery.DisplacementCC,
      engineHP: vinQuery.EngineHP,
      year: vinQuery.ModelYear,
      fuelType: vinQuery.FuelTypePrimary,
    };
    this.vinData = vinData;
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
      vinData: this.vinData,
      history: this.history,
    };
  }
}

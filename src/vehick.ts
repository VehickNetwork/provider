import {
  Address,
  AddressValue,
  BytesValue,
  IAddress,
} from "@elrondnetwork/erdjs/out";
import { queryScAbi } from "./providers/queryScAbi";
import {
  ITransactionHistory,
  IVehickNetworkConfig,
  IVinData,
} from "./interfaces";
import { setNftNoncePrefix } from "./helpers";
import { queryHistory } from "./providers/queryHistory";
import { queryNftbyIdentifier } from "./providers/queryNftbyIdentifier";
import { queryVin } from "./providers/queryVin";

export class Vehick {
  private address!: IAddress;
  private owner!: IAddress;
  private nft_identifier!: string;
  private vin: string = "";
  private mileage: number = 0;
  private measure_unit: string = "";
  private current_dtc_codes: string[] = [];
  private history!: ITransactionHistory[] | undefined;
  private vinData!: IVinData | undefined;
  private config!: IVehickNetworkConfig;

  constructor(config: IVehickNetworkConfig, value?: Address | string) {
    if (!value) {
      return;
    }
    if (value instanceof Address) {
      this.address = value;
    }
    if (typeof value === "string") {
      this.nft_identifier = value;
    }
    this.config = config;
  }

  async networkSync() {
    if (this.address) {
      let queryResponse = await queryScAbi(this.config, "getCarView", [
        new AddressValue(this.address),
      ]);

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
        this.config.proxy_url
      );
      this.owner = nftSyncronized.owner;
      this.address = new Address(
        Buffer.from(nftSyncronized.attributes, "base64")
      );
      await this.networkSync();
    }

    if (!this.owner) {
      let nftSyncronized = await queryNftbyIdentifier(
        this.nft_identifier,
        this.config.proxy_url
      );
      this.owner = nftSyncronized.owner;
    }
  }

  async nextPage(skip_elements: number) {
    this.history = await queryHistory(
      this.config,
      this.address.bech32(),

      skip_elements
    );
  }

  async historySync() {
    this.history = await queryHistory(this.config, this.address.bech32());
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

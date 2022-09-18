import { Address } from "@elrondnetwork/erdjs/out";

export interface IScInfo {
  address: Address;
  abiUrl?: string;
  abiName?: string;
  endpoint?: string;
}

export interface IVinData {
  make: string;
  model: string;
  manufacturer: string;
  bodyType: string;
  doors: string;
  driveTrain: string;
  engineDisplacement: string;
  engineHP: string;
  year: string;
  fuelType: string;
}

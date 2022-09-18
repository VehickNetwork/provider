import { IVinData } from "./interfaces";

export class VinData {
  make: string = "";
  model: string = "";
  manufacturer: string = "";
  bodyType: string = "";
  doors: string = "";
  driveTrain: string = "";
  engineDisplacement: string = "";
  engineHP: string = "";
  year: string = "";
  fuelType: string = "";

  constructor(vinData?: IVinData) {
    Object.assign(this, vinData);
  }
}

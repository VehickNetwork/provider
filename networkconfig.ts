import { IScInfo, IVehickNetworkConfig } from "./src/interfaces";

export class VehickNetworkConfig implements IVehickNetworkConfig {
  scInfo: IScInfo;
  proxy_url: string;

  constructor(scInfo: IScInfo, proxy_url: string) {
    this.scInfo = scInfo;
    this.proxy_url = proxy_url;
  }
}

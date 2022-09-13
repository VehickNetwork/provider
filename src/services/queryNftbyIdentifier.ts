import axios, { AxiosResponse } from "axios";

export const queryNftbyIdentifier = async (
  nft_identifier: string,
  proxy_url: string
) => {
  try {
    let response: AxiosResponse = await axios.get(
      `${proxy_url}/nfts/${nft_identifier}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    return undefined;
  }
};

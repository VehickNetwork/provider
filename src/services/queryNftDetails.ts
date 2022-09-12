import axios, { AxiosResponse } from "axios";

export const queryNftDetails = async (
  vehick_nft: string,
  proxy_url: string
) => {
  try {
    let response: AxiosResponse = await axios.get(
      `${proxy_url}/nfts/${vehick_nft}`,
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

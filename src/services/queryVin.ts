const nhtsa = require("nhtsa");

export const queryVin = async (vinToDecode: string) => {
  if (vinToDecode.length == 17) {
    const { data } = await nhtsa.decodeVinFlatFormat(vinToDecode);
    let response = data.Results[0];

    return response;
  }
  return;
};

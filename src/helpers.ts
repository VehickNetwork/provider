export const trimHash = (hash: string, keep = 10) => {
  const start = hash.substring(0, keep);
  const end = hash.substring(hash.length - keep);
  return `${start}...${end}`;
};

export const isAddressValid = (address: string): boolean => {
  return Buffer.from(address, "hex").length == 32;
};

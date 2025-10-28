import algosdk from "algosdk";

export const DEFAULT_ALGOD_URL = "https://testnet-api.algonode.cloud";

export function createAlgodClient(url: string = DEFAULT_ALGOD_URL, token: string = "") {
  return new algosdk.Algodv2(token, url, "");
}

export function microAlgosToAlgos(micro: number): number {
  return micro / 1_000_000;
}

export function algosToMicroAlgos(algos: number): number {
  return Math.round(algos * 1_000_000);
}



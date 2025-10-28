import { Router } from "express";
import algosdk from "algosdk";

const router = Router();

// Simple testnet client (can be overridden via env)
const ALGOD_URL = process.env.ALGOD_URL || "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || "";
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, "");

router.get("/wallet/:address/balance", async (req, res) => {
  try {
    const address = req.params.address;
    if (!address) return res.status(400).json({ error: "Address required" });

    const info = await algodClient.accountInformation(address).do();
    const micro = info.amount as number;
    const algo = micro / 1_000_000;
    return res.json({ address, microAlgos: micro, algos: algo });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch balance" });
  }
});

export default router;



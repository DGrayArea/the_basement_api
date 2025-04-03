"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dlmm_1 = require("../dlmm");
async function fetchLbPairLockInfoExample() {
    const poolAddress = new web3_js_1.PublicKey("9DiruRpjnAnzhn6ts5HGLouHtJrT1JGsPbXNYCrFz2ad");
    let rpc = process.env.RPC || "https://api.mainnet-beta.solana.com";
    const connection = new web3_js_1.Connection(rpc, "finalized");
    const dlmmPool = await dlmm_1.DLMM.create(connection, poolAddress, {
        cluster: "mainnet-beta",
    });
    const lbPairLockInfo = await dlmmPool.getLbPairLockInfo();
    console.log(lbPairLockInfo);
}
fetchLbPairLockInfoExample();

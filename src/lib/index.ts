import { Connection, Transaction } from "@solana/web3.js";
import { user } from "../examples/example";
import { config } from "dotenv";
import axios from "axios";

config();

export async function swapWithJupiter(
  connection: Connection,
  tokenAMint: string,
  tokenBMint: string,
  amount: string
) {
  const SIGNER_ACCOUNT = {
    pubkey: process.env.SIGNER_PUB_KEY,
    fBps: 100,
    fShareBps: 10000,
  };

  const wallet = user;
  try {
    // Step 1: Get swap quote with 1% fee
    const quoteResponse = await axios.get(
      `https://api.jup.ag/v1/quote?inputMint=${tokenAMint}&outputMint=${tokenBMint}&amount=${amount}&slippageBps=50&feeBps=100`
    );

    const response = await quoteResponse.data;
    // Step 2: Prepare swap transaction
    const swapResponse = await axios.post(
      "https://api.jup.ag/v1/swap",
      {
        response,
        userPublicKey: wallet.publicKey,
        referralAccount: SIGNER_ACCOUNT.pubkey,
        feeBps: SIGNER_ACCOUNT.fBps,
        feeShareBps: SIGNER_ACCOUNT.fShareBps,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Execute swap
    const swapTransaction = Transaction.from(
      Buffer.from(swapResponse.data.swapTransaction, "base64")
    );
    // const signedTx = await swapTransaction.sign(wallet);
    // const txid = await connection.sendRawTransaction(signedTx.serialize());
    // const latestBlockhash = await connection.getLatestBlockhash("finalized");
    // await connection.confirmTransaction(
    //   {
    //     signature: signedTx,
    //     blockhash: latestBlockhash.blockhash,
    //     lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //   },
    //   "finalized"
    // );

    // return txid;

    swapTransaction.sign(wallet); // For Keypair
    const txid = await connection.sendRawTransaction(
      swapTransaction.serialize()
    );

    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    await connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "finalized"
    );

    return txid;
  } catch (error) {
    console.error("Swap failed:", error);
    return { error: error };
  }
}

export const wSOl = "So11111111111111111111111111111111111111112";

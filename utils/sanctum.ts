import axios from "axios";
import  bs58  from "bs58";
import { VersionedTransaction } from "@solana/web3.js";
import { connection, admin, ADMIN_ACCOUNT_PUBKEY } from "./solana";
import { ADMIN_ACCOUNT } from "../config/config";
// import { SANCTUM_URI} from "../config/config";

export const SANCTUM_URI = "https://sanctum-s-api.fly.dev/v1/";

export const getQuote = async (
    inputMint: string,
    outputLstMint: string,
    amount: number
): Promise<number | undefined> => {
    try {
        const res = await axios.create({ baseURL: SANCTUM_URI }).get("swap/quote", {
            params: {
                input: inputMint,
                outputLstMint: outputLstMint,
                amount: amount.toString(),
                mode: "ExactIn",
                swapSrc: "Stakedex"
            },
        });
        console.log("Quote beginning------------------------------------->")
        console.log(res.data)
        console.log("Quote end------------------------------------------->")
        return res.data.outAmount;
    } catch (error) {
        return undefined;
    }
};

export const swapToLst = async (
    amount: number,
    input: string,
    outputLisMint: string,
    quotedAmount: number | undefined,
): Promise<boolean> => {
    try {
        const res = await axios.create({ baseURL: SANCTUM_URI }).post("swap", {
            amount: amount.toString(),
            dstLstAcc: null,
            input: input,
            mode: "ExactIn",
            outputLstMint: outputLisMint,
            priorityFee: {
                Auto: {
                    max_unit_price_micro_lamports: 1500000,
                    unit_limit: 100000
                },
            },
            quotedAmount: quotedAmount,
            signer: ADMIN_ACCOUNT,
            srcAcc: null,
            swapSrc: "Stakedex",
        });

        const rawTransaction = Buffer.from(res.data.tx, "base64");

        const transaction = VersionedTransaction.deserialize(rawTransaction);

        const { blockhash } = await connection.getLatestBlockhash();
        const transactionV0 = new VersionedTransaction(
            transaction.message
        );

        transactionV0.message.recentBlockhash = blockhash;

        transactionV0.sign([admin]);

        const signature = await connection.sendRawTransaction(
            transactionV0.serialize(),
            {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: "confirmed",
            }
        );

        console.log(signature);
        const sig = await connection.simulateTransaction(transactionV0);

        const tx = await connection.confirmTransaction(signature);
        console.log(tx);
        if (tx) console.log("LST swap is success")
        return true
    } catch (error) {
        console.log(error);
        return false
    }
};



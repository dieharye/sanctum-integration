import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION, ADMIN_ACCOUNT, HPL_TOKEN_MINT, EXCHANGE_RATE, JWT_SECRET } from '../config/config';
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import 'dotenv/config';


export const connection = new Connection(CONNECTION, 'confirmed');
export const ADMIN_ACCOUNT_PUBKEY = new PublicKey(ADMIN_ACCOUNT)

export const decodeBs58 = (encodedString: string) => {
  return new TextEncoder().encode(encodedString);
};

export const decodeBs64 = (encodedString: string) => {
  return Buffer.from(encodedString, 'base64');
};

export type SupportedEncoding = 'base58' | 'base64';

export const decodeTransaction = (
  encodedTransaction: string,
  encoding: SupportedEncoding = 'base64'
): Transaction => {
  switch (encoding) {
    case 'base58':
      return Transaction.from(decodeBs58(encodedTransaction));
    case 'base64':
      return Transaction.from(decodeBs64(encodedTransaction));
    default:
      throw new Error('Unsupported encoding format, base58 and base64 supported');
  }
};

export const adminSignAndConfirmTransaction = async (
  ADMIN_WALLET: NodeWallet,
  tx: Transaction
): Promise<{ confirmed: any; signature: string }> => {
  tx = await ADMIN_WALLET.signTransaction(tx);
  return confirmTransaction(tx);
};

export const confirmTransaction = async (tx: Transaction): Promise<{ confirmed: any; signature: string }> => {
  const sTx = tx.serialize();

  const options = {
    commitment: 'confirmed',
    skipPreflight: false,
  };

  const signature = await connection.sendRawTransaction(sTx, options);
  const confirmed = await connection.confirmTransaction(signature, 'confirmed');

  return { confirmed, signature };
};

export const getAdminBalance = async (address: string = ADMIN_ACCOUNT): Promise<number> => {
  const publicKey = new PublicKey(address);
  try {
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getPrice = async (): Promise<number | null> => {
  interface Pair {
    priceUsd: string;
  }

  interface Data {
    pairs: Pair[];
  }

  try {
    const response = await fetch(
      'https://api.dexscreener.io/latest/dex/tokens/So11111111111111111111111111111111111111112'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd);
      return isNaN(price) ? null : price;
    } else {
      throw new Error('No pairs data found');
    }
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return null;
  }
};

export const mintToken = async (address: string, amount: number): Promise<boolean> => {
  const tokenAmount = Math.floor(amount * EXCHANGE_RATE);
  const user = getKeypairFromEnvironment("SECRET_KEY");
  const tokenMintAccount = new PublicKey(HPL_TOKEN_MINT);
  const recipient = new PublicKey(address);
  console.log(user)
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      tokenMintAccount,
      recipient
    );

    const transactionSignature = await mintTo(
      connection,
      user,
      tokenMintAccount,
      tokenAccount.address,
      user.publicKey,
      tokenAmount
    );
    console.log(`Transaction Signature: ${transactionSignature}`);

    return true;
  } catch (error) {
    console.error('Error minting token:', error);
    return false;
  }
};

// Set up account change listener
export async function Hook() {
  let balance: number = Number(await getAdminBalance());
  const hook = connection.onAccountChange(ADMIN_ACCOUNT_PUBKEY, async (accountInfo, context) => {
    const signatures = await connection.getSignaturesForAddress(ADMIN_ACCOUNT_PUBKEY);
    const transaction = await connection.getTransaction(signatures[0].signature);
    const difference = accountInfo.lamports - balance;
    if (difference < 0) return
    balance = accountInfo.lamports;
    const signer: PublicKey | any = transaction?.transaction?.message.accountKeys[0]
    console.log(signer?.toBase58())

    // await mintToken(signer.toBase58(), balance)
  });
}
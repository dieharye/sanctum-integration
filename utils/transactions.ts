import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, TransactionInstruction } from '@solana/web3.js';
import { CONNECTION, ADMIN_ACCOUNT, HLP_TOKEN_MINT, ADMIN_HLP, FEE_RATE, TREASURY_WALLET } from '../config/config';
import { getOrCreateAssociatedTokenAccount, mintTo, burn } from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import 'dotenv/config';


export const connection = new Connection(CONNECTION, 'confirmed');
export const ADMIN_ACCOUNT_PUBKEY = new PublicKey(ADMIN_ACCOUNT);
export const ADMIN_HLP_PUBKEY = new PublicKey(ADMIN_HLP)
export const TREASURY_WALLET_PUBKEY = new PublicKey(TREASURY_WALLET)
const admin = getKeypairFromEnvironment("SECRET_KEY");


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
  tx: any
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

export const getAdminBalance = async (): Promise<number> => {
  const publicKey = new PublicKey(ADMIN_ACCOUNT);
  try {
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getAdminHLPToken = async (): Promise<number> => {
  const publicKey = new PublicKey(ADMIN_ACCOUNT);
  const HLP_MINT_PUBKEY = new PublicKey(HLP_TOKEN_MINT)
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ADMIN_ACCOUNT_PUBKEY, { mint: HLP_MINT_PUBKEY });
    const tokenAccount = tokenAccounts.value[0];
    const tokenBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;

    console.log(`Token Balance: ${tokenBalance}`);
    return tokenBalance;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export const getTotalHLP = async (): Promise<number> => {
  try {
    const address = new PublicKey(HLP_TOKEN_MINT);
    const { value: { amount } } = await connection.getTokenSupply(address);
    return Number(amount);
  } catch (error) {
    console.error(error);
    return 0;
  }
}

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

// Mint tokens to the ATA of the address of argument
export const mintToken = async (address: string, amount: number): Promise<boolean> => {
  const tokenAmount = amount
  const tokenMintAccount = new PublicKey(HLP_TOKEN_MINT);
  const recipient = new PublicKey(address);
  console.log("admin:", admin)
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      tokenMintAccount,
      recipient
    );

    console.log("tokenAccount:", tokenAccount)

    const transactionSignature = await mintTo(
      connection,
      admin,
      tokenMintAccount,
      tokenAccount.address,
      ADMIN_ACCOUNT_PUBKEY,
      tokenAmount
    );

    console.log(`Transaction Signature: ${transactionSignature}`);

    return true;
  } catch (error) {
    console.error('Error minting token:', error);
    return false;
  }
};

// Burn HPL token in the admin wallet
export const burnToken = async (address: string, amount: number): Promise<boolean> => {
  const tokenAmount = amount
  const tokenMintAccount = new PublicKey(HLP_TOKEN_MINT);
  const recipient = new PublicKey(address);
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      admin,
      tokenMintAccount,
      recipient
    );

    console.log(amount);
    const transactionSignature = await burn(
      connection,
      admin,
      tokenAccount.address,
      tokenMintAccount,
      recipient,
      tokenAmount
    );

    console.log(`Transaction Signature: ${transactionSignature}`);

    return true;
  } catch (error) {
    console.error('Error minting token:', error);
    return false;
  }
}

// Transfer SOL to address
export const transferSol = async (address: string, amount: number) => {
  const recipient = new PublicKey(address)
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: ADMIN_ACCOUNT_PUBKEY,
      toPubkey: recipient,
      lamports: amount
    })
  );
  try {
    const signature = await sendAndConfirmTransaction(connection, transferTransaction, [admin]);
    console.log(`${amount}lamports were transfered to ${address} signature: ${signature}`)
  } catch (error) {
    console.log(error)
  }
}

// Transfering fee to treasury wallet and burn equivalent HLP token
export const transferToTW = async (fee: number) => {
  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: ADMIN_ACCOUNT_PUBKEY,
      toPubkey: TREASURY_WALLET_PUBKEY,
      lamports: fee
    })
  );
  const totalHLP: Promise<number> | any = getTotalHLP();
  const totalSOL: Promise<number> | any = getAdminBalance();
  const hlpAmount = Math.floor(fee * totalHLP / totalSOL);
  try {
    const signature = await sendAndConfirmTransaction(connection, transferTransaction, [admin]);
    console.log(`${fee}lamports were transfered to ${TREASURY_WALLET} signature: ${signature}`)
    await burnToken(ADMIN_HLP, hlpAmount);
  } catch (error) {
    console.log(error)
  }
}

// Set up Admin SOL-account change listener
export async function solHook() {
  let balance: number = Number(await getAdminBalance());
  const hook = connection.onAccountChange(ADMIN_ACCOUNT_PUBKEY, async (accountInfo, context) => {
    const signatures = await connection.getSignaturesForAddress(ADMIN_ACCOUNT_PUBKEY);
    const transaction = await connection.getTransaction(signatures[0].signature);
    const difference = accountInfo.lamports - balance;
    if (difference <= 0) return
    balance = accountInfo.lamports;
    const signer: PublicKey | any = transaction?.transaction?.message.accountKeys[0]
    const amount = difference * (1 - FEE_RATE);
    const fee = difference * FEE_RATE;

    await mintToken(signer.toBase58(), amount);
    await transferToTW(fee);
  });
}

// Set up Admin HLP-account change listener
export async function hlpHook() {
  const hook = connection.onAccountChange(ADMIN_HLP_PUBKEY, async (accountInfo, context) => {
    const signatures = await connection.getSignaturesForAddress(ADMIN_HLP_PUBKEY);
    const transaction: any = await connection.getTransaction(signatures[0].signature);
    const difference = transaction?.meta.postTokenBalances[0].uiTokenAmount.uiAmount - transaction?.meta.preTokenBalances[0].uiTokenAmount.uiAmount

    if (difference <= 0) return
    const signer: PublicKey | any = transaction?.transaction?.message.accountKeys[0]
    const totalBalance: number = Number(await getAdminBalance());
    const totalSupply = await getTotalHLP();
    let amount = Math.floor(totalBalance * (difference / totalSupply));
    amount = amount * (1 - FEE_RATE);
    const fee = amount * FEE_RATE

    await burnToken(ADMIN_HLP, difference);
    await transferToTW(fee) //This operation should be prior to transferSol operation
    await transferSol(signer, amount);
  });
}
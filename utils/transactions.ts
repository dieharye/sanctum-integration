import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { CONNECTION, ADMIN_ACCOUNT } from '../config/config';

export const connection = new Connection(CONNECTION, 'confirmed');

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
) => {
  if (encoding === 'base58') {
    return Transaction.from(decodeBs58(encodedTransaction));
  } else if (encoding === 'base64') {
    return Transaction.from(decodeBs64(encodedTransaction));
  } else {
    throw new Error('Unsupported encoding format, base58 and base64 supported');
  }
};

export const adminSignAndConfirmTransaction = async (
  ADMIN_WALLET: NodeWallet,
  tx: Transaction
) => {
  // Sign the transaction with admin's Keypair
  tx = await ADMIN_WALLET.signTransaction(tx);

  return confirmTransaction(tx);
};

export const confirmTransaction = async (tx: Transaction) => {
  const sTx = tx.serialize();

  // Send the raw transaction
  const options = {
    commitment: 'confirmed',
    skipPreflight: false,
  };

  // Confirm the transaction
  const signature = await connection.sendRawTransaction(sTx, options);
  const confirmed = await connection.confirmTransaction(signature, 'confirmed');

  return { confirmed, signature };
};

export const getAdminBalance = async (address: string = ADMIN_ACCOUNT): Promise<number> => {
  const connection = new Connection(CONNECTION, "confirmed");
  const publicKey = new PublicKey(address);
  try {
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.log(error);
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
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Connection, Transaction } from '@solana/web3.js';
import { CONNECTION } from '../config/config';

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

import { sign } from 'tweetnacl';
import * as bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

import { SIGN_MESSAGE } from '../config/config';

export const validateEd25519Address = (address: string) => {
  try {
    const isValidAddress = PublicKey.isOnCurve(address);
    if (isValidAddress) return true;
    else return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const verifySignature = (
  address: string,
  nonce: string,
  signature: string
) => {
  try {
    const message = `${SIGN_MESSAGE} : ${nonce}`;
    return sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(address)
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

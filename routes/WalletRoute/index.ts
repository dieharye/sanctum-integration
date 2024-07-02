import { Router } from 'express';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { authMiddleware, AuthRequest } from '../../middleware';
import User from '../../model/UserModel';

// Create a new instance of the Express Router
const WalletRouter = Router();

// // Helper function to get user wallet details
// export const getUserWallet = async (userId: string) => {
//   const user = await User.findById(userId);
//   return {
//     exist: !!user?.mnemonic,
//     mnemonic: user?.mnemonic || '',
//   };
// };

// // @route    POST api/wallet/connect
// // @desc     Connect wallet
// // @access   Private
// WalletRouter.post('/connect', authMiddleware, async (req: AuthRequest, res) => {
//   try {
//     const { id: userId } = req.user;
//     const { chainId } = req.body;
//     const { exist, mnemonic } = await getUserWallet(userId);
//     if (exist) {
//       const walletDetail = getAccountDetails(mnemonic);
//       res.json({
//         mnemonic: mnemonic,
//         address: walletDetail,
//       });
//     } else {
//       res.json({ error: "Wallet doesn't exist" });
//     }
//   } catch (error: any) {
//     console.error(error);
//     return res.status(400).json({ error: error.message });
//   }
// });

// // @route    POST api/wallet/create
// // @desc     Create new wallet
// // @access   Private
// WalletRouter.post('/create', authMiddleware, async (req: AuthRequest, res) => {
//   try {
//     const { id: userId } = req.user;
//     const { exist } = await getUserWallet(userId);
//     if (exist) {
//       return res.status(400).json({ error: 'Wallet is already exist' });
//     } else {
//       const mnemonic = generateMnemonic();
//       await User.findByIdAndUpdate(userId, { tempMnemonic: mnemonic });
//       res.json({ phrase: mnemonic });
//     }
//   } catch (error: any) {
//     console.error(error);
//     return res.status(400).json({ error: error.msg });
//   }
// });

// // @route    POST api/wallet/import
// // @desc     Import wallet
// // @access   Private
// WalletRouter.post('/import', authMiddleware, async (req: AuthRequest, res) => {
//   try {
//     const { id: userId, chainId } = req.user;
//     const { mnemonic } = req.body;
//     const { exist } = await getUserWallet(userId);
//     if (exist) {
//       return res.status(400).json({ error: 'Wallet is already exist' });
//     } else {
//       if (!mnemonic) {
//         return res.status(400).json({ error: 'No mnemonic phrase provided' });
//       }
//       const valid = validateMnemonic(mnemonic);
//       if (valid) {
//         await User.findByIdAndUpdate(userId, { mnemonic });
//         res.json({
//           msg: 'success',
//         });
//       } else {
//         return res.status(427).json({ error: 'Invalid mnemonic' });
//       }
//     }
//   } catch (e: any) {
//     console.error(e);
//     return res.status(400).json({ error: e.msg });
//   }
// });

// // @route    POST api/wallet/verify
// // @desc     Verify wallet
// // @access   Private
// WalletRouter.post('/verify', authMiddleware, async (req: AuthRequest, res) => {
//   try {
//     const { id: userId } = req.user;
//     const { mnemonic } = req.body;
//     const { exist } = await getUserWallet(userId);
//     if (exist) {
//       return res.status(400).json({ error: 'Wallet is already exist' });
//     } else {
//       const result = await User.findById(userId);
//       if (!result?.tempMnemonic) {
//         return res
//           .status(400)
//           .json({ error: "You didn't create any wallet yet" });
//       } else if (result?.tempMnemonic == mnemonic) {
//         await User.findByIdAndUpdate(userId, { mnemonic, tempMnemonic: '' });
//         res.json({
//           msg: 'success',
//         });
//       } else {
//         return res.status(400).json({
//           error: 'Verify failed',
//           mnemonic: result?.tempMnemonic,
//         });
//       }
//     }
//   } catch (e: any) {
//     console.error(e);
//     return res.status(400).json({ error: e.msg });
//   }
// });

// Export the router for use in other parts of the application
export default WalletRouter;

// @ts-nocheck
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware';
import User, { UserRole } from '../../model/UserModel';
import { getUserWallet } from '../WalletRoute';

// Create a new instance of the Express Router
const AdminRouter = Router();

const checkAdmin = async (id: string) => {
  const result = await User.findOne({ _id: id, role: UserRole.Admin });
  if (result) return true;
  else false;
};

// @route    POST api/contract/setrole
// @desc     set manager role
// @access   Private
AdminRouter.post('/setrole', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { walletAddress, isManager } = req.body;
    const { id: adminId } = req.user;
    if (checkAdmin(adminId)) {
      const user = await User.findOne({ walletAddress });
      if (user) {
        await User.updateOne(
          { walletAddress },
          {
            role:
              isManager === UserRole.Manager ? UserRole.Manager : UserRole.User,
          }
        );
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Wallet doesn't exist" });
      }
    } else {
      console.log('Not admin');
      return res.status(200).json({ error: 'No admin' });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: error.reason || 'Error assigning manager role.' });
  }
});

// @route    POST api/contract/withdraw
// @desc     withdraw
// @access   Private
AdminRouter.post('/withdraw', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { amount, chainId } = req.body;
    const { id: userId } = req.user;
    if (checkAdmin(userId)) {
      const { exist, mnemonic } = await getUserWallet(userId);
      if (exist) {
        const infuraUrl = infura(chainId);
        const web3 = new Web3(infuraUrl);

        try {
          const gasPrice = await web3.eth.getGasPrice();
          console.log(`gasPrice ${gasPrice}`);
          console.log('amount->', amount);
          const privatekey = process.env.PRIVATE_KEY;
          const publickey = web3.eth.accounts.privateKeyToAccount(
            privatekey!
          ).address;
          const approveTxData = contract.methods.withdraw(amount).encodeABI();
          const approveTxObj = {
            from: publickey,
            to: contract.options.address,
            data: approveTxData,
          };
          const approveGas = await web3.eth.estimateGas(approveTxObj);
          console.log(`approveGas ${approveGas}`);

          const approveTx = await web3.eth.accounts.signTransaction(
            { ...approveTxObj, gas: approveGas, gasPrice },
            privatekey!
          );

          const rept = await web3.eth.sendSignedTransaction(
            approveTx.rawTransaction
          );

          console.log(`transaction ${rept.transactionHash} is occurred`);

          if (rept.status.toString() === '1') {
            console.log(`Withdraw successfully`);

            res.json({ amount });
          } else {
            console.log(`Withdraw transaction failed`);
            return res.status(400).json({ err: 'Withdraw transaction failed' });
          }
        } catch (e: any) {
          console.error(e);
          res
            .status(200)
            .json({ err: e.reason || 'Error creating stake transaction.' });
        }
      } else {
        return res.status(400).json({ error: "Wallet doesn't exist" });
      }
    } else {
      console.log('No admin');
      res.json({ error: 'No admin' });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(200)
      .json({ error: error.reason || 'Error creating stake transaction.' });
  }
});

// @route    POST api/contract/deposit
// @desc     deposit
// @access   Private
AdminRouter.post('/deposit', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { amount, chainId } = req.body;
    const { id: userId } = req.user;
    if (checkAdmin(userId)) {
      const { exist, mnemonic } = await getUserWallet(userId);
      if (exist) {
        const infuraUrl = infura(chainId);
        const web3 = new Web3(infuraUrl);

        try {
          const gasPrice = await web3.eth.getGasPrice();
          console.log(`gasPrice ${gasPrice}`);
          console.log('amount->', amount);
          const privatekey = process.env.PRIVATE_KEY;
          const publickey = web3.eth.accounts.privateKeyToAccount(
            privatekey!
          ).address;
          const approveTxData = contract.methods.deposit(amount).encodeABI();
          const approveTxObj = {
            from: publickey,
            to: contract.options.address,
            data: approveTxData,
          };
          const approveGas = await web3.eth.estimateGas(approveTxObj);
          console.log(`approveGas ${approveGas}`);

          const approveTx = await web3.eth.accounts.signTransaction(
            { ...approveTxObj, gas: approveGas, gasPrice },
            privatekey!
          );

          const rept = await web3.eth.sendSignedTransaction(
            approveTx.rawTransaction
          );

          console.log(`transaction ${rept.transactionHash} is occurred`);

          if (rept.status.toString() === '1') {
            console.log(`Deposit successfully`);

            res.json({ amount });
          } else {
            console.log(`Deposit transaction failed`);
            return res.status(400).json({ err: 'Deposit transaction failed' });
          }
        } catch (e: any) {
          console.error(e);
          return res
            .status(400)
            .json({ err: e.reason || 'Error creating stake transaction.' });
        }
      } else {
        return res.status(400).json({ error: "Wallet doesn't exist" });
      }
    } else {
      console.log('No admin');
      return res.status(400).json({ error: 'No admin' });
    }
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error.reason || 'Error creating stake transaction.' });
  }
});

// @route    POST api/contract/setstakingperiod
// @desc     setstakingperiod
// @access   Private
AdminRouter.post(
  '/setstakingperiod',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { amount, chainId } = req.body;
      const { id: userId } = req.user;
      if (checkAdmin(userId)) {
        const { exist, mnemonic } = await getUserWallet(userId);
        if (exist) {
          const infuraUrl = infura(chainId);
          const web3 = new Web3(infuraUrl);

          try {
            const gasPrice = await web3.eth.getGasPrice();
            console.log(`gasPrice ${gasPrice}`);
            console.log('amount->', amount);
            const privatekey = process.env.PRIVATE_KEY;
            const publickey = web3.eth.accounts.privateKeyToAccount(
              privatekey!
            ).address;
            const approveTxData = contract.methods
              .setPeriod(amount)
              .encodeABI();
            const approveTxObj = {
              from: publickey,
              to: contract.options.address,
              data: approveTxData,
            };
            const approveGas = await web3.eth.estimateGas(approveTxObj);
            console.log(`approveGas ${approveGas}`);

            const approveTx = await web3.eth.accounts.signTransaction(
              { ...approveTxObj, gas: approveGas, gasPrice },
              privatekey!
            );

            const rept = await web3.eth.sendSignedTransaction(
              approveTx.rawTransaction
            );

            console.log(`transaction ${rept.transactionHash} is occurred`);

            if (rept.status.toString() === '1') {
              console.log(`set fee successfully`);

              //   hash: rept.transactionHash,
              //   action: "stake",
              //   amount,
              //   chainId,
              //   id: userId,
              //   count: results[0][1],
              //   duration: results[0][4],
              // });
              // await tx.save();
              res.json({ amount });
            } else {
              console.log(`Set stakingperiod transaction failed`);
              return res
                .status(400)
                .json({ err: 'Set stakingperiod transaction failed' });
            }
          } catch (e: any) {
            console.error(e);
            return res
              .status(400)
              .json({ err: e.reason || 'Error creating stake transaction.' });
          }
        } else {
          return res.status(400).json({ error: "Wallet doesn't exist" });
        }
      } else {
        console.log('No admin');
        return res.status(400).json({ error: 'No admin' });
      }
    } catch (error: any) {
      console.error(error);
      return res
        .status(400)
        .json({ error: error.reason || 'Error creating stake transaction.' });
    }
  }
);

// @route    POST api/contract/setclaimperiod
// @desc     setclaimperiod
// @access   Private
AdminRouter.post(
  '/setclaimperiod',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { amount, chainId } = req.body;
      const { id: userId } = req.user;
      if (checkAdmin(userId)) {
        const { exist, mnemonic } = await getUserWallet(userId);
        if (exist) {
          const infuraUrl = infura(chainId);
          const web3 = new Web3(infuraUrl);

          try {
            const gasPrice = await web3.eth.getGasPrice();
            console.log(`gasPrice ${gasPrice}`);
            console.log('amount->', amount);
            const privatekey = process.env.PRIVATE_KEY;
            const publickey = web3.eth.accounts.privateKeyToAccount(
              privatekey!
            ).address;
            const approveTxData = contract.methods
              .setClaimLockPeriod(amount)
              .encodeABI();
            const approveTxObj = {
              from: publickey,
              to: contract.options.address,
              data: approveTxData,
            };
            const approveGas = await web3.eth.estimateGas(approveTxObj);
            console.log(`approveGas ${approveGas}`);

            const approveTx = await web3.eth.accounts.signTransaction(
              { ...approveTxObj, gas: approveGas, gasPrice },
              privatekey!
            );

            const rept = await web3.eth.sendSignedTransaction(
              approveTx.rawTransaction
            );

            console.log(`transaction ${rept.transactionHash} is occurred`);

            if (rept.status.toString() === '1') {
              console.log(`set claimperiod successfully`);
              res.json({ amount });
            } else {
              console.log(`Set claimperiod transaction failed`);
              return res
                .status(400)
                .json({ err: 'Set claimperiod transaction failed' });
            }
          } catch (e: any) {
            console.error(e);
            return res
              .status(400)
              .json({ err: e.reason || 'Error creating stake transaction.' });
          }
        } else {
          return res.status(400).json({ error: "Wallet doesn't exist" });
        }
      } else {
        console.log('No admin');
        return res.status(400).json({ error: 'No admin' });
      }
    } catch (error: any) {
      console.error(error);
      return res
        .status(200)
        .json({ error: error.reason || 'Error creating stake transaction.' });
    }
  }
);

// @route    POST api/contract/addhistory
// @desc     add trading history
// @access   Private
AdminRouter.post(
  '/addhistory',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { amount, chainId } = req.body;
      const { id: userId } = req.user;
      if (checkAdmin(userId)) {
        const { exist, mnemonic } = await getUserWallet(userId);
        if (exist) {
          try {
          } catch (e: any) {
            console.error(e);
            return res
              .status(400)
              .json({ err: e.reason || 'Error creating stake transaction.' });
          }
        } else {
          return res.status(400).json({ error: "Wallet doesn't exist" });
        }
      } else {
        console.log('No admin');
        return res.status(400).json({ error: 'No admin' });
      }
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.reason || 'Error creating stake transaction.' });
    }
  }
);

// Export the router for use in other parts of the application
export default AdminRouter;

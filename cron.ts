import { CronJob } from 'cron';
// import { infura } from "./routes/ContractRoute/contract";
// import Web3 from "web3";
// import UserModel from "./model/UserModel";
// import { getAccountDetails } from "./routes/WalletRoute/wallet";
// import stakingModel from "./model/StakingModel";
// import TxModel from "./model/TxModel";

const cronjob = new CronJob(
  '*/1 * * * *', // cronTime
  async function () {
    console.log('croning');
    // const users = await UserModel.find({})
    // await Promise.all(users.map(async (item) => {
    //   for (let chainId = 0; chainId < 4; chainId++) {
    //     // chainid
    //     if (chainId == 3) break;
    //     // console.log(`start`)
    //     const infuraUrl = infura(chainId)
    //     const web3 = new Web3(infuraUrl);
    //     // console.log(`${chainId} chainid`)
    //     if (item.mnemonic) {
    //       const address = getAccountDetails(item.mnemonic).eth_wallet_address
    //       // console.log(`address ${address}`)
    //       // @ts-ignore
    //       const result: [] = await contract.methods.calcBenefit(address).call();
    //       // @ts-ignore
    //       const stakeInfo: [] = await contract.methods.getUserStakeInfo(address).call();
    //       // console.log(`result -> ${result}`)
    //       result.map(async (tx, index) => {
    //         // console.log("tx", tx)
    //         // @ts-ignore
    //         if (stakeInfo != undefined) await stakingModel.findOneAndUpdate({ chainId, userId: item._id, count: index }, { reward: String(tx), amount: String(stakeInfo[2][index]), claimTime: Number(stakeInfo[1][index]), date: Number(stakeInfo[0][index]), unstaken: Boolean(stakeInfo[4][index]) })
    //         await TxModel.findOneAndUpdate({ action: 'stake', chainId, userId: item._id, count: index }, { reward: String(tx) })
    //       })
    //       // console.log(`end`)
    //     }
    //   }
    // }))
  }
);

export default cronjob;

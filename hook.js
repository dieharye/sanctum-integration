import * as web3 from '@solana/web3.js'

const connection = new web3.Connection("https://devnet.helius-rpc.com/?api-key=44b7171f-7de7-4e68-9d08-eff1ef7529bd")
const publicKey = new web3.PublicKey("4Y2QYrRGYonzy8R3fJ4cmLXies6q6tLFJF7ThNFbWfwx")

const handleAccountChange = (accountInfo) => {
    console.log('Account data changed:', accountInfo);
    // You can update your UI or perform other actions based on the new account data
};

// Listen for changes to the account
const subscriptionId = connection.onAccountChange(publicKey, (accountInfo) => {
    handleAccountChange(accountInfo);
});
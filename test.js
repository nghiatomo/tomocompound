const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const PrivateKeyProvider = require('truffle-privatekey-provider')
const TRC21Abi = require('./abis/TRC21.json')
const WhitePaperInterestRateModelAbi = require('./abis/WhitePaperInterestRateModel.json')
const SimplePriceOracleAbi = require('./abis/SimplePriceOracle.json')
const CompTrollerAbi = require('./abis/CompTroller.json')
const CErc20ImmutableAbi = require('./abis/CErc20Immutable.json')

const pkey = 'b3df7f4716b9f1e19bcc0c8e69cfb6d4cff89d610c894be4604fcad46fb72069'
const network = 'https://rpc.devnet.tomochain.com'

async function run () {
    try {
        if (pkey === '') {
            throw new Error("pkey is required")
        }
        const walletProvider = new PrivateKeyProvider(
            pkey,
            network
        )
        const web3 = new Web3(walletProvider)
        const account = (await web3.eth.getAccounts())[0]
        const contract = new web3.eth.Contract(
            CErc20ImmutableAbi.abi,
            '0x55E3F8500FE61Ea4a9d4016f46f13603De398B00'
        )
        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(4000000),
            gasPrice: web3.utils.toHex(250000000)
        }
        contract.methods.mint(
            100000000
        ).send(txParams)
        .on('error', (error) => console.log(error))
        .on('transactionHash', (hash) => console.log(hash))
    } catch (error) {
        throw error
    }
}
run()
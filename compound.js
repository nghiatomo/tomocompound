const Web3 = require('web3')
const path = require('path')
const fs = require('fs')
const BigNumber = require('bignumber.js')
const solc = require('solc')
const PrivateKeyProvider = require('truffle-privatekey-provider')

const TRC21Abi = require('./abis/TRC21.json')
const WhitePaperInterestRateModelAbi = require('./abis/WhitePaperInterestRateModel.json')
const SimplePriceOracleAbi = require('./abis/SimplePriceOracle.json')
const CompTrollerAbi = require('./abis/CompTroller.json')
const CErc20ImmutableAbi = require('./abis/CErc20Immutable.json')
const CompAbi = require('./abis/Comp.json')

const pkey = 'b3df7f4716b9f1e19bcc0c8e69cfb6d4cff89d610c894be4604fcad46fb72069'
const network = 'https://rpc.devnet.tomochain.com'


const comptrollerContract = "0xb68797543F93b8E26fFe4329eBF6977F2D3E022a"

const walletProvider = new PrivateKeyProvider(
    pkey,
    network
)
const web3 = new Web3(walletProvider)

async function getMarkets(){
    try {
        const comptroller = new web3.eth.Contract(
            CompTrollerAbi.abi,
            comptrollerContract
        )
        let markets = await comptroller.methods.getAllMarkets().call()
        console.log("getMarkets", markets)
        for (var i in markets) {
            cerc = new web3.eth.Contract(
                CErc20ImmutableAbi.abi,
                markets[i]
            )
            
        }

    } catch (error) {
        console.log(error)
    }
}

getMarkets()
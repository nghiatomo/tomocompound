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

const wbtcContractAddress = "0x48865d633C0241d26B8fb8615876E85CEb0DD2DC"
const cBtcContractAddress = "0x874f50f239124E4eE76B994Ae87A5d9481524199"


const wSOLContractAddress = "0x27f54377f2a27BeA283C546C83A29bD2a229B781"
const cSOLContractAddress = "0x2525F0A9448e4e26EAa5F7f35f245c1777a9C372"

const comptrollerContract = "0xb68797543F93b8E26fFe4329eBF6977F2D3E022a"

const walletProvider = new PrivateKeyProvider(
    pkey,
    network
)
const web3 = new Web3(walletProvider)


async function mint(underlyingTokenAddress, cTokenAddress, amount){
    try {
        const account = (await web3.eth.getAccounts())[0]
        const trc21Contract = new web3.eth.Contract(
            TRC21Abi.abi,
            underlyingTokenAddress
        )
        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(2000000),
            gasPrice: web3.utils.toHex(250000000)
        }

        console.log('approve transfer')
        const am = new BigNumber(amount).multipliedBy(10 ** 18).toString(10)
        await trc21Contract.methods.approve(cTokenAddress, am).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('approve transfer', txHash)
                }
            }
        }).catch(e => { throw e })


        const cTokenContract = new web3.eth.Contract(
            CErc20ImmutableAbi.abi,
            cTokenAddress
        )

        console.log('mint token')
        const nonce = await web3.eth.getTransactionCount(account)
        txParams.nonce = nonce
        await cTokenContract.methods.mint(am).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('mint token hash', txHash)
                }
                
            }
        }).catch(e => { throw e })
    } catch (error) {
        console.log(error)
    }


}

async function borrow(underlyingTokenAddress, cTokenAddress, amount){
    try {
        const account = (await web3.eth.getAccounts())[0]
        const trc21Contract = new web3.eth.Contract(
            TRC21Abi.abi,
            underlyingTokenAddress
        )
        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(2000000),
            gasPrice: web3.utils.toHex(250000000)
        }

        console.log('borrow underlying token')
        const am = new BigNumber(amount).multipliedBy(10 ** 18).toString(10)
        let balance = await trc21Contract.methods.balanceOf(account).call()
        console.log("blanceOf befor browing", account, new BigNumber(balance).div(10 ** 18).toString(10))


        const cTokenContract = new web3.eth.Contract(
            CErc20ImmutableAbi.abi,
            cTokenAddress
        )

        console.log('borrow underlying')
        const nonce = await web3.eth.getTransactionCount(account)
        txParams.nonce = nonce
        await cTokenContract.methods.borrow(am).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('borrow underlying hash', txHash)
                }
                
            }
        }).catch(e => { throw e })

        balance = await trc21Contract.methods.balanceOf(account).call()
        console.log("blanceOf after browing", account, new BigNumber(balance).div(10 ** 18).toString(10))

    } catch (error) {
        console.log(error)
    }


}

async function getBorrowBalance(cTokenAddress, account){
    try {
        const cTokenContract = new web3.eth.Contract(
            CErc20ImmutableAbi.abi,
            cTokenAddress
        )
        console.log('borrow balance')
        let balance = await cTokenContract.methods.borrowBalanceStored(account).call()
        console.log("borrow balance", account, new BigNumber(balance).div(10 ** 18).toString(10))

    } catch (error) {
        console.log(error)
    }
}

async function getHypotheticalAccountLiquidity(account, cTokenModify, redeemTokens, borrowAmount){
    try {
        const comptroller = new web3.eth.Contract(
            CompTrollerAbi.abi,
            comptrollerContract
        )
        console.log('getAccountLiquidity')
        let balance = await comptroller.methods.getHypotheticalAccountLiquidity(account, cTokenModify, redeemTokens, borrowAmount).call()
        console.log("getAccountLiquidity", account, balance)

    } catch (error) {
        console.log(error)
    }
}

//mint(wbtcContractAddress, cBtcContractAddress, 10)
//mint(wSOLContractAddress, cSOLContractAddress, 10)
//borrow(wSOLContractAddress, cSOLContractAddress, 5)

//getBorrowBalance(cSOLContractAddress, "0x2fAdA4DeB166348B99C19d108A2d287eEe03b6b8")

getHypotheticalAccountLiquidity("0x2fAdA4DeB166348B99C19d108A2d287eEe03b6b8", cSOLContractAddress, 0, new BigNumber(2).multipliedBy(10 ** 18).toString(10))
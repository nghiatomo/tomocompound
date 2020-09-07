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


const comptrollerContract = "0xe03f5d2e28840F94768abbF61F2B611c52Fa7330"

const wbtcContractAddress = "0x1dfc540d362AAe952CD3987c6f00673baC5A575c"
const cBtcContractAddress = "0x1c14825Ded3E21480ba3F6912FdaE0aDa96131c7"


const wUSDTContractAddress = "0x512b254BaE1334cf3bb0D695dae2250DC7f5db2a"
const cUSDTContractAddress = "0x850927fAbe09E8B53eEc15dF879DBf85FDD98c8E"



const walletProvider = new PrivateKeyProvider(
    pkey,
    network
)
const web3 = new Web3(walletProvider)

SCALABILITY = 10 ** 18
BLOCKSPERYEAR = 15768000

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

async function enterMarket(cTokenAddress){
    const comptroller = new web3.eth.Contract(
        CompTrollerAbi.abi,
        comptrollerContract
    )
    const account = (await web3.eth.getAccounts())[0]
    const txParams = {
        from: account.toLowerCase(),
        gas: web3.utils.toHex(4000000),
        gasPrice: web3.utils.toHex(250000000)
    }

    console.log('enterMarket')
    await comptroller.methods.enterMarkets([cTokenAddress]).send(txParams)
    .on('transactionHash', async (txHash) => {
        let check = true
        while (check) {
            const receipt = await web3.eth.getTransactionReceipt(txHash)
            if (receipt) {
                check = false
                console.log('enterMarket', txHash)
            }
        }
    })
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
        const a = await cTokenContract.methods.borrow(am).send(txParams)
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


async function repayBorrow(underlyingTokenAddress, cTokenAddress, amount){
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

        console.log('repay underlying token')
        const am = new BigNumber(amount).multipliedBy(10 ** 18).toString(10)
        let balance = await trc21Contract.methods.balanceOf(account).call()
        console.log("blanceOf befor repay", account, new BigNumber(balance).div(10 ** 18).toString(10))


        const cTokenContract = new web3.eth.Contract(
            CErc20ImmutableAbi.abi,
            cTokenAddress
        )

        console.log('repay underlying')
        const nonce = await web3.eth.getTransactionCount(account)
        txParams.nonce = nonce
        const a = await cTokenContract.methods.repay(am).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('repay underlying hash', txHash)
                }
                
            }
        }).catch(e => { throw e })

        balance = await trc21Contract.methods.balanceOf(account).call()
        console.log("blanceOf after repay underlying", account, new BigNumber(balance).div(10 ** 18).toString(10))

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
        let balance = await cTokenContract.methods.borrowBalanceStored(account).call()
        return balance
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
        return balance

    } catch (error) {
        console.log(error)
    }
}

async function getMarkets(){
    try {
        const account = (await web3.eth.getAccounts())[0]
        const comptroller = new web3.eth.Contract(
            CompTrollerAbi.abi,
            comptrollerContract
        )
        let markets = await comptroller.methods.getAllMarkets().call()
        for (var i in markets) {
            cerc = new web3.eth.Contract(
                CErc20ImmutableAbi.abi,
                markets[i]
            )
            underlying = await cerc.methods.underlying().call()
            const trc21 = new web3.eth.Contract(
                TRC21Abi.abi,
                underlying
            )
            symbol = await trc21.methods.symbol().call()
            
            borrowRatePerBlock = await cerc.methods.borrowRatePerBlock().call()
            supplyRatePerBlock = await cerc.methods.supplyRatePerBlock().call()
            exchangeRateStored = await cerc.methods.exchangeRateStored().call()
            cTokenBalance = await cerc.methods.balanceOf(account).call()
            
            borrowRatePerYear = borrowRatePerBlock * BLOCKSPERYEAR / SCALABILITY
            supplyRatePerYear = supplyRatePerBlock * BLOCKSPERYEAR / SCALABILITY
            supplyBalance = cTokenBalance * exchangeRateStored / SCALABILITY
            borrowBalance = await getBorrowBalance(markets[i], account)
            console.log("Symbol", symbol, "cTokenBalance", cTokenBalance, "supplyBalance", supplyBalance, 
                "borrowBalance", borrowBalance, "borrowRatePerYear", borrowRatePerYear, "supplyRatePerYear", supplyRatePerYear)
            
        }
    } catch (error) {
        console.log(error)
    }
}

//mint(wbtcContractAddress, cBtcContractAddress, 10)
//enterMarket(cBtcContractAddress)
//borrow(wUSDTContractAddress, cUSDTContractAddress, 1000)
borrow(wbtcContractAddress, cBtcContractAddress, 1)
//repayBorrow(wbtcContractAddress, cBtcContractAddress, 1)
//getMarkets()
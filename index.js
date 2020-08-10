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


const pkey = ''
const network = 'https://rpc.devnet.tomochain.com'

function createContract (contractName) {
    try {
        const p = path.resolve(__dirname, './contracts', `${contractName.toString()}.sol`)
        const contractCode = fs.readFileSync(p, 'UTF-8')
        return contractCode
    } catch (error) {
        throw error
    }
}

function compileContract (contractCode, contractName) {
    try {
        const compiledContract = solc.compile(contractCode, 0)

        const contract = compiledContract.contracts[contractName.toString()] ||
            compiledContract.contracts[':' + contractName.toString()]
        return contract
    } catch (error) {
        throw error
    }
}

async function deployTRC21Contract (
    trcContract,
    web3,
    token
) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })
            await TRC21Contract.deploy({
                arguments: [
                    token.name,
                    token.symbol,
                    token.decimals
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(4000000),
                gasPrice: web3.utils.toHex(10000000000000)
            })
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            const contractAddress = receipt.contractAddress
                            return resolve(contractAddress)
                        }
                    }
                })
        } catch (error) {
            return reject(error)
        }
    })
}

async function deployInterestRateContract (
    trcContract,
    web3,
    token
) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })
            await TRC21Contract.deploy({
                arguments: [
                    token.baseRatePerYear,
                    token.multiplierPerYear
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(4000000),
                gasPrice: web3.utils.toHex(10000000000000)
            })
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            const contractAddress = receipt.contractAddress
                            return resolve(contractAddress)
                        }
                    }
                })
        } catch (error) {
            return reject(error)
        }
    })
}

async function deployNoArgContract (
    trcContract,
    web3,
    token
) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })
            await TRC21Contract.deploy().send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(7000000),
                gasPrice: web3.utils.toHex(10000000000000)
            })
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            const contractAddress = receipt.contractAddress
                            return resolve(contractAddress)
                        }
                    }
                })
        } catch (error) {
            return reject(error)
        }
    })
}

async function deployCERCContract (
    trcContract,
    web3,
    token
) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })
            await TRC21Contract.deploy({
                arguments: [
                    token.underlying,
                    token.comptroller,
                    token.interestRateModel,
                    token.initialExRate,
                    token.name,
                    token.symbol,
                    token.decimals,
                    token.admin
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(7000000),
                gasPrice: web3.utils.toHex(10000000000000)
            })
                .on('error', (error) => {
                    return reject(error)
                })
                .on('transactionHash', async (txHash) => {
                    let check = true
                    while (check) {
                        const receipt = await web3.eth.getTransactionReceipt(txHash)
                        if (receipt) {
                            check = false
                            const contractAddress = receipt.contractAddress
                            return resolve(contractAddress)
                        }
                    }
                })
        } catch (error) {
            return reject(error)
        }
    })
}

async function deploy (name, symbol, decimals) {
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
        // ----------------------------------------------------------------
        console.log('Deploying contract TRC21')

        const trcContract = {
            abi: TRC21Abi.abi, bytecode: TRC21Abi.bytecode
        }
        const trc21 = {
            name, symbol, decimals
        }
        const trc21ContractAddress = await deployTRC21Contract(
            trcContract,
            web3,
            trc21
        )
        console.log('trc21ContractAddress', trc21ContractAddress)
        // --------------------------------------------------------------------

        console.log('Deploying WhitePaperInterestRateModel')

        const interestRateContract = {
            abi: WhitePaperInterestRateModelAbi.abi,
            bytecode: WhitePaperInterestRateModelAbi.bytecode
        }
        const data = {
            baseRatePerYear: new BigNumber(0.05).multipliedBy(10 ** 18).toString(10),
            multiplierPerYear: new BigNumber(0.15).multipliedBy(10 ** 18).toString(10)
        }
        const interestRateContractAddress = await deployInterestRateContract(
            interestRateContract,
            web3,
            data
        )
        console.log('interestRateContractAddress', interestRateContractAddress)
        // --------------------------------------------------------------------------

        console.log('Deploying SimplePriceOracle contract')

        const simpleOracleContract = {
            abi: SimplePriceOracleAbi.abi,
            bytecode: SimplePriceOracleAbi.bytecode
        }
        const simpleOracleContractAddress = await deployNoArgContract(
            simpleOracleContract,
            web3
        )
        console.log('simpleOracleContractAddress', simpleOracleContractAddress)
        // ---------------------------------------------------------------------------

        console.log('Deploying CompTroller')

        const compContract = {
            abi: CompTrollerAbi.abi,
            bytecode: CompTrollerAbi.bytecode
        }
        const compContractAddress = await deployNoArgContract(
            compContract,
            web3
        )
        console.log('compContractAddress', compContractAddress)
        // -----------------------------------------------------------------------------
        
        console.log('Deploying CErc20Immutable')

        const cercContract = {
            abi: CErc20ImmutableAbi.abi,
            bytecode: CErc20ImmutableAbi.bytecode
        }
        const data1 = {
            underlying: trc21ContractAddress,
            comptroller: compContractAddress,
            interestRateModel: interestRateContractAddress,
            initialExRate: new BigNumber(2).multipliedBy(10 ** 17).toString(10),
            name: 'c' + name,
            symbol: 'c' + symbol,
            decimals: decimals,
            admin: account
        }
        const cercContractAddress = await deployCERCContract(
            cercContract,
            web3,
            data1
        )
        console.log('cercContractAddress', cercContractAddress)
        // ------------------------------------------------------------------
        // setUnderlyingPrice
        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(4000000),
            gasPrice: web3.utils.toHex(250000000)
        }
        console.log('set underlying price')
        const simpleContract = new web3.eth.Contract(
            SimplePriceOracleAbi.abi,
            simpleOracleContractAddress
        )
        await simpleContract.methods.setUnderlyingPrice(
            cercContractAddress,
            new BigNumber(30).multipliedBy(10 ** 18).toString(10)
        ).send(txParams).on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set underlying price', txHash)
                }
            }
        })
        // support market
        const compContract2 = new web3.eth.Contract(
            CompTrollerAbi.abi,
            compContractAddress
        )
        console.log('Support market')
        await compContract2.methods._supportMarket(cercContractAddress).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('Support market', txHash)
                }
            }
        })
        console.log('set max asset')
        await compContract2.methods._setMaxAssets(10).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set max asset', txHash)
                }
            }
        })
        console.log('set price oracle')
        await compContract2.methods._setPriceOracle(simpleOracleContractAddress).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set price oracle', txHash)
                }
            }
        })
        console.log('set collateral factor')
        await compContract2.methods._setCollateralFactor(
            cercContractAddress,
            new BigNumber(8).multipliedBy(10 ** 18).toString(10)
        ).send(txParams).on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set collateral factor', txHash)
                }
            }
        })
        return {
            trc21ContractAddress,
            interestRateContractAddress,
            simpleOracleContractAddress,
            compContractAddress,
            cercContractAddress
        }
    } catch (error) {
        throw error
    }
}

deploy(
    'Wrap BTC',
    'WBTC',
    18
)
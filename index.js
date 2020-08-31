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

let sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))

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
                    [account],
                    1,
                    token.name,
                    token.symbol,
                    token.decimals,
                    new BigNumber(100000000).multipliedBy(10 ** 18).toString(10),
                    0,
                    0,
                    0
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(5000000),
                gasPrice: web3.utils.toHex(10000000000000),
                nonce: await web3.eth.getTransactionCount(account)
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
                }).catch(error => console.log(error))
        } catch (error) {
            return reject(error)
        }
    })
}

async function deployCOMPContract (
    trcContract,
    web3,
    address
) {
    return new Promise(async (resolve, reject) => {
        try {
            const account = (await web3.eth.getAccounts())[0]

            const TRC21Contract = new web3.eth.Contract(
                trcContract.abi, null, { data: '0x' + trcContract.bytecode })

            await TRC21Contract.deploy({
                arguments: [
                    address
                ]
            }).send({
                from: account.toLowerCase(),
                gas: web3.utils.toHex(5000000),
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
                }).catch(error => console.log(error))
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
                }).catch(error => console.log(error))
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
                gasPrice: web3.utils.toHex(100000000000000)
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
                }).catch(error => console.log(error))
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
                }).catch(error => console.log(error))
        } catch (error) {
            return reject(error)
        }
    })
}

async function deployEngine(){
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
        console.log('Deploying CompTroller')

        const comptrollerContract = {
            abi: CompTrollerAbi.abi,
            bytecode: CompTrollerAbi.bytecode
        }
        const comptrollerContractAddress = await deployNoArgContract(
            comptrollerContract,
            web3
        )
        console.log('comptrollerContractAddress', comptrollerContractAddress)

         // ----------------------------------------------------------------
        console.log('Deploying COMP contract')

        const compContract = {
            abi: CompAbi.abi,
            bytecode: CompAbi.bytecode
        }
        const compContractAddress = await deployCOMPContract(
            compContract,
            web3,
            comptrollerContractAddress
        )
        console.log('compContractAddress', compContractAddress)
        sleep(1000)
        // -----------------------------------------------------------------------------
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
        sleep(1000)
        
        const compContract2 = new web3.eth.Contract(
            CompTrollerAbi.abi,
            comptrollerContractAddress
        )
        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(4000000),
            gasPrice: web3.utils.toHex(250000000)
        }

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

        console.log('set price oracle contract')
        await compContract2.methods._setPriceOracle(simpleOracleContractAddress).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set price oracle contract', txHash)
                }
            }
        })

        console.log('set comp token contract')
        await compContract2.methods.setCompAddress(
            compContractAddress
        ).send(txParams).on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set comp token contract', txHash)
                }
            }
        })
        return {
            compContractAddress,
            comptrollerContractAddress,
            simpleOracleContractAddress
        }
        
    }catch (error) {
        throw error
    }
}
// baseInterestRate=0.05(e18), slopeInterestRate=0.15(e18), initialExchangeRate=0.2, collateralFactor=0.7, initUnderlingPrice=30
async function deployNewToken (comptrollerContractAddress, simpleOracleContractAddress,  name, symbol, decimals, baseInterestRate, slopeInterestRate, initialExchangeRate, collateralFactor, initUnderlingPrice) {
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
        console.log('Deploying contract TRC21', symbol)

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
        console.log('trc21ContractAddress', symbol, trc21ContractAddress)
        sleep(1000)
        // --------------------------------------------------------------------

        console.log('Deploying WhitePaperInterestRateModel', symbol)

        const interestRateContract = {
            abi: WhitePaperInterestRateModelAbi.abi,
            bytecode: WhitePaperInterestRateModelAbi.bytecode
        }
        const data = {
            baseRatePerYear: new BigNumber(baseInterestRate).multipliedBy(10 ** 18).toString(10),
            multiplierPerYear: new BigNumber(slopeInterestRate).multipliedBy(10 ** 18).toString(10)
        }
        const interestRateContractAddress = await deployInterestRateContract(
            interestRateContract,
            web3,
            data
        )
        console.log('interestRateContractAddress', symbol, interestRateContractAddress)
        sleep(1000)
    
        // ---------------------------------------------------------------------------
        
        console.log('Deploying CErc20Immutable', symbol)

        const cercContract = {
            abi: CErc20ImmutableAbi.abi,
            bytecode: CErc20ImmutableAbi.bytecode
        }
        const data1 = {
            underlying: trc21ContractAddress,
            comptroller: comptrollerContractAddress,
            interestRateModel: interestRateContractAddress,
            initialExRate: new BigNumber(initialExchangeRate).multipliedBy(10 ** 18).toString(10),
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
        console.log('cercContractAddress', symbol, cercContractAddress)

        //------------------------------------------------------------------

        const txParams = {
            from: account.toLowerCase(),
            gas: web3.utils.toHex(4000000),
            gasPrice: web3.utils.toHex(250000000)
        }
        console.log('set underlying price', symbol)
        const simpleContract = new web3.eth.Contract(
            SimplePriceOracleAbi.abi,
            simpleOracleContractAddress
        )
        await simpleContract.methods.setUnderlyingPrice(
            cercContractAddress,
            new BigNumber(initUnderlingPrice).multipliedBy(10 ** 18).toString(10)
        ).send(txParams).on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set underlying price', symbol, txHash)
                }
            }
        })
    
        const compContract2 = new web3.eth.Contract(
            CompTrollerAbi.abi,
            comptrollerContractAddress
        )
        console.log('Support market', symbol)
        await compContract2.methods._supportMarket(cercContractAddress).send(txParams)
        .on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('Support market', symbol, txHash)
                }
            }
        })

        console.log('set collateral factor', symbol)
        await compContract2.methods._setCollateralFactor(
            cercContractAddress,
            new BigNumber(collateralFactor).multipliedBy(10 ** 18).toString(10)
        ).send(txParams).on('transactionHash', async (txHash) => {
            let check = true
            while (check) {
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt) {
                    check = false
                    console.log('set collateral factor',symbol,  txHash)
                }
            }
        })


        return {
            trc21ContractAddress,
            interestRateContractAddress,
            cercContractAddress
        }
    } catch (error) {
        throw error
    }
}


async function deploy () {
    const d = await deployEngine()
    r1 = await deployNewToken(d.comptrollerContractAddress, d.simpleOracleContractAddress, "Tomo WrapBTC", "WTBTC", 18, 0.05, 0.15, 0.2, 0.8, 300)
    console.log(r1)
    r2 = await deployNewToken(d.comptrollerContractAddress, d.simpleOracleContractAddress, "Tomo WrapETH", "WTETH", 18, 0.05, 0.15, 0.2, 0.7, 1)
    console.log(r2)
    r3 = await deployNewToken(d.comptrollerContractAddress, d.simpleOracleContractAddress, "Tomo WrapSOL", "WTSOL", 18, 0.05, 0.15, 0.2, 0.6, 0.3)
    console.log(r3)
    r4 = await deployNewToken(d.comptrollerContractAddress, d.simpleOracleContractAddress, "Tomo WrapUSDT", "WTUSDT", 18, 0.05, 0.15, 0.2, 0.9, 0.03)
    console.log(r4)
}

deploy()
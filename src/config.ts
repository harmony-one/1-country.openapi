import * as process from 'process';

export default () => ({
  hmy: {
    name: 'hmy',
    url: process.env.HMY_NODE_URL,
    contract: process.env.HMY_LZ_CONTRACT
  },
  bsc: {
    name: 'bsc',
    url: process.env.BSC_NODE_URL,
    contract: process.env.BSC_LZ_CONTRACT
  },
  eth: {
    name: 'eth',
    url: process.env.ETH_NODE_URL,
    contract: process.env.ETH_LZ_CONTRACT
  },
  web3: {
    rpcUrl: process.env.RPC_URL || 'https://api.harmony.one',
    oneCountryContractAddress:
      process.env.ONE_COUNTRY_CONTRACT_ADDRESS ||
      '0x547942748Cc8840FEc23daFdD01E6457379B446D',
    oneWalletPrivateKey: process.env.ONE_WALLET_PRIVATE_KEY || '',
    txConfirmTimeout: parseInt(process.env.TX_CONFIRM_TIMEOUT) || 4000,
  },
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 8080,
  authKey: process.env.AUTH_KEY, 
});
import { createPublicClient, createWalletClient,  http } from 'viem'
import { mainnet, sepolia, holesky, polygon } from 'viem/chains'
import Web3 from 'web3'

export const multicallAddress = {
    1: "0x98Af6f0A868269C9cFA9039754c9C6E825257879",
    137: "0x846F6585c0E6acD0f277136041063e65C483BFBa",
    11155111: "0x911cF4ED824a108F7D40a855e617C78E519A4119",
    17000: "0xfdFbb6076B1621d862CE5F61813391ACde8ac00E"
};
export const factoryAddress = {
    1: "0xF165C5064a4dbfE81b3b4c1486fD9BAeA17a1eA6",
    137: "0x8dad800c084641d7cC9Ec613D17e1d8Da8c6F67d",
    11155111: "0xE401d2aC9e52920059c43a975A42b9d8b1B29Ecb",
    17000: "0x02F74C9C857c4c77d4EE06480C204b34393E9df2"
};
export const contractAddress = "0x0000000000000000000000000000000000000000";
export const WETHAddress = {
    1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    137: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    11155111: "0xb16F35c0Ae2912430DAc15764477E179D9B9EbEa",
    17000: "0x94373a4919B3240D86eA41593D5eBa789FEF3848"
};
export const routerAddress = {
    1: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    137: "0xedf6066a2b290C185783862C7F4776A2C8077AD1",
    11155111: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
    17000: "0x81a80fED3F02867a1c27B6FF6979022607a13e55"
};

export const apiKeys = {
    1: "T95YREXK4SB3G56Q551H95HPN6YFTWJ5MQ",
    11155111: "T95YREXK4SB3G56Q551H95HPN6YFTWJ5MQ"
}

export const CHAIN_ID = 1;
export const defaultAddress = "0x0000000000000000000000000000000000000000";

const PROVIDER_URL_SEP = 'https://ethereum-sepolia-rpc.publicnode.com'
export const web3Client = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_SEP))

const PROVIDER_URL_ETH = 'https://ethereum-rpc.publicnode.com'
export const web3EtherClient = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_ETH))

const PROVIDER_URL_POLYGON = 'https://polygon.llamarpc.com'
export const web3PolyClient = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_POLYGON))

const PROVIDER_URL_HOL = 'https://ethereum-holesky-rpc.publicnode.com'
export const holeskyWeb3Client = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_HOL))

export const web3Clients = {
    17000: holeskyWeb3Client,
    11155111: web3Client,
    1 : web3EtherClient,
    137: web3PolyClient
}

export const scanLinks = {
    17000: 'https://holesky.etherscan.io/',
    11155111: 'https://sepolia.etherscan.io/',
    137: 'https://polygonscan.com/',
    1: 'https://etherscan.io/'
}

export const scanApiLinks = {
    17000: 'https://api-holesky.etherscan.io/api',
    11155111: 'https://api-sepolia.etherscan.io/api',
    137: 'https://polygonscan.com/',
    1: 'https://api.etherscan.io/api'
}

export const publicClient = createPublicClient({
    chain: holesky,
    transport: http()
})

export const walletClient = createWalletClient({
    chain: mainnet,
    transport: http()
  })

export const supportedChainIds = [mainnet.id]

export const chainLogos = {
    17000: '/optimism.svg',
    11155111: '/eth.svg',
    1: '/eth.svg'
}

export const imageUrl = 'https://api.agentsys.io/api/uploads/'

export const apiUrl = 'https://api.agentsys.io'

export const ethPriceApiUrl = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'

export const imageUploadUrl = 'https://api.agentsys.io/'

export default function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toLocaleString() + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toLocaleString() + 'K';
    } else {
        return number.toLocaleString();
    }
}
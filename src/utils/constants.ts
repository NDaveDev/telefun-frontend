import { createPublicClient, createWalletClient,  http } from 'viem'
import { mainnet } from 'viem/chains'
import Web3 from 'web3'

export const multicallAddress = {
    1: "0x98Af6f0A868269C9cFA9039754c9C6E825257879"
};

export const factoryAddress = {
    1: "0xF165C5064a4dbfE81b3b4c1486fD9BAeA17a1eA6"
};

export const contractAddress = "0x0000000000000000000000000000000000000000";

export const WETHAddress = {
    1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
};

export const routerAddress = {
    1: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"
};

export const apiKeys = {
    1: "T95YREXK4SB3G56Q551H95HPN6YFTWJ5MQ"
}

export const CHAIN_ID = 1;

export const defaultAddress = "0x0000000000000000000000000000000000000000";

const PROVIDER_URL_ETH = 'https://mainnet.infura.io/v3/42d99144084e41669207f6fa4c845d75'

export const web3EtherClient = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_ETH))


export const web3Clients = {
    1 : web3EtherClient,
}

export const scanLinks = {
    1: 'https://etherscan.io/'
}

export const scanApiLinks = {
    1: 'https://api.etherscan.io/api'
}

export const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
})

export const walletClient = createWalletClient({
    chain: mainnet,
    transport: http()
  })

export const supportedChainIds = [mainnet.id]

export const chainLogos = {
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
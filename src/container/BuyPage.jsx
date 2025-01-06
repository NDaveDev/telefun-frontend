/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie';
import { useAccount, useSwitchChain } from 'wagmi'
import '../App.css'
import TeleFunAbi from '../config/TeleFunAbi.json'
import TokenAbi from '../config/TokenAbi.json'
import RouterAbi from '../config/RouterAbi.json'
import FactoryAbi from '../config/FactoryAbi.json'
import PairAbi from '../config/PairAbi.json'
import '../styles/MainContainer.css'
import MaxInput from '../components/MaxInput.tsx'
import { writeContract, readContract } from '@wagmi/core'
import { waitForTransaction } from '@wagmi/core'
import { useWeb3Modal } from '@web3modal/react'
import Web3 from 'web3'
import { toast } from 'react-hot-toast'
import Footer from '../components/Footer'
import ClaimCard from '../components/ClaimCard.jsx'
import ethIcon from '../icons/ETH-logo.svg'
import bannerImg from '../icons/footer telefun.png'
import TopBar from '../components/TopBar'
import ClipLoader from 'react-spinners/ClipLoader'
import { useQueryParam, StringParam } from 'use-query-params'
import MyChart from '../components/Chart.jsx'
import { SignMessage } from './SignMessage.jsx'
import CustomRadioButton from '../components/CustomRadioButton'
import rot13 from '../../utils/encode.ts'
import { Link } from 'react-router-dom'
import { WETHAddress, routerAddress, defaultAddress, web3Clients, imageUrl, apiUrl, ethPriceApiUrl, scanLinks, scanApiLinks, apiKeys } from '../utils/constants.ts'
import BottomMenu from '../components/BottomMenu.jsx';
import { config } from '../App.jsx';

const App = () => {
  let [addressDatas] = useQueryParam('address', StringParam)
  let TeleFunAddress
  let ref
  if (addressDatas.includes('/?ref=')) {
    TeleFunAddress = addressDatas.split('/?ref=')[0]
    ref = addressDatas.split('/?ref=')[1]
  } else {
    TeleFunAddress = addressDatas
  }
  let [chainId] = useQueryParam('chain', StringParam);

  const { switchChain } = useSwitchChain()

  const { address, chain, isConnected } = useAccount()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const tokenLogo = imageUrl + TeleFunAddress + '-logo.png'
  const tokenBanner = imageUrl + TeleFunAddress + '-logo.png'
  const [virtualLp, setVirtualLiquidiity] = useState(0)
  const [maxBuyAmount, setMaxBuyAmount] = useState(0)
  const [chatHistory, setChatHistory] = useState([])
  const [chatContent,] = useState('')
  const [tokenAmount, setAmount] = useState()
  const [tokenOutAmount, setTokenOutAmount] = useState()
  let [accountBalance, setAccountBalance] = useState(0)
  let [inputBalance, setInputBalance] = useState(0)
  let [tokenBalance, setTokenBalance] = useState(0)
  let [tokenAllowance, setTokenAllowance] = useState(0)
  const [virtualTokenLp, setVirtualTokenLp] = useState()
  const [tokenPrice, setTokenPrice] = useState(0)
  let [creating, setCreating] = useState(false)
  const [website, setWebsite] = useState()
  const [twitter, setTwitter] = useState()
  const [telegram, setTelegram] = useState()
  const [inputToken, setInputToken] = useState('ETH')
  const [tokenHolders, setTokenHolders] = useState([])
  const [holderDatas, setTokenHolderDatas] = useState()
  const [transactions, setTransactions] = useState([])
  const [transactionDatas, setTransactionDatas] = useState([])
  const [tokenPriceDatas, setTokenPriceDatas] = useState()
  const [volume, setVolume] = useState(0)
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [devAddress, setDevAddress] = useState('')
  const [description, setDescription] = useState('')

  const [refCounts, setRefCounts] = useState(0)
  const [totalRefAmounts, setTotalRefAmounts] = useState(0)
  const [refUserAmount, setRefUserAmout] = useState(0)

  const [lpCreated, setLpCreated] = useState(false)
  const [ethPrice, setEthPrice] = useState()
  const { open } = useWeb3Modal()
  const [firstConnect, setFirstConnect] = useState(false)
  const onConnectWallet = async () => {
    await open()
    setFirstConnect(true)
  }

  useEffect(() => {
    const reloadWindow = async () => {
      try {
        window.location.reload()
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && firstConnect === true) reloadWindow()
  }, [isConnected, firstConnect])

  const cookies = new Cookies();
  if (ref) {
    if (Web3.utils.isAddress(rot13(ref))) {
      cookies.set('ref', ref)
    }
  }
  let refAddress
  if (cookies.get('ref')) {
    if (Web3.utils.isAddress(rot13(cookies.get('ref')))) {
      refAddress = rot13(cookies.get('ref'))
    }
  } else {
    refAddress = defaultAddress
  }
  const BASE_URL = 'https://miniapp.agentsys.io/buy/?chain=' + chainId + '&address=' + TeleFunAddress
  const referlink = address ? `${BASE_URL}/?ref=${rot13(address)}` : `${BASE_URL}/?ref=`

  const copyAddress = address => async e => {
    e.stopPropagation()
    e.preventDefault()
    if (document.queryCommandSupported('copy')) {
      const ele = document.createElement('textarea')
      ele.value = address
      document.body.appendChild(ele)
      ele.select()
      document.execCommand('copy')
      document.body.removeChild(ele)
      displayTooltip()
    }
  }

  function displayTooltip() {
    let timeoutId
    setIsTooltipDisplayed(true)
    timeoutId = setTimeout(() => {
      setIsTooltipDisplayed(false)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }

  const onTokenSwap = async () => {
    try {
      setCreating(true)
      let swapHash
      let sendData;
      if (inputToken === 'ETH') {
        if (lpCreated) {
          const path = [WETHAddress[chainId], tokenAddress]
          const timestamp = (new Date().getTime() / 1000) + 300;
          swapHash = await writeContract(config, {
            address: routerAddress[chainId],
            abi: RouterAbi,
            functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
            value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
            args: [0, path, address, timestamp.toFixed(0)],
            chainId: Number(chainId)
          })
        } else {
          if (tokenOutAmount + Number(tokenBalance) > 1000000000 * maxBuyAmount / 100) {
            toast.error("You can't purchase more than max buy limit")
            setCreating(false)
            return;
          }
          swapHash = await writeContract(config, {
            address: TeleFunAddress,
            abi: TeleFunAbi,
            functionName: 'buyToken',
            value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
            args: [refAddress],
            chainId: Number(chainId)
          })
        }
        await waitForTransaction(config, {
          hash: swapHash
        })
        sendData = {
          chainId,
          buyer: address,
          type: 'Bought',
          name: tokenName,
          amount: tokenAmount,
          token: tokenAddress,
          contract: contractAddress,
          timestamp: (Date.now() / 1000).toFixed(0)
        }
      } else {
        if (tokenAllowance > 0) {
          if (lpCreated) {
            const path = [tokenAddress, WETHAddress[chainId]]
            const timestamp = (new Date().getTime() / 1000) + 300;
            swapHash = await writeContract(config, {
              address: routerAddress[chainId],
              abi: RouterAbi,
              functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
              value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
              args: [0, path, address, timestamp.toFixed(0)],
              chainId: Number(chainId)
            })
          } else {
            if (tokenAmount > 1000000000 * maxBuyAmount / 100) {
              toast.error("You can't sell more than max sell limit")
              setCreating(false)
              return;
            }
            swapHash = await writeContract(config, {
              address: TeleFunAddress,
              abi: TeleFunAbi,
              functionName: 'sellToken',
              args: [web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'), refAddress],
              chainId: Number(chainId)
            })
          }

          await waitForTransaction(config, {
            hash: swapHash
          })
          sendData = {
            chainId,
            buyer: address,
            type: 'Sold',
            name: tokenName,
            amount: tokenAmount,
            token: tokenAddress,
            contract: contractAddress,
            timestamp: (Date.now() / 1000).toFixed(0)
          }
        } else {
          let max =
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          let approveHash
          let approveAddress;
          if (lpCreated) {
            approveAddress = routerAddress[chainId]
          } else {
            approveAddress = TeleFunAddress
          }
          approveHash = await writeContract(config, {
            address: tokenAddress,
            abi: TokenAbi,
            functionName: 'approve',
            args: [approveAddress, max],
            chainId: Number(chainId)
          })
          await waitForTransaction(config, {
            hash: approveHash
          })
          toast.success("Successfully approved!")
          setCreating(false)
          return
        }
        setInputToken(inputToken)
      }
      if (sendData) {
        const response = await fetch(apiUrl + '/api/addHistory', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'error',
          body: JSON.stringify(sendData)
        })
        if (response.status !== 200) {
          const { error } = await response.json()
          throw new Error(error)
        }
      }
      setTimeout(function () {
        setCreating(false)
      }, 3000)
      toast.success(`Successfully ${Number(tokenAmount).toLocaleString()}   ${inputToken !== 'ETH' ? tokenName : 'ETH'} swapped`)
    } catch (err) {
      // console.log(err)
      if (tokenOutAmount + Number(tokenBalance) > 1000000000 * maxBuyAmount / 100) {
        const remainTokenAmount = 1000000000 * maxBuyAmount / 100 - Number(tokenBalance);
        toast.error("You can't purchase more than " + remainTokenAmount.toLocaleString() + ' ' + tokenName)
      } else {
        toast.error('There is a problem with your Swap. Please try again later')
      }
      setCreating(false)
    }
  }

  useEffect(() => {
    const FetchData = async () => {
      try {

        await fetch(
          ethPriceApiUrl,
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          setEthPrice(data.USD)
        })

        const TeleFunInfo = await readContract(config, {
          address: TeleFunAddress,
          abi: TeleFunAbi,
          functionName: 'getFunBasicInfo',
          chainId: Number(chainId)
        })
        const GetAllPrices = await readContract(config, {
          address: TeleFunAddress,
          abi: TeleFunAbi,
          functionName: 'getAllPrices',
          chainId: Number(chainId)
        })
        setTokenPriceDatas(GetAllPrices)
        setTokenName(TeleFunInfo[1][0])
        setTokenSymbol(TeleFunInfo[1][1])
        setTokenAddress(TeleFunInfo[2][1])
        setVirtualLiquidiity(Number(TeleFunInfo[0][5]) / 10 ** 18)
        setVirtualTokenLp(Number(TeleFunInfo[0][4]) / 10 ** 18)
        setTokenPrice(Number(TeleFunInfo[0][8]))
        setMaxBuyAmount(Number(TeleFunInfo[0][2]))
        setWebsite(TeleFunInfo[1][2])
        setTwitter(TeleFunInfo[1][3])
        setTelegram(TeleFunInfo[1][4])
        setVolume(Number(TeleFunInfo[0][9]) * ethPrice)
        setContractAddress(TeleFunInfo[2][0])
        setDevAddress(TeleFunInfo[2][2])
        setRefCounts(Number(TeleFunInfo[0][7]))
        setTotalRefAmounts(Number(TeleFunInfo[0][6]) / 10 ** 18)
        setDescription(TeleFunInfo[1][6])
        setLpCreated(TeleFunInfo[4])
        if (address) {
          let accountBalance = await web3Clients[chainId].eth.getBalance(address)
          accountBalance = web3Clients[chainId].utils.fromWei(accountBalance, 'ether')
          setAccountBalance(accountBalance)
          if (inputToken === 'ETH') {
            setInputBalance(accountBalance)
          } else {
            setInputBalance(tokenBalance)
          }
          const refUserAmounts = await readContract(config, {
            address: TeleFunAddress,
            abi: TeleFunAbi,
            functionName: 'refAmounts',
            args: [address],
            chainId: Number(chainId)
          })
          setRefUserAmout(Number(refUserAmounts) / (10 ** 18))
        }
        // if (lpCreated) {
        //   const factoryAddress = await readContract({
        //     address: routerAddress[chainId],
        //     abi: RouterAbi,
        //     functionName: 'factory',
        //     chainId: Number(chainId)
        //   })
        //   const pairAddress = await readContract({
        //     address: factoryAddress,
        //     abi: FactoryAbi,
        //     functionName: 'getPair',
        //     args: [
        //       tokenAddress,
        //       WETHAddress[chainId]
        //     ],
        //     chainId: Number(chainId)
        //   })
        //   const reserves = await readContract({
        //     address: pairAddress,
        //     abi: PairAbi,
        //     functionName: 'getReserves',
        //     chainId: Number(chainId)
        //   })
        //   console.log('>>>><<<<<', Number(reserves[1]) / Number(reserves[0]))
        //   setTokenPrice(Number(reserves[1]) / Number(reserves[0]) * 10 ** 12)
        // }
      } catch (e) {
        console.error(e)
      }
    }
    if (creating === false) {
      FetchData()
    }
  }, [chainId, creating, TeleFunAddress, address, web3Clients[chainId].eth, web3Clients[chainId].utils, inputToken, tokenBalance])

  const getApi = async () => {
    const GetAllPrices = await readContract(config, {
      address: TeleFunAddress,
      abi: TeleFunAbi,
      functionName: 'getAllPrices',
      chainId: Number(chainId)
    })
    setTokenPriceDatas(GetAllPrices)

    try {

      await fetch(
        ethPriceApiUrl,
        {
          method: 'GET'
        }
      ).then(async res => {
        let data = await res.json()
        setEthPrice(data.USD)
      })
    } catch (e) {
      console.error(e)
    }

    try {
      await fetch(
        apiUrl + `/api/getOne/${TeleFunAddress}`,
        {
          method: 'GET'
        }
      ).then(async res => {
        let data = await res.json()
        console.log('debug api getOne', data)
        if (!data.message) {
          let history
          let historyData = []
          for (let i = 0; i < data?.length; i++) {
            let sender = data[i].sender
            let content = data[i].content
            let currentDate = Date.now()
            let date = currentDate / 1000 - Number(data[i].timestamp)
            if (date > 86400) {
              date = (date / 86400).toFixed(0) + ' days ago'
            } else if (date > 3600) {
              date = (date / 3600).toFixed(0) + ' hours ago'
            } else if (date > 0) {
              date = (date / 60).toFixed(0) + ' mins ago'
            } else {
              date = ' just now'
            }
            let userAvatarUrl = imageUrl + `profile-${sender}.png`
            history = { Sender: sender, Content: content, Date: date, avatar: userAvatarUrl }
            historyData.push(history)
          }
          setChatHistory(historyData)
        }
      })
    } catch (e) {
      console.error(e)
    }

    try {
      if (TeleFunAddress) {
        await fetch(
          `${scanApiLinks[chainId]}?module=account&action=txlist&address=${TeleFunAddress}&startblock=0&endblock=99999999&apiKey=${apiKeys[chainId]}`,
          // `https://api.routescan.io/v2/network/mainnet/evm/${chainId}/address/${TeleFunAddress}/transactions`,
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          if (data.status === "1") {
            setTransactions(data.result.filter(item => item.isError === "0"))
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
    try {
      if (tokenAddress) {
        await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners?chain=0x${Number(chainId).toString(16)}&order=DESC`,
          // `https://api.routescan.io/v2/network/testnet/evm/${chainId}/erc20/${tokenAddress}/holders`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImEyN2MxZjc1LWMyNzQtNDNkYi1iMTcxLTJlOTQ4MTRiZDE5OCIsIm9yZ0lkIjoiODI5NTciLCJ1c2VySWQiOiI4MjYwMSIsInR5cGVJZCI6IjU4YzI0NTA3LWNiMDYtNDE0Ny04ZjY0LWE0YTQzZWRkMDRkMyIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNjgzMTMzODgyLCJleHAiOjQ4Mzg4OTM4ODJ9.DlApELF8Q03A5Uld1y8Eco2OeuqTyvgH7ZUqgfHMlBo'
            }
          }
        ).then(async res => {
          let data = await res.json()
          if (data.result) {
            setTokenHolderDatas(data.result)
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => getApi(), 10000)
    return () => clearInterval(interval)
  }, [])

  const setMaxAmount = async () => {
    if (accountBalance > 0) accountBalance = accountBalance - 0.0001
    if (inputToken === 'ETH') {
      setAmount(accountBalance)
    } else {
      setAmount(tokenBalance)
    }
  }

  useEffect(() => {
    const FetchAmount = async () => {
      try {
        let id
        if (inputToken === 'ETH') {
          id = '1'
        } else {
          id = '0'
        }
        let amounts
        if (Number(tokenAmount) > 0) {
          if (lpCreated) {
            if (id === '1') {
              path = [WETHAddress[chainId], tokenAddress]
            } else {
              path = [tokenAddress, WETHAddress[chainId]]
            }
            amounts = await readContract(config, {
              address: routerAddress[chainId],
              abi: RouterAbi,
              functionName: 'getAmountsOut',
              args: [BaseWeb3.utils.toWei(String(tokenAmount), 'ether'), path],
              chainId: Number(chainId)
            })
          } else {
            amounts = await readContract(config, {
              address: TeleFunAddress,
              abi: TeleFunAbi,
              functionName: 'ethOrTokenAmount',
              args: [web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'), id],
              chainId: Number(chainId)
            })
          }

          setTokenOutAmount(Number((Number(amounts) / 10 ** 18).toFixed(5)))
        } else {
          setTokenOutAmount('')
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (creating === false) {
      FetchAmount()
    }
  }, [inputToken, tokenAmount, creating])

  const chanageCurrency = async () => {
    if (inputToken === 'ETH') {
      setInputToken('Token')
      setInputBalance(tokenBalance)
      setAmount(tokenOutAmount)
    } else {
      setInputToken('ETH')
      setInputBalance(accountBalance)
      setAmount(tokenOutAmount)
    }
  }
  useEffect(() => {
    const FetchAmount = async () => {
      try {
        let amounts
        amounts = await readContract(config, {
          address: tokenAddress,
          abi: TokenAbi,
          functionName: 'balanceOf',
          args: [address],
          chainId: Number(chainId)
        })
        let allowance
        let approveAddress;
        if (lpCreated) {
          approveAddress = routerAddress[chainId]
        } else {
          approveAddress = TeleFunAddress
        }
        allowance = await readContract(config, {
          address: tokenAddress,
          abi: TokenAbi,
          functionName: 'allowance',
          args: [address, approveAddress],
          chainId: Number(chainId)
        })
        setTokenAllowance(Number(allowance) / 10 ** 18)
        setTokenBalance(web3Clients[chainId].utils.fromWei(String(amounts), 'ether'))
      } catch (e) {
        console.error(e)
      }
    }
    if (address && tokenAddress) {
      FetchAmount()
    }
  }, [tokenAddress, address, creating])

  useEffect(() => {
    const FetchHolder = async () => {
      try {
        let tokenHolder
        let tokenHolders = []
        for (let i = 0; i < holderDatas?.length; i++) {
          tokenHolder = {
            address: holderDatas[i].owner_address,
            value: Number(holderDatas[i].percentage_relative_to_total_supply)
          }
          tokenHolders.push(tokenHolder)
        }
        setTokenHolders(tokenHolders)
      } catch (e) {
        console.error(e)
      }
    }
    const FetchTransaction = async () => {
      try {
        let transaction
        let transactionData = []
        for (let i = 0; i < transactions?.length; i++) {
          if (
            transactions[i].functionName.includes('buyToken') ||
            transactions[i].functionName.includes('sellToken')
          ) {
            let maker = transactions[i].from
            let type
            let amount
            if (transactions[i].functionName.includes('buyToken')) {
              type = 'Buy'
            } else {
              type = 'Sell'
            }
            amount = tokenPriceDatas[transactions?.length - (i)].amount;
            amount = '$' + (Number(web3Clients[chainId].utils.fromWei(String(amount), 'ether')) * ethPrice).toLocaleString()
            let date = new Date(Number(transactions[i].timeStamp) * 1000).getTime() / 1000
            let currentDate = Date.now()
            date = currentDate / 1000 - date
            if (date > 86400) {
              date = (date / 86400).toFixed(0) + ' days ago'
            } else if (date > 3600) {
              date = (date / 3600).toFixed(0) + ' hours ago'
            } else if (date > 0) {
              date = (date / 60).toFixed(0) + ' mins ago'
            } else {
              date = ' just now'
            }
            if (date < 0) {
              date = 'just now'
            }
            let tx = transactions[i].hash
            transaction = {
              Maker: maker,
              Type: type,
              Amount: amount,
              Date: date,
              Tx: tx
            }
            transactionData.push(transaction)
          }
        }
        setTransactionDatas(transactionData)
      } catch (e) {
        console.error(e)
      }
    }
    if (tokenAddress) {
      if (holderDatas?.length > 0) {
        FetchHolder()
      } else if (transactions?.length > 0) {
        // FetchTransactionApi()
        FetchTransaction()
      } else {
        getApi()
      }
    }
  }, [holderDatas, tokenAddress, transactions])

  const [selectedOption, setSelectedOption] = useState('Chat')
  // Pagination State and Logic for Transactions Table
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [transactionTotalPages, setTransactionTotalPages] = useState(0)
  const transactionItemsPerPage = 5
  const [transactionPageNumbers, setTransactionPageNumbers] = useState([])

  const calculateTransactionPageNumbers = (totalPages, currentPage) => {
    let pages = []

    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      if (currentPage === 1) {
        pages = [1, 2, '...', totalPages - 1, totalPages]
      } else if (currentPage === totalPages) {
        pages = [1, 2, '...', totalPages - 1, totalPages]
      } else {
        if (currentPage + 1 < totalPages) {
          if (currentPage + 1 === totalPages - 1) {
            pages = [currentPage - 1, currentPage, currentPage + 1, totalPages]
          } else {
            pages = [
              currentPage - 1,
              currentPage,
              currentPage + 1,
              '...',
              totalPages
            ]
          }
        } else if (currentPage < totalPages) {
          pages = [currentPage - 1, currentPage, currentPage + 1]
        } else {
          pages = [1, 2, '...', totalPages - 1, totalPages]
        }
      }
    }

    return pages
  }

  const handleTransactionPageChange = newPageNumber => {
    setCurrentTransactionPage(newPageNumber)
    setTransactionPageNumbers(
      calculateTransactionPageNumbers(transactionTotalPages, newPageNumber)
    )
  }

  useEffect(() => {
    const totalPages = Math.ceil(
      transactionDatas.length / transactionItemsPerPage
    )
    setTransactionTotalPages(totalPages)
    setTransactionPageNumbers(
      calculateTransactionPageNumbers(totalPages, currentTransactionPage)
    )
  }, [transactionDatas])

  return (
    <div>
      <div className="GlobalContainer">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div className="max-w-7xl m-auto pt-40 pb-16 px-4 sm:px-12 sm:py-10">
            <div className='flex flex-col-reverse lg:flex-row'>
              <section className="w-full sm:p-[16px]">
                <div className='bg-[#312185] rounded-[25px] overflow-hidden'>
                  <ClaimCard
                    tokenName={tokenName}
                    Logo={<img src={tokenLogo} className="claim-eth-logo" />}
                    tokenAddress={tokenAddress}
                    contractAddress={contractAddress}
                    dexAddress="https://app.uniswap.org/swap"
                    devAddress={devAddress}
                    dexName="Uniswap"
                    tokenSymbol={tokenSymbol}
                    tokenDecimals={18}
                    tokenTotalSupply={1000000000}
                    maxBuyAmount={maxBuyAmount}
                    tokenSupplyUSD={virtualLp * ethPrice}
                    tokenSupplyLiquidity={virtualTokenLp}
                    tokenPrice={tokenPrice}
                    tokenUnsoldTokens={'Burned 🔥'}
                    tokenCover={tokenBanner}
                    website={website}
                    telegram={telegram}
                    twitter={twitter}
                    volume={volume}
                    description={description}
                    ethPrice={ethPrice}
                    // lpCreated={lpCreated}
                  />
                  <div className=''>
                    {lpCreated ?
                      <iframe
                        src={`https://dexscreener.com/ethereum/${tokenAddress}?embed=1&trades=0&info=0&theme=light`}
                        className="chart"
                        title="chart"
                      /> :
                      <MyChart data={tokenPriceDatas} ethPrice={ethPrice} />
                    }

                  </div>

                  <div className="mt-6">
                    <div className="custom-radio-button-wrapper2 px-6">
                      <CustomRadioButton
                        value="Chat"
                        selectedValue={selectedOption}
                        handleSelect={setSelectedOption}
                      />
                      <CustomRadioButton
                        value="Trades"
                        selectedValue={selectedOption}
                        handleSelect={setSelectedOption}
                      />
                    </div>
                    {/* Trades section */}
                    {selectedOption === 'Trades' && (
                      <div className="w-full rounded-xl p-3 sm:p-6">
                        <div>
                          <div className="tradeBox py-2">
                            <p>Maker</p>
                            <p>Type</p>
                            <p>Amount</p>
                            <p>Date</p>
                            <p>Tx</p>
                          </div>

                          <div className='flex flex-col gap-2'>

                            {transactionDatas.length === 0 && (
                              <div className='flex bg-[#1a2d1d] py-3 rounded-full justify-center text-white text-sm px-2'>No Data</div>
                            )}
                            {transactionDatas.length > 0 && transactionDatas
                              .slice(
                                (currentTransactionPage - 1) *
                                transactionItemsPerPage,
                                currentTransactionPage * transactionItemsPerPage
                              )
                              .map(
                                ({ Maker, Type, Amount, Date, Tx }) => (
                                  <div className="flex bg-[#1a2d1d] py-3 rounded-full justify-between px-2 sm:px-4 items-center" key={Tx}>
                                    <div>
                                      <a
                                        className="holderContent"
                                        href={
                                          scanLinks[chainId] + 'address/' +
                                          Maker
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <p className="tokenLists text-[#2fcdf3]">
                                          {Maker.slice(0, 5) +
                                            '...' +
                                            Maker.slice(-3)}
                                        </p>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="#2fcdf3"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide-icon lucide lucide-external-link h-4 w-4"
                                        >
                                          <path d="M15 3h6v6"></path>
                                          <path d="M10 14 21 3"></path>
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        </svg>
                                        &nbsp;
                                      </a>
                                    </div>
                                    <div>
                                      <p
                                        className={
                                          Type === 'Buy'
                                            ? 'tokenLists tokenBuy text-green-500'
                                            : 'tokenLists tokenSell text-red-500'
                                        }
                                      >
                                        {Type}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="tokenLists">{Amount}</p>
                                    </div>
                                    <div>
                                      <p className="tokenLists">{Date}</p>
                                    </div>
                                    <div>
                                      <a
                                        className="holderContent"
                                        href={
                                          scanLinks[chainId] + 'tx/' +
                                          Tx
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <p className="tokenLists text-[#2fcdf3]">
                                          {Tx.slice(0, 5) +
                                            '...' +
                                            Tx.slice(-3)}
                                        </p>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="#2fcdf3"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="lucide-icon lucide lucide-external-link h-4 w-4"
                                        >
                                          <path d="M15 3h6v6"></path>
                                          <path d="M10 14 21 3"></path>
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        </svg>
                                        &nbsp;
                                      </a>
                                    </div>
                                  </div>
                                )
                              )}
                            <div
                              className="flex justify-end my-4"
                              style={{ textAlign: 'right' }}
                            >
                              {/* Render the "First Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#2fcdf3]"
                                onClick={() => handleTransactionPageChange(1)}
                              >
                                &lt;&lt;
                              </button>
                              {/* Render the "Previous Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#2fcdf3]"
                                onClick={() =>
                                  handleTransactionPageChange(
                                    Math.max(currentTransactionPage - 1, 1)
                                  )
                                }
                              >
                                &lt;
                              </button>
                              {transactionPageNumbers.map((pageNumber, index) => {
                                if (typeof pageNumber === 'number') {
                                  return (
                                    <button
                                      key={pageNumber}
                                      className={`px-2 py-1 mx-1 ${currentTransactionPage === pageNumber
                                        ? 'bg-[#297836] text-white'
                                        : 'bg-[#1a2d1d] text-[#aaa]'
                                        } rounded-lg border border-[#2fcdf3]`}
                                      onClick={() =>
                                        handleTransactionPageChange(pageNumber)
                                      }
                                    >
                                      {pageNumber}
                                    </button>
                                  )
                                } else {
                                  return (
                                    <span
                                      key={pageNumber}
                                      className="px-2 py-1 mx-1 bg-transparent text-secondary rounded-lg border border-primary"
                                    >
                                      ...
                                    </span>
                                  )
                                }
                              })}
                              {/* Render the "Next Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#2fcdf3]"
                                onClick={() =>
                                  handleTransactionPageChange(
                                    Math.min(
                                      currentTransactionPage + 1,
                                      transactionTotalPages
                                    )
                                  )
                                }
                              >
                                &gt;
                              </button>
                              {/* Render the "Last Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#2fcdf3]"
                                onClick={() =>
                                  handleTransactionPageChange(transactionTotalPages)
                                }
                              >
                                &gt;&gt;
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                    {/* Chat section */}
                    {selectedOption === 'Chat' && (
                      <section className="InputSection_Description p-6">
                        {chatHistory.length > 0 ? (
                          <div>
                            <div className='flex flex-col gap-1'>
                              {chatHistory.map(
                                ({ Sender, Content, Date, avatar }) => (
                                  <>
                                    <div className="chatBox px-2">
                                      <div>
                                        <div className="chat-eth-logo-container relative">
                                          <img src={avatar} className="chat-profile-avatar"
                                            onError={event => {
                                              event.target.src = "/img/profile-logo.png"
                                              event.onerror = null
                                            }} />
                                          &nbsp; &nbsp;
                                          <div>
                                            <div className="top-trending">
                                              <Link
                                                className="chatContent"
                                                to={'/profile/?address=' + Sender}

                                                rel="noreferrer"
                                              >
                                                <p>
                                                  {Sender.slice(0, 5) +
                                                    '...' +
                                                    Sender.slice(-3)}
                                                </p>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="24"
                                                  height="24"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="lucide-icon lucide lucide-external-link h-4 w-4"
                                                >
                                                  <path d="M15 3h6v6"></path>
                                                  <path d="M10 14 21 3"></path>
                                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                </svg>
                                                &nbsp;
                                              </Link>
                                              &nbsp;
                                              <div>
                                                <p className="chatLists">{Date}</p>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="chatLists">
                                                {Content}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className="ButtonBox mt-4">
                          <SignMessage
                            TeleFunAddress={TeleFunAddress}
                            sender={address}
                            content={chatContent}
                            timestamp={(Date.now() / 1000).toFixed(0)}
                          />
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </section>

              <section className="ClaimLeftColumn px-[16px]">
                {/*<p className="avoid-scam avoid-scam-text">
                  Avoid scam links! Make sure the website is TeleFun
                </p>*/}
                {lpCreated ?
                  <a 
                    href={'#'}
                    target='_blank'
                  >
                    <div className='overflow-hidden rounded-[25px] sm:mx-0 mx-[-15px]'>
                      <img src={bannerImg} className='' />
                    </div>
                  </a>
                  :
                  <div className="claim-card p-6">
                    {/* <header className="flex justify-between">
                      <span className="text-white text-[20px] font-bold">Trade on Uniswap via TeleFun</span>
                    </header> */}
                    <section className="flex flex-col gap-6 mt-4">
                      <div className="swap-cards-container ">
                        <div className="flex flex-col gap-1 relative">
                          <div className="w-full rounded-[16px] bg-[#192d1c] px-4 py-6 flex justify-between">
                            <div className="flex gap-[16px]">
                              <img alt="token icon" fetchpriority="high" width="40" height="40"
                                decoding="async" data-nimg="1" className="flex-shrink-0 w-10 h-10 rounded-full"
                                src={inputToken === 'ETH' ? ethIcon : tokenLogo} />
                              <div className="flex flex-col">
                                <span className="text-[#919191] text-[12px] font-semibold">From</span>
                                <span className="text-white text-[20px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{inputToken === 'ETH' ? 'ETH' : tokenSymbol}</span>
                              </div>
                            </div>
                            <div className="flex flex-col relative items-end flex-grow">
                              <input
                                type="number"
                                placeholder="0"
                                className="placeholder:text-[#919191] bg-transparent max-w-[180px] focus:outline-none text-white text-[20px] font-bold text-right"
                                value={tokenAmount}
                                onChange={e => setAmount(e.target.value)}
                                required
                              />
                              <div className="flex gap-2 items-center">
                                <span onClick={setMaxAmount} className="cursor-pointer text-[#919191] text-[12px] font-semibold">
                                  Balance: &nbsp;{Number(inputToken === 'ETH' ? accountBalance : tokenBalance).toLocaleString()}{' '}
                                  {inputToken === 'ETH' ? 'ETH' : tokenSymbol}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-full rounded-[16px] bg-[#192d1c] px-4 py-6 flex justify-between">
                            <div className="flex gap-[16px]">
                              <img alt="token icon" fetchpriority="high" className="flex-shrink-0 w-10 h-10 rounded-full" width="40" height="40" src={inputToken !== 'ETH' ? ethIcon : tokenLogo} />
                              <div className="flex flex-col">
                                <span className="text-[#919191] text-[12px] font-semibold">To</span>
                                <span className="text-white text-[20px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{inputToken !== 'ETH' ? 'ETH' : tokenSymbol}</span>
                              </div>
                            </div>
                            <div className="flex flex-col relative items-end flex-grow">
                              <input
                                placeholder="0"
                                label=""
                                type="number"
                                value={tokenOutAmount}
                                className="text-white text-right text-[20px] font-bold"
                                disabled
                              />
                              <div className="flex gap-2 items-center">
                                <span className="text-[#919191] text-[12px] font-semibold">
                                  Balance: &nbsp;{Number(inputToken !== 'ETH' ? accountBalance : tokenBalance).toLocaleString()}{' '}
                                  {inputToken !== 'ETH' ? 'ETH' : tokenSymbol}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={chanageCurrency}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="48" viewBox="0 0 52 48" fill="none">
                              <path d="M26 46C38.7247 46 49.25 36.2628 49.25 24C49.25 11.7372 38.7247 2 26 2C13.2753 2 2.75 11.7372 2.75 24C2.75 36.2628 13.2753 46 26 46Z" fill="#192d1c" stroke="#312185" strokeWidth="4" />
                              <g clipPath="url(#clip0_95_5244)">
                                <path d="M26.957 27.1358L29.8533 30.0321M29.8533 30.0321L32.7504 27.1358M29.8533 30.0321L29.8538 17.9653" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M24.5434 20.862L21.6471 17.9648M21.6471 17.9648L18.75 20.862M21.6471 17.9648L21.6467 30.032" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </g>
                              <defs>
                                <clipPath id="clip0_95_5244">
                                  <rect width="24" height="24" fill="white" transform="translate(13.75 12)" />
                                </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {address === undefined ? (<button onClick={onConnectWallet} className='text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#2fcdf3] hover:opacity-90 disabled:bg-[#192d1c] disabled:text-[#bbb] rounded-[24px] text-[#222]'>
                        Connect Wallet
                      </button>) :
                        chain?.id === Number(chainId) ? <button onClick={onTokenSwap} className="text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#2fcdf3] hover:opacity-90 disabled:bg-[#192d1c] disabled:text-[#bbb] rounded-[24px] text-[#222]" disabled={address !== undefined && (Number(tokenAmount) > 0 && (inputToken === 'ETH' ? accountBalance >= Number(tokenAmount) : tokenBalance >= Number(tokenAmount))) ? false : true}>
                          {
                            inputToken !== 'ETH' && tokenAllowance === 0
                              ? creating === false
                                ? 'Approve token First'
                                : <ClipLoader
                                  color={'#222'}
                                  loading={creating}
                                  size={30}
                                  aria-label="Loading Spinner"
                                  data-testid="loader"
                                />
                              : creating === false
                                ? 'Swap Tokens'
                                : <ClipLoader
                                  color={'#222'}
                                  loading={creating}
                                  size={30}
                                  aria-label="Loading Spinner"
                                  data-testid="loader"
                                />}
                        </button>
                        :
                        <button onClick={() => switchChain?.({chainId})} className='text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#2fcdf3] hover:opacity-90 disabled:bg-[#192d1c] disabled:text-[#bbb] rounded-[24px] text-[#222]'>
                          Switch Network
                        </button>}
                    </section>
                  </div>
                }
                
                <br />
                <div className="claim-card p-6">
                  <div className="token-info-item">
                    <span className="token-info-label mx-auto">
                      <h3 className='text-white font-bold text-[24px]' style={{ marginTop: '0px' }}>
                        Earn <span className='text-[#2fcdf3]'>0.5%</span> of each trade
                      </h3>
                    </span>
                  </div>
                  <div className="token-info-item mt-2">
                    <span className="token-info-label font-light">
                      Share referral link with your friends and earn 0.5% of every
                      trade they make.
                    </span>
                  </div>
                  <br />
                  <div className='bg-[#17134e] flex w-full items-center gap-2 rounded-[8px] py-[14px] pr-[8px] pl-[16px]'>
                    <span className='text-[16px] text-white font-semibold w-[280px] truncate'>{isTooltipDisplayed ? "Copied" : referlink}</span>
                    <button className='flex justify-center items-center w-12 h-12 rounded-[8px] bg-[#FECA18] hover:bg-[#2fcdf3]' onClick={copyAddress(referlink)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon lucide lucide-copy">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </button>
                  </div>
                  {refUserAmount > 0 ?
                    <div>
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Total Refferal Amounts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {totalRefAmounts} ETH
                        </p>
                      </div>
                      <hr />
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Total Ref Counts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {refCounts}
                        </p>
                      </div>
                      <hr />
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Your referral amounts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {refUserAmount} ETH
                        </p>
                      </div>
                      <hr />
                    </div> :
                    <></>}


                </div>
                <br />
                <div className="claim-card p-6">
                  <div className="token-info-item py-2">
                    <span className="token-info-label aligned-left text-[20px] font-extrabold">
                      Holders Distribution
                    </span>
                  </div>
                  {tokenHolders.slice(-10).map(({ address, value }) => (
                    <div className="holderBox py-1" key={address}>
                      <a
                        className="holderContent"
                        href={
                          scanLinks[chainId] + 'address/' +
                          address
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists text-[#a5ada6]"
                        >
                          {(address.toString()).slice(0, 5) + '...' + (address.toString()).slice(-3)}
                        </p>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#a5ada6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide-icon lucide lucide-external-link h-4 w-4"
                        >
                          <path d="M15 3h6v6"></path>
                          <path d="M10 14 21 3"></path>
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        </svg>
                        &nbsp;
                      </a>
                      <p
                        style={{
                          textAlign: 'center',
                          margin: '0px'
                        }}
                        className="tokenLists font-bold"
                      >
                        {value.toFixed(2)} %
                      </p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
          <BottomMenu />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App

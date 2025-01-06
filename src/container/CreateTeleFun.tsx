/* eslint-disable no-useless-concat */
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'
import Cookies from 'universal-cookie'
import { providers, Contract, BigNumber, utils, ethers, Wallet } from 'ethers'
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution
} from '@flashbots/ethers-provider-bundle'
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useWalletClient,
  useConnect
} from 'wagmi'
import '../App.css'
import TeleFunFactoryAbi from '../config/TeleFunFactoryAbi.json'
import TeleFunAbi from '../config/TeleFunAbi.json'
import '../styles/MainContainer.css'
import Input from '../components/Input.tsx'
import TextArea from '../components/TextArea.tsx'
import { writeContract, readContract } from '@wagmi/core'
import ClipLoader from 'react-spinners/ClipLoader'
import { waitForTransaction } from '@wagmi/core'
import { useWeb3Modal } from '@web3modal/react'
import { toast } from 'react-hot-toast'
import Footer from '../components/Footer.jsx'
import 'react-datepicker/dist/react-datepicker.css'
import TopBar from '../components/TopBar.jsx'
import LogoUploadBox from '../components/LogoUploadBox.jsx'
import AgentUploadBox from '../components/agentLogoUploadBox.jsx'
import BannerUploadBox from '../components/BannerUploadBox.jsx'
import {
  factoryAddress,
  web3Clients,
  imageUploadUrl,
  ethPriceApiUrl,
  chainLogos,
  publicClient,
  defaultAddress,
  supportedChainIds,
  CHAIN_ID
} from '../utils/constants.ts'
import BottomMenu from '../components/BottomMenu.jsx'
import { parseEther } from 'viem'
import { config } from '../App.jsx'

const App = () => {
  const { address, chainId, connector, isConnected } = useAccount()
  const account = useAccount()
  const { switchChain } = useSwitchChain()
  const { sendTransaction } = useSendTransaction()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const logoFileInput = useRef<HTMLInputElement>(null)
  const bannerFileInput = useRef<HTMLInputElement>(null)
  console.log('chainID', chainId)
  const [provider, setProvider] = useState()
  const [signer, setSigner] = useState()
  const [maxWallet, setMaxWallet] = useState(1)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDescription, setTokenDescription] = useState('')
  let [loading, setLoading] = useState(false)
  let [creating, setCreating] = useState(false)
  const [website, setWebsite] = useState('')
  const [telegram, setTelegram] = useState('')
  const [discord, setDiscord] = useState('')
  const [twitter, setTwitter] = useState('')
  const [firstConnect, setFirstConnect] = useState(false)
  const { open } = useWeb3Modal()
  const [depositAmount, setDepositAmount] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [isCheckedAdvanced, setIsCheckedAdvanced] = useState(true)
  const [accounts, setAccounts] = useState([
    {
      privateKey: '',
      address: '',
      balance: '',
      inputAmount: '',
      error: 'Enter Private Key'
    }
  ])

  useEffect(() => {
    // const provider = new ethers.providers.Web3Provider(walletClient.transport);
    // const signer = provider.getSigner();
    const { chain, transport } = publicClient
    const network = {
      chainId: chain?.id,
      name: chain?.name,
      ensAddress: chain?.contracts?.ensRegistry?.address
    }
    const provider = new providers.Web3Provider(transport, network)
    const signer = provider.getSigner(address)
    setProvider(provider)
    setSigner(signer)
  }, [address])

  const web3 = web3Clients[chainId]
  const MAX_ROWS = 20

  const handlePrivateKeyChange = async (index, value) => {
    const newAccounts = [...accounts]
    newAccounts[index].privateKey = value

    if (!web3.utils.isHexStrict(value) || value.length !== 66) {
      // 0x + 64 characters
      newAccounts[index].error = 'Invalid private key'
      newAccounts[index].address = ''
      newAccounts[index].balance = ''
    } else {
      try {
        const account = web3.eth.accounts.privateKeyToAccount(value)
        newAccounts[index].address = account.address

        const balanceWei = await web3.eth.getBalance(account.address)
        newAccounts[index].balance = web3.utils.fromWei(balanceWei, 'ether')
        newAccounts[index].error = ''
      } catch (error) {
        console.error('Error:', error)
        newAccounts[index].address = ''
        newAccounts[index].balance = ''
        newAccounts[index].error = 'Error deriving address or balance'
      }
    }

    setAccounts(newAccounts)
  }

  const handleInputAmountChange = (index, value) => {
    const newAccounts = [...accounts]
    newAccounts[index].inputAmount = value
    setAccounts(newAccounts)
  }

  const addRow = () => {
    if (accounts.length < MAX_ROWS) {
      setAccounts([
        ...accounts,
        {
          privateKey: '',
          address: '',
          balance: '',
          inputAmount: '',
          error: 'Enter Private Key'
        }
      ])
    }
  }

  const removeRow = index => {
    const newAccounts = accounts.filter((_, i) => i !== index)
    setAccounts(newAccounts)
  }

  const handleMaxClick = index => {
    const newAccounts = [...accounts]
    newAccounts[index].inputAmount = accounts[index].balance
    setAccounts(newAccounts)
  }

  const hasValidPrivateKey = accounts => {
    return accounts.every(account => account.error === '')
  }

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  // const handleCheckboxChangeAdvanced = () => {
  //   setIsCheckedAdvanced(!isCheckedAdvanced);
  // };

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

  useEffect(() => {
    if (loading === true) {
      setTimeout(function () {
        setLoading(false)
      }, 3000)
    }
  }, [loading])

  const onTeleFunCreate = async () => {
    try {
      setCreating(true)
      let feeAmount = 0.0001
      if (Number(depositAmount) > 0) {
        let newEthAmount = 1.6 + Number(depositAmount)
        let newTokenAmount = (1073 * 10 ** 6 * 1.6) / newEthAmount
        let tokenAmount = 1073 * 10 ** 6 - newTokenAmount
        let maxAmount = (1000000000 * maxWallet) / 100
        if (tokenAmount > maxAmount) {
          setCreating(false)
          toast.error(
            "You can't purchase more than " +
              ' ' +
              maxAmount.toLocaleString() +
              ' ' +
              ' tokens'
          )
          return false
        }
      }

      if (logoFile) {
        // const deployerBytes = utils.hexZeroPad(address, 32);
        // const timestamp = Math.floor(Date.now() / 1000);
        // const timestampBytes = utils.hexZeroPad(utils.hexlify(timestamp));
        // const combinedBytes = utils.concat([deployerBytes, timestampBytes]);
        // const salt = utils.keccak256(combinedBytes);
        // let predictAddress;
        // predictAddress = await readContract({
        //   address: factoryAddress[chainId],
        //   abi: TeleFunFactoryAbi,
        //   functionName: 'getTeleFunAddress',
        //   args: [
        //     address,
        //     web3Clients[chainId].utils.toWei(String(feeAmount + Number(depositAmount)), 'ether'),
        //     [
        //       tokenName,
        //       tokenSymbol,
        //       tokenDescription,
        //       website,
        //       twitter,
        //       telegram,
        //       discord
        //     ],
        //     maxWallet.toString(),
        //     // salt
        //   ],
        //   chainId: chainId
        // })
        const gasPrice = await provider.getGasPrice()
        let create
        // sendTransaction({ to: address, value: parseEther("0.000001") })
        create = await writeContract(config, {
          address: factoryAddress[chainId],
          abi: TeleFunFactoryAbi,
          functionName: 'createAgentSys',
          value: web3Clients[chainId].utils.toWei(
            String(feeAmount + Number(depositAmount)),
            'ether'
          ),
          args: [
            [
              tokenName,
              tokenSymbol,
              tokenDescription,
              website,
              twitter,
              telegram,
              discord
            ],
            maxWallet.toString()
            // salt
          ],
          connector: connector,
          // gasPrice: (Number(gasPrice) * 2).toFixed(0),
          chainId: chainId,
          account: address
        })

        // let transactionPromises
        if (isCheckedAdvanced) {
          const cookies = new Cookies()
          let refAddress
          if (cookies.get('ref')) {
            if (Web3.utils.isAddress(rot13(cookies.get('ref')))) {
              refAddress = rot13(cookies.get('ref'))
            }
          } else {
            refAddress = defaultAddress
          }

          // Function to check if the contract is deployed
          async function checkContractDeployed(address) {
            const code = await provider.getCode(address)

            return code !== '0x'
          }

          // Function to wait until the contract is deployed
          async function waitForContractDeployment(address, interval = 1000) {
            while (true) {
              const isDeployed = await checkContractDeployed(address)
              if (isDeployed) {
                console.log('Contract is deployed!')
                return true
              } else {
                console.log('Contract not deployed yet, waiting...')
                await new Promise(resolve => setTimeout(resolve, interval)) // Wait for the specified interval before checking again
              }
            }
          }

          // await waitForContractDeployment(predictAddress);

          // transactionPromises = accounts.map(async (account) => {
          //   const wallet = new Wallet(account.privateKey, provider)
          //   const pumpContract = new Contract(predictAddress, TeleFunAbi, wallet)
          //   const inputAmountInWei = web3Clients[chainId].utils.toWei(String(account.inputAmount), 'ether')
          //   const tx = await pumpContract.buyToken(refAddress, { value: inputAmountInWei, gasPrice: (Number(gasPrice) * 1.5).toFixed(0), gasLimit: 5000000})
          //   return await tx.wait()
          // })
        }
        await waitForTransaction(config, {
          hash: create
        })
        // await Promise.all(transactionPromises)
        let funAddresses
        funAddresses = await readContract(config, {
          address: factoryAddress[chainId],
          abi: TeleFunFactoryAbi,
          functionName: 'getAllAddresses',
          chainId: chainId
        })
        let presaleAddress
        if (funAddresses) presaleAddress = funAddresses[funAddresses.length - 1]
        let logoUrl
        if (logoFile) {
          const formData = new FormData()
          formData.append('file', logoFile, presaleAddress)
          fetch(imageUploadUrl + 'api/logoUploads', {
            method: 'POST',
            body: formData
          })
            .then(async res => {
              logoUrl = await res.json()
              logoUrl = logoUrl.fileInfo.filename
              console.log('debug->here')
              toast.success(`Successfully ${tokenName} TeleFun created`)
              const link = `/buy/?chain=${chainId}&address=${presaleAddress}`
              window.location.href = link
            })
            .catch(error => {
              setCreating(false)
              console.error('Error:', error)
            })
        }
        setCreating(false)
      } else {
        setCreating(false)
        toast.error('please upload correct image file')
      }
    } catch (err) {
      setCreating(false)
      console.error(err)
      toast.error(
        'There is a problem with your AgentSys create. Please try again later'
      )
    }
  }

  const [, setImageLogoFile] = useState(null)

  const handleImageLogoChange = file => {
    setImageLogoFile(file)
  }

  const [, setImageBannerFile] = useState(null)

  const handleImageBannerChange = file => {
    setImageBannerFile(file)
  }

  const LogoImageUpload = ({ onChange, className, style }) => {
    const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files![0]
      setLogoFile(selectedFile)
      setLogoPreview(URL.createObjectURL(selectedFile))
      onChange(selectedFile)
    }
    const onButtonClick = () => {
      if (logoFileInput.current) {
        logoFileInput.current.click()
      }
    }
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type="file"
          ref={logoFileInput}
          accept="image/*"
          onChange={handleLogoImageChange}
          style={{ display: 'none' }}
        />
        <LogoUploadBox
          imageUrl={logoPreview}
          handleClick={onButtonClick}
          className={className}
          style={style}
        />
      </div>
    )
  }

  const agentLogoImageUpload = ({ onChange, className, style }) => {
    const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files![0]
      setLogoFile(selectedFile)
      setLogoPreview(URL.createObjectURL(selectedFile))
      onChange(selectedFile)
    }
    const onButtonClick = () => {
      if (logoFileInput.current) {
        logoFileInput.current.click()
      }
    }
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <button
          type="file"
          ref={logoFileInput}
          accept="image/*"
          onChange={handleLogoImageChange}
          style={{ display: 'none' }}
        />
        <AgentUploadBox
          imageUrl={logoPreview}
          handleClick={onButtonClick}
          className={className}
          style={style}
        />
      </div>
    )
  }

  const BannerImageUpload = ({ onChange, className, style }) => {
    const handleBannerImageChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const selectedFile = e.target.files![0]
      setBannerFile(selectedFile)
      setBannerPreview(URL.createObjectURL(selectedFile))
      onChange(selectedFile)
    }
    const onButtonClick = () => {
      if (bannerFileInput.current) {
        bannerFileInput.current.click()
      }
    }
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type="file"
          ref={bannerFileInput}
          accept="image/*"
          onChange={handleBannerImageChange}
          style={{ display: 'none' }}
        />
        <BannerUploadBox
          imageUrl={bannerPreview}
          handleClick={onButtonClick}
          className={className}
          style={style}
        />
      </div>
    )
  }
  const setMaxWalletAmount = value => {
    setMaxWallet(value)
  }

  return (
    <div>
      <div className="GlobalContainer">
        {
          <div style={{ zIndex: 1 }}>
            <TopBar />
            <div className="max-w-7xl m-auto pt-36 pb-24 px-4 sm:px-12 sm:py-10">
              <section className="lg:mx-auto pt-8 lg:py-[30px] w-full lg:w-[741px] min-w-0">
                <>
                  <section>
                    <section className="my-4">
                      <p className="ContractContentTextTitle">Deploy Agent</p>
                    </section>
                    <div className="flex flex-col justify-center items-center gap-[10px] bg-[#312185] rounded-[25px] py-[45px] px-3 sm:px-[25px]">
                      <div className="text-[#2fcdf3] w-[90%] text-[18px]">
                        Token Info
                      </div>
                      <>
                        <section className="flex flex-col gap-4 w-[90%]">
                          <div className="LpBalance">
                            <p className="Text1">
                              Name<span style={{ color: 'red' }}>*</span>
                            </p>
                          </div>
                          <section className="inputPanel">
                            <section className="inputPanelHeader">
                              <Input
                                placeholder="Enter Name"
                                label=""
                                type="text"
                                changeValue={setTokenName}
                                value={tokenName}
                              />
                            </section>
                          </section>
                        </section>

                        <section className="flex flex-col gap-4 w-[90%]">
                          <div className="LpBalance">
                            <p className="Text1">
                              Ticker<span style={{ color: 'red' }}>*</span>
                            </p>
                          </div>
                          <section className="inputPanel">
                            <section className="inputPanelHeader">
                              <Input
                                placeholder="Enter Ticket"
                                label=""
                                type="text"
                                changeValue={setTokenSymbol}
                                value={tokenSymbol}
                              />
                            </section>
                          </section>
                        </section>

                        <section className="flex flex-col gap-4 w-[90%]">
                          <p className="Text1">
                            Description (Max 1000 characters)
                            <span style={{ color: 'red' }}>*</span>
                          </p>
                          <section className="inputPanel">
                            <section className="inputPanelHeader">
                              <TextArea
                                rows={6}
                                placeholder="Enter Token Description"
                                changeValue={setTokenDescription}
                                value={tokenDescription}
                              />
                            </section>
                          </section>
                        </section>

                        <section className="flex flex-col sm:flex-row w-[90%]">
                          <section className="flex flex-col gap-4 w-full sm:w-[100%]">
                            <div className="LpBalance">
                              <p className="Text1">
                                Image
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <LogoImageUpload
                                  onChange={handleImageLogoChange}
                                  className="h-[175px]"
                                  style={undefined}
                                />
                              </section>
                            </section>
                          </section>

                          {/* <section className="flex flex-col gap-4 w-full sm:w-[60%]">
                            <div className="LpBalance">
                              <p className="Text1">
                                Upload Banner
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <BannerImageUpload
                                  onChange={handleImageBannerChange}
                                  className="upload-box-banner"
                                  style={undefined}
                                />
                              </section>
                            </section>
                          </section> */}
                        </section>

                        <div className="flex flex-col sm:flex-row sm:justify-between w-[90%] gap-2">
                          <section className="flex flex-col gap-4 w-[90%] sm:w-[45%]">
                            <div className="LpBalance">
                              <p className="Text1">
                                Max Wallet (%)
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <div className="fairlaunch-allocation-buttons-container">
                                  <button
                                    className="fairlaunch-allocation-button"
                                    onClick={() => {
                                      setMaxWalletAmount(1)
                                    }}
                                    style={
                                      maxWallet === 1
                                        ? {}
                                        : {
                                            background: 'transparent',
                                            color: '#2fcdf3',
                                            border: 'solid #2fcdf3 1px'
                                          }
                                    }
                                  >
                                    1%
                                  </button>
                                  <button
                                    className="fairlaunch-allocation-button"
                                    onClick={() => {
                                      setMaxWalletAmount(2)
                                    }}
                                    style={
                                      maxWallet === 2
                                        ? {}
                                        : {
                                            background: 'transparent',
                                            color: '#2fcdf3',
                                            border: 'solid #2fcdf3 1px'
                                          }
                                    }
                                  >
                                    2%
                                  </button>
                                </div>
                              </section>
                            </section>
                          </section>
                          <section className="flex flex-col gap-4 w-[90%] sm:w-[45%]">
                            <div className="LpBalance">
                              <p className="Text1">
                                Network
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <div className="fairlaunch-allocation-buttons-container">
                                  {/* <button
                                    className={`${chainId === 17000 ? 'opacity-100' : 'opacity-30'}`}
                                    onClick={() => {
                                      setChainId(17000)
                                    }}
                                  >
                                    <img src={chainLogos[17000]} className='w-8' />
                                  </button> */}
                                  <button
                                    className={`${
                                      chainId === 1
                                        ? 'opacity-100'
                                        : 'opacity-30'
                                    }`}
                                    // onClick={() => {
                                    //   setChainId(1)
                                    // }}
                                  >
                                    <img src={chainLogos[1]} className="w-8" />
                                  </button>
                                </div>
                              </section>
                            </section>
                          </section>
                        </div>
                        {/* <section className="flex flex-col gap-4 w-[90%]">
                            <div className="LpBalance">
                              <p className="Text1">
                                Router Option
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <div className="fairlaunch-allocation-buttons-container">
                                  <button
                                    className="fairlaunch-allocation-button"
                                    style={
                                      { background: 'transparent', color: '#b04851', border: 'solid #b04851 1px' }
                                    }
                                  >
                                    Trade Joe
                                  </button>
                                </div>
                              </section>
                            </section>
                        </section> */}
                        <section className="flex flex-col gap-4 w-[90%]">
                          <div className="LpBalance">
                            <p className="Text1">Snipe Amount (ETH)</p>
                          </div>
                          <section className="inputPanel">
                            <section className="inputPanelHeader">
                              <Input
                                placeholder="Enter Snipe ETH Amount"
                                label=""
                                type="number"
                                changeValue={setDepositAmount}
                                value={depositAmount}
                              />
                            </section>
                          </section>
                        </section>

                        <label className="relative flex  text-[#2fcdf3] items-center p-2 text-[18px] w-[90%]">
                          Add Social Links
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                            className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                          />
                          <span className="w-12 h-6 flex items-center flex-shrink-0 ml-4 p-1 bg-[#919191] rounded-full duration-300 ease-in-out peer-checked:bg-[#a48d33] peer-checked:after:bg-[#2fcdf3] after:w-6 after:h-6 after:bg-gray-300 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4"></span>
                        </label>
                        <div
                          className={`w-[90%] ${
                            isChecked ? 'grid' : 'hidden'
                          } grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4`}
                        >
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1">Twitter</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setTwitter}
                                  value={twitter}
                                />
                              </section>
                            </section>
                          </section>
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1">Telegram</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setTelegram}
                                  value={telegram}
                                />
                              </section>
                            </section>
                          </section>
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1">Website</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setWebsite}
                                  value={website}
                                />
                              </section>
                            </section>
                          </section>

                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1">Discord</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setDiscord}
                                  value={discord}
                                />
                              </section>
                            </section>
                          </section>

                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1">
                                Tip: coin data cannot be changed after creation
                              </p>
                            </div>
                          </section>
                        </div>

                        {/* <label className={`${chainId === 17000 ? 'flex' : 'hidden'} relative text-[#2fcdf3] items-center p-2 text-[18px] w-[90%]`}>
                          Bundle Option
                          <input type="checkbox" checked={isCheckedAdvanced} onChange={handleCheckboxChangeAdvanced} className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md" />
                          <span className="w-12 h-6 flex items-center flex-shrink-0 ml-4 p-1 bg-[#919191] rounded-full duration-300 ease-in-out peer-checked:bg-[#a48d33] peer-checked:after:bg-[#2fcdf3] after:w-6 after:h-6 after:bg-gray-300 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4"></span>
                        </label>
                        <div className={`w-[90%] ${isCheckedAdvanced && chainId === 17000 ? 'block' : 'hidden'} sm:gap-4`}>
                          <div className="space-y-2">
                            {accounts.map((account, index) => (
                              <div key={index} className="p-4 border border-[#2fcdf3] rounded-[25px] shadow-md flex flex-row justify-bewteen gap-2 sm:gap-4">
                                <div className='flex flex-col w-[85%] gap-2'>
                                  <div className="flex flex-col">
                                    <div className={`w-full border ${account.error ? 'border-red-500' : 'border-[#2fcdf3]'} rounded-full`}>
                                      <input
                                        type="text"
                                        value={account.privateKey}
                                        onChange={(e) => handlePrivateKeyChange(index, e.target.value)}
                                        placeholder="Enter Private Key"
                                        className={`w-full p-2 rounded-md text-white bg-transparent ${account.error ? 'border-red-500' : ''}`}
                                      />
                                    </div>
                                    {account.error && (
                                      <p className="text-red-500 text-sm mt-1">{account.error}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex-grow">
                                      <p className="text-white text-sm font-bold">Address: <span className='text-[#2fcdf3] font-light'>{account.address ? account.address.slice(0, 12) + '...' + account.address.slice(-10) : ''}</span></p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between">
                                    <div className="flex-grow">
                                      <p className="text-white text-sm font-bold">ETH Balance: <span className='text-[#2fcdf3] text-base font-light'>{account.balance ? Number(account.balance).toLocaleString() : ''}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 justify-between py-1 px-2 border border-[#2fcdf3] rounded-full">
                                      <input
                                        type="number"
                                        value={account.inputAmount}
                                        onChange={(e) => handleInputAmountChange(index, e.target.value)}
                                        placeholder="Input Amount"
                                        className="rounded-md bg-transparent border border-[#2fcdf3] text-white"
                                      />
                                      <button
                                        onClick={() => handleMaxClick(index)}
                                        className="bg-[#69ec69] text-[#222] p-1 rounded-full"
                                      >
                                        Max
                                      </button>
                                    </div>
                                  </div>

                                </div>
                                <div className="flex flex-col items-center sm:flex-row gap-2 w-[15%] justify-center">
                                  {index > 0 && (
                                    <button
                                      onClick={() => removeRow(index)}
                                      className="border border-[#2fcdf3] text-[#2fcdf3] h-10 w-10 rounded-full text-[24px] px-2"
                                    >
                                      -
                                    </button>
                                  )}
                                  {index === accounts.length - 1 && (
                                    <button
                                      onClick={addRow}
                                      className="bg-[#2fcdf3] text-[#222] h-10 w-10 rounded-full text-[24px] px-2"
                                      disabled={accounts.length >= MAX_ROWS}
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div> */}
                      </>
                      <>
                        <div className="flex justify-center flex-col w-full mt-8">
                          {isConnected ? (
                            supportedChainIds.includes(chainId) ? (
                              <button
                                disabled={
                                  tokenName === '' ||
                                  tokenSymbol === '' ||
                                  tokenDescription === '' ||
                                  logoFile === null
                                }
                                onClick={onTeleFunCreate}
                                className="CreateButton flex justify-center items-center"
                              >
                                {tokenName === '' ||
                                tokenSymbol === '' ||
                                tokenDescription === '' ||
                                logoFile === null ? (
                                  'Please Enter Details'
                                ) : creating === false ? (
                                  'Create'
                                ) : (
                                  <ClipLoader
                                    color={'#222'}
                                    loading={creating}
                                    size={30}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                  />
                                )}
                              </button>
                            ) : (
                              <>
                                <button
                                  className="CreateButton"
                                  type="submit"
                                  onClick={() => {
                                    switchChain(CHAIN_ID)
                                  }}
                                >
                                  Switch Network
                                </button>
                              </>
                            )
                          ) : (
                            <>
                              <button
                                className="CreateButton"
                                type="submit"
                                onClick={() => {
                                  onConnectWallet()
                                }}
                              >
                                Connect
                                <span className="navWallet"> Wallet</span>
                              </button>
                            </>
                          )}
                        </div>
                      </>
                      <div
                        className="text-[#2fcdf3] w-[90%] text-[18px]"
                        style={{
                          maxWidth: '90%',
                          margin: '0',
                          fontSize: '14px',
                          textAlign: 'center',
                          width: '100%'
                        }}
                      >
                        <>Launch Cost 0.01 ETH</>
                      </div>
                    </div>
                    <div
                      className="flex flex-col justify-center items-center gap-[10px] bg-[#ffffff] rounded-[25px] py-[45px] px-3 sm:px-[25px]"
                      style={{ marginTop: '20px' }}
                    >
                      <button
                        className="text-[black] w-[90%] text-[36px]"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          backgroundColor: '#80d8fe',
                          borderRadius: '24px'
                        }}
                      >
                        Connect Agent
                      </button>
                      <>
                        <section
                          className="w-[90%]"
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <p
                            className="Text1"
                            style={{
                              backgroundColor: '#2aa6e1',
                              padding: '6px',
                              borderRadius: '8px'
                            }}
                          >
                            Coming Soon
                          </p>
                        </section>
                        <section
                          className="w-[90%]"
                          style={{
                            background: '#81ff84',
                            padding: '20px',
                            borderRadius: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'baseline'
                          }}
                        >
                          <div
                            style={{ display: 'flex', flexDirection: 'row' }}
                          >
                            <input
                              type="checkbox"
                              style={{ marginRight: '5px', marginTop: '3px' }}
                            />
                            <p className="text-[black]">
                              Use Agentsys Framework
                            </p>
                          </div>
                          <div
                            style={{ display: 'flex', flexDirection: 'row' }}
                          >
                            <input
                              type="checkbox"
                              style={{ marginRight: '5px', marginTop: '3px' }}
                            />
                            <p className="text-[black]">
                              Burn 1000 tokens $AGSYS
                            </p>
                          </div>
                          <div
                            style={{ display: 'flex', flexDirection: 'row' }}
                          >
                            <input
                              type="checkbox"
                              style={{ marginRight: '5px', marginTop: '3px' }}
                            />
                            <p className="text-[black]">
                              Send 5% to community wallet
                            </p>
                          </div>
                        </section>
                        {/* <section className="flex flex-col sm:flex-row w-[90%]">
                          <section className="flex flex-col gap-4 w-full sm:w-[100%]">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">
                                Image
                                <span style={{ color: 'red' }}>*</span>
                              </p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <LogoImageUpload
                                  onChange={handleImageLogoChange}
                                  className="h-[175px]"
                                  style={undefined}
                                />
                              </section>
                            </section>
                          </section>
                        </section>
                        <label className="relative flex  text-[#2fcdf3] items-center p-2 text-[18px] w-[90%]">
                          Add Social Links
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                            className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
                          />
                          <span className="w-12 h-6 flex items-center flex-shrink-0 ml-4 p-1 bg-[#919191] rounded-full duration-300 ease-in-out peer-checked:bg-[#a48d33] peer-checked:after:bg-[#2fcdf3] after:w-6 after:h-6 after:bg-gray-300 after:rounded-full after:shadow-md after:duration-300 peer-checked:after:translate-x-4"></span>
                        </label>
                        <div
                          className={`w-[90%] ${
                            isChecked ? 'grid' : 'hidden'
                          } grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4`}
                        >
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">Twitter</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setTwitter}
                                  value={twitter}
                                />
                              </section>
                            </section>
                          </section>
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">Telegram</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setTelegram}
                                  value={telegram}
                                />
                              </section>
                            </section>
                          </section>
                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">Website</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setWebsite}
                                  value={website}
                                />
                              </section>
                            </section>
                          </section>

                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">Discord</p>
                            </div>
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                <Input
                                  placeholder="(optional)"
                                  label=""
                                  type="text"
                                  changeValue={setDiscord}
                                  value={discord}
                                />
                              </section>
                            </section>
                          </section>

                          <section className="flex flex-col gap-4">
                            <div className="LpBalance">
                              <p className="Text1 text-[black]">
                                Tip: coin data cannot be changed after creation
                              </p>
                            </div>
                          </section>
                        </div> */}
                        <section className="flex flex-col sm:flex-row w-[90%]">
                          <section className="flex flex-col gap-4 w-full sm:w-[100%]">
                            <section className="inputPanel">
                              <section className="inputPanelHeader">
                                {agentLogoImageUpload({onChange: handleImageLogoChange, className: "h-[36px]", style: undefined})}
                                {/* <agentLogoImageUpload
                                  onChange={handleImageLogoChange}
                                  className="h-[175px]"
                                  style={undefined}
                                /> */}
                              </section>
                            </section>
                          </section>
                        </section>

                        <button
                          className="text-[black] w-[90%] text-[12px]"
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            backgroundColor: '#ab94ff',
                            borderRadius: '8px',
                            height: '36px',
                            width: '30%',
                            textAlign: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <a href="https://x.com/agentsysdotio" target="_blank">
                            Connect Twitter
                          </a>
                        </button>
                      </>
                    </div>
                  </section>
                </>
              </section>
            </div>
            <BottomMenu />
          </div>
        }
      </div>
      <Footer />
    </div>
  )
}

export default App

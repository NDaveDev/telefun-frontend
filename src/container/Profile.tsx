/* eslint-disable jsx-a11y/alt-text */
// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { readContract } from '@wagmi/core'
import '../App.css'
import MultiCallAbi from '../config/MultiCallAbi.json'
import '../styles/MainContainer.css'
import Footer from '../components/Footer.jsx'
import { toast } from 'react-hot-toast'
import { ReactComponent as EditIcon } from '../icons/edit.svg'
import TopBar from '../components/TopBar.jsx'
import ProfileUploadBox from '../components/ProfileUploadBox.jsx'
import CustomRadioButton from '../components/CustomRadioButton.jsx'
import ClipLoader from 'react-spinners/ClipLoader'
import { StringParam, useQueryParam } from 'use-query-params'
import TradeCard from '../components/TradeCard.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import LaunchpadCard from '../components/LaunchpadCard.jsx'
import { multicallAddress, imageUrl, apiUrl, imageUploadUrl, ethPriceApiUrl, supportedChainIds, chainLogos, scanLinks } from '../utils/constants.ts'
import BottomMenu from '../components/BottomMenu.jsx'
import { config } from '../App.jsx'

const Profile = () => {
  let [profileAddress] = useQueryParam('address', StringParam)
  const { address } = useAccount()
  if (!profileAddress)
    profileAddress = address;
  const [userName, setUserName] = useState('@profile-logo')
  const [userTelegram, setUserTelegram] = useState('')
  const [userX, setUserX] = useState('')
  const [userWebsite, setUserWebsite] = useState('')

  const [logoPreview, setLogoPreview] = useState<string | null>()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoFileInput = useRef<HTMLInputElement>(null)
  let [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [fetched1, setFetched1] = useState(false)
  const [userAvatarUrl, setUserAvatarUrl] = useState('/img/profile-logo.png')

  const [selectedOption, setSelectedOption] = useState('Balances')
  const handleSelect = value => setSelectedOption(value)
  const [, setTotalLength] = useState(0)
  const [chadLists, setTeleFunListData] = useState([])
  const [chadBalances, setTeleFunBalances] = useState([])
  const [history, setHistory] = useState([{ amount: 0, name: '', token: '', type: '', date: '' }])

  const userBannerUrl = '/telefun.png'

  const handleEditIconClick = () => {
    setSelectedOption('Details')
  }

  useEffect(() => {
    const FetchDeployedData = async () => {
      try {
        setLoading(true)

        const ethPriceResponse = await fetch(ethPriceApiUrl, { method: 'GET' });
        const ethPriceData = await ethPriceResponse.json();
        const ethPrice = ethPriceData.USD;

        for (const chainId of supportedChainIds) {
          let mainInfo = await readContract(config,{
            address: multicallAddress[chainId],
            abi: MultiCallAbi,
            functionName: 'getUserDeployMainInfo',
            args: [profileAddress],
            chainId: chainId
          })
          let otherInfo = await readContract(config, {
            address: multicallAddress[chainId],
            abi: MultiCallAbi,
            functionName: 'getUserDeployOtherInfo',
            args: [profileAddress],
            chainId: chainId
          })
          if (mainInfo && otherInfo) {
            setTotalLength(mainInfo[0].length)
            if (mainInfo[0].length > 0) {
              for (let i = mainInfo[0].length - 1; i >= 0; i--) {
                const contractAddress = mainInfo[5][i]
                const virtualLpAmounts = Number(mainInfo[2][i]) * ethPrice
                const virtualLpTokenAmounts = Number(mainInfo[1][i]) / 10 ** 18
                const tokenPrice = Number(mainInfo[3][i])
                const marketCap = (tokenPrice * 1000000000 * Number(ethPrice)) / 10 ** 12
                const website = otherInfo[2][i]
                const twitter = otherInfo[3][i]
                const telegram = otherInfo[4][i]
                const progress = marketCap * 100 / 69000
                const liquidity = virtualLpAmounts
                const name = otherInfo[0][i]
                let logoUrl = imageUrl + contractAddress + '-logo.png'
                let bannerUrl = imageUrl + contractAddress + '-logo.png'
                let blockchainLogoUrl = chainLogos[chainId]
                let devAddress = mainInfo[6][i]
                let dexAddress = 'https://app.uniswap.org/swap'
                let dexName = 'Uniswap'
                const chadData = {
                  chainId,
                  progress: progress,
                  Liquidity: liquidity,
                  tokenName: name,
                  logoUrl: logoUrl,
                  bannerUrl: bannerUrl,
                  address: mainInfo[5][i],
                  depositedAmount: Number(mainInfo[4][i]) * ethPrice / 10 ** 18,
                  contractAddress: contractAddress,
                  dexAddress: dexAddress,
                  devAddress: devAddress,
                  dexName: dexName,
                  marketCap: marketCap,
                  website: website,
                  twitter: twitter,
                  telegram: telegram,
                  blockchainLogoUrl: blockchainLogoUrl
                }
                setTeleFunListData(prevState => [...prevState, chadData])
              }
            }
          }

        }
        setLoading(false)
        setFetched(true)
      } catch (e) {
        setLoading(false)
        console.error(e)
      }
    }
    const FetchBalances = async () => {
      try {
        setLoading(true)
        for (const chainId of supportedChainIds) {
          let mainInfo = await readContract(config, {
            address: multicallAddress[chainId],
            abi: MultiCallAbi,
            functionName: 'getUserBalance',
            args: [profileAddress],
            chainId: chainId
          })

          if (mainInfo) {
            setTotalLength(mainInfo[0].length)
            if (mainInfo[0].length > 0) {
              for (let i = mainInfo[0].length - 1; i >= 0; i--) {
                const name = mainInfo[0][i]
                const symbol = mainInfo[1][i]
                const tokenAddress = mainInfo[2][i]
                const balance = Number(mainInfo[3][i]) / (10 ** 18)
                let logoUrl = imageUrl + tokenAddress + '-logo.png'
                const chadData = {
                  chainId,
                  name: name,
                  symbol: symbol,
                  tokenAddress: tokenAddress,
                  logoUrl: logoUrl,
                  balance: balance
                }
                setTeleFunBalances(prev => [...prev, chadData])
              }
            }
          }

        }
        setLoading(false)
        setFetched1(true)
      } catch (e) {
        setLoading(false)
        console.error(e)
      }
    }

    const FetchTrades = async () => {
      try {
        await fetch(
          apiUrl + `/api/getUserHistory/${profileAddress}`,
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          if (data.length > 0) {
            let history = {}
            let historyData: any[] = []
            for (let i = 0; i < data?.length; i++) {
              let chainId = data[i].chainId
              let amount = data[i].amount
              let buyer = data[i].buyer
              let name = data[i].name
              let token = data[i].token
              let type = data[i].type
              let contract = data[i].contract
              let currentDate = Date.now()
              let timestamp = currentDate / 1000 - Number(data[i].timestamp)
              let date
              if (timestamp > 86400) {
                date = (timestamp / 86400).toFixed(0) + ' days ago'
              } else if (timestamp > 3600) {
                date = (timestamp / 3600).toFixed(0) + ' hours ago'
              } else if (timestamp > 0) {
                date = (timestamp / 60).toFixed(0) + ' mins ago'
              } else {
                date = ' just now'
              }
              history = { chainId, amount: amount, buyer: buyer, name: name, token: token, type: type, contract: contract, date: date }
              historyData.push(history)
            }
            setHistory(historyData)
          } else {
            setHistory([{ amount: 0, name: '', token: '', type: '', date: '' }])
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    
    if (selectedOption === 'Deploys' && !fetched) {
      FetchDeployedData()
    } else if (selectedOption === 'Balances' && !fetched1) {
      FetchBalances()
    } else if (selectedOption === 'Trades') {
      FetchTrades()
    }
  }, [selectedOption, profileAddress])

  useEffect(() => {
    const FetchInfo = async () => {
      try {
        setUserAvatarUrl(imageUrl + `profile-${profileAddress}.png`)
        await fetch(apiUrl + `/api/getProfile/${profileAddress}`, {
          method: 'GET'
        })
          .then(async res => {
            let data = await res.json()
            if (data.length > 0) {
              setUserName(data[0].name)
              setUserTelegram(data[0].telegram)
              setUserX(data[0].twitter)
              setUserWebsite(data[0].website)
            } else {
              setUserName('@Agentsysbot')
            }
          })
      } catch (e) {
        console.error(e)
      }
    }
    if (profileAddress) {
      FetchInfo()
    }
  }, [profileAddress, address])

  const LogoImageUpload = ({ onChange, className, style }) => {
    const handleLogoImageChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
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
        <ProfileUploadBox
          imageUrl={logoPreview}
          handleClick={onButtonClick}
          className={className}
          style={style}
        />
      </div>
    )
  }

  const [, setImageLogoFile] = useState(null)
  const handleImageLogoChange = file => {
    setImageLogoFile(file)
  }

  const onSave = async () => {
    try {
      setLoading(true)
      let logoUrl
      if (logoFile) {
        setUserAvatarUrl(logoPreview)
        const formData = new FormData()
        formData.append('file', logoFile, address)
        fetch(imageUploadUrl + 'api/profileUploads', {
          method: 'POST',
          body: formData
        })
          .then(async res => {
            logoUrl = await res.json()
            logoUrl = logoUrl.fileInfo.filename
          })
          .catch(error => {
            setLoading(false)
            console.error('Error:', error)
          })
      }
      const sendData = {
        profileAddress: address,
        name: userName,
        telegram: userTelegram,
        twitter: userX,
        website: userWebsite
      }
      const response = await fetch(apiUrl + '/api/addprofile', {
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
      toast.success(`Updated`)
      setLoading(false)


    } catch (err) {
      setLoading(false)
      toast.error(
        'There is a problem with your update. Try again later'
      )
    }
  }
  return (
    <div>
      <div className="GlobalContainer">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div className='max-w-7xl m-auto pt-48 pb-24 px-4 sm:px-12 sm:py-10'>
            <div
              className="profile-card"
              style={{
                backgroundImage: `url(${userBannerUrl})`,
                backgroundSize: '385px 135px',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                overflowX: 'hidden'
              }}
            >
              <div className="launchpad-eth-logo-container relative">
                <img src={userAvatarUrl} className="profile-avatar"
                  onError={event => {
                    event.target.src = "/img/profile-logo.png"
                    event.onerror = null
                  }} />
              </div>
              <div style={{ paddingTop: '72px' }} />
              <p className="profile-name absolute">
                {userName}{' '}
                {profileAddress === address && address && (
                  <button
                    onClick={handleEditIconClick}
                    style={{ all: 'unset', cursor: 'pointer' }}
                  >
                    <EditIcon className="profile-edit" />
                  </button>
                )}
              </p>
            </div>
            <section className="ProfileBox mt-8">
              <div className="custom-radio-button-wrapper">
                <CustomRadioButton
                  value="Balances"
                  selectedValue={selectedOption}
                  handleSelect={handleSelect}
                />
                <CustomRadioButton
                  value="Trades"
                  selectedValue={selectedOption}
                  handleSelect={handleSelect}
                />
                <CustomRadioButton
                  value="Deploys"
                  selectedValue={selectedOption}
                  handleSelect={handleSelect}
                />
                {profileAddress === address && address ?
                  <CustomRadioButton
                    value="Details"
                    selectedValue={selectedOption}
                    handleSelect={handleSelect}
                  /> :
                  <></>}

              </div>
              {selectedOption === 'Details' && address === profileAddress && (
                <>
                  <div className="profile-card rounded-[25px]">
                    <div className="user-details-wrapper w-full sm:w-[80%]">
                      <div className='flex flex-row gap-4 sm:gap-0 items-center w-full'>
                        <div className='flex justify-center items-center w-[30%]'>
                          <div className="custom-file-input-container w-[100px] h-[100px]">
                            <div className="profile-user-avatar">
                              <LogoImageUpload
                                onChange={handleImageLogoChange}
                                className=""
                                style={undefined}
                              />
                            </div>
                          </div>

                        </div>

                        <div className='flex flex-col gap-4 w-[70%]'>
                          <div className="profile-title">
                            <p>Username</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={userName}
                              className="profile-text-input w-full"
                              onChange={e => setUserName(e.target.value)}
                            />
                          </div>

                        </div>

                      </div>

                      <div className='flex flex-col gap-4 w-full py-4'>
                        <div className='flex flex-col gap-4 w-full'>
                          <div className="profile-title">
                            <p>Telegram</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={userTelegram}
                              className="profile-text-input w-full"
                              placeholder='https://'
                              onChange={e => setUserTelegram(e.target.value)}
                            />
                          </div>

                        </div>


                        <div className='flex flex-col gap-4 w-full'>
                          <div className="profile-title">
                            <p>X.com Link</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={userX}
                              className="profile-text-input w-full"
                              placeholder='https://'
                              onChange={e => setUserX(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className='flex flex-col gap-4 w-full'>
                          <div className="profile-title">
                            <p>Website Link</p>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={userWebsite}
                              className="profile-text-input w-full"
                              placeholder='https://'
                              onChange={e => setUserWebsite(e.target.value)}
                            />
                          </div>

                        </div>

                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button className="save-button w-24 h-12 justify-center" onClick={onSave}>
                        {!loading ?
                          'Save'
                          :
                          <ClipLoader
                            color={'#222'}
                            loading={loading}
                            size={20}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        }
                      </button>
                    </div>
                  </div>
                  <br />
                </>
              )}
              {selectedOption === 'Balances' ?
                <>
                  {chadBalances[0]?.name !== '' ?
                    <>
                      {!loading && chadBalances.map(({ chainId, name, symbol, tokenAddress, logoUrl, balance }, i) => (
                        <div key={i}>
                          <BalanceCard
                            chainId={chainId}
                            chainLogo={chainLogos[chainId]}
                            name={name}
                            symbol={symbol}
                            tokenAddress={tokenAddress}
                            Logo={
                              <img
                                src={logoUrl}
                                className="balance-token-logo"
                              />
                            }
                            balance={balance}
                          />
                        </div>
                      )
                      )}
                      {loading && (
                        <div className="flex flex-col gap-2 w-full items-center">
                          <p className="Text1" style={{ color: 'white' }}>
                            Loading...
                          </p>
                          <ClipLoader
                            color={'#afccc6'}
                            loading={true}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        </div>)}
                    </>
                    :
                    <>
                      <div className='text-white flex justify-center'>No Data</div>
                    </>}
                </>
                :
                <></>
              }
              {selectedOption === 'Trades' ?
                <>
                  <div className='trade-box'>
                    <div className='balanceContent'>
                      <div className="trade-header-container py-2">
                        <p className="Balance-token-name left-aligned">Token</p>
                        <p className="Balance-token-name left-aligned">Type</p>
                        <p className="Balance-token-name left-aligned">Amount</p>
                        <p className="Balance-token-name left-aligned">Date</p>
                      </div>
                    </div>

                  </div>
                  {history[0].name !== '' ?
                    history.map(({ chainId, amount, name, token, type, date }, i) => (
                      <TradeCard
                        name={name}
                        amount={amount}
                        token={token}
                        type={type}
                        date={date}
                        scanLink={scanLinks[chainId]}
                      />
                    )
                    ) :
                    <><div className='trades-box py-3 text-sm text-white flex justify-center'>No Data</div></>}

                </>
                :
                <></>
              }
              {selectedOption === 'Deploys' ?
                <>
                  <div className="launchpad-card-grid">
                    {!loading && chadLists.length > 0 && chadLists.map(({
                      chainId,
                      progress,
                      Liquidity,
                      tokenName,
                      logoUrl,
                      bannerUrl,
                      address,
                      depositedAmount,
                      contractAddress,
                      dexAddress,
                      devAddress,
                      dexName,
                      marketCap,
                      website,
                      twitter,
                      telegram,
                      blockchainLogoUrl
                    }, i) => (
                      tokenName !== '' ?
                        <LaunchpadCard
                          chainId={chainId}
                          progress={progress}
                          Liquidity={Liquidity}
                          tokenName={tokenName}
                          Logo={<img src={logoUrl} className="claim-card-logo" />}
                          Banner={bannerUrl}
                          chadAddress={address}
                          depositedAmount={depositedAmount}
                          contractAddress={contractAddress}
                          dexAddress={dexAddress}
                          devAddress={devAddress}
                          dexName={dexName}
                          marketCap={marketCap}
                          website={website}
                          twitter={twitter}
                          telegram={telegram}
                          BlockchainLogo={
                            <img
                              src={blockchainLogoUrl}
                              className="launchpad-blockchain-logo"
                            />
                          }
                        />
                        :
                        <></>

                    )
                    )
                    }
                  </div>
                  {!loading && chadLists.length === 0 && (
                    <div className='text-white flex justify-center'>No Data</div>
                  )}
                  {loading && (
                    <div className="flex flex-col gap-2 w-full items-center">
                      <p className="Text1" style={{ color: 'white' }}>
                        Loading...
                      </p>
                      <ClipLoader
                        color={'#afccc6'}
                        loading={true}
                        size={50}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </div>)}
                </>
                :
                <></>
              }
            </section>

          </div>
          <BottomMenu />
        </div>
      </div>
      <Footer />
    </div >
  )
}

export default Profile

import React, { useState, useEffect, useCallback } from 'react'
import ConnectButton from './ConnectButton.tsx'
import iconHamburger from '../icons/hamburger.svg'
import iconCross from '../icons/cross-icon.svg'
import iconTg from '../icons/tg.svg'
import iconX from '../icons/x.svg'
import iconChart from '../icons/chart.svg'
import iconTg1 from '../icons/tg-1.svg'
import iconX1 from '../icons/x-1.svg'
import iconChart1 from '../icons/chart-1.svg'
import logo from '../icons/logo.png'
// import LeftBar from './LeftBar'
import { useAccount, useSwitchChain, useChainId, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/react'
import TeleFunHeaderLink from './TeleFunHeaderLink.jsx'
import { Link } from 'react-router-dom'
import { useSpring, animated } from 'react-spring'
import formatNumber, {
  imageUrl,
  apiUrl,
  supportedChainIds,
  CHAIN_ID
} from '../utils/constants.ts'
import { ExampleEVM } from '../NewEVM.tsx'

const TopBar = animate => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [firstConnect, setFirstConnect] = useState(false)
  const { address, chainId, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const handleHamburgerClick = () => {
    setIsExpanded(!isExpanded)
  }
  const [history, setHistory] = useState('')

  useEffect(() => {
    // Add event listener for window resize
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('resize', handleResize)
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // const handleDocumentClick = event => {
  //   const leftBarElement = document.querySelector('.left-bar')
  //   const hamburgerMenuElement = document.querySelector('.left-bar-menu')

  //   // Check if the click is outside the left-bar
  //   if (
  //     !leftBarElement.contains(event.target) &&
  //     event.target !== hamburgerMenuElement
  //   ) {
  //     setIsExpanded(false)
  //   }
  // }

  // useEffect(() => {
  //   document.addEventListener('click', handleDocumentClick)

  //   return () => {
  //     document.removeEventListener('click', handleDocumentClick)
  //   }
  // }, [])

  const { open } = useWeb3Modal()
  const onConnect = async () => {
    await open()
  }

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

  const { switchChain } = useSwitchChain()
  const switchNetwork = async () => {
    try {
      console.log('switch network')
      await switchChain({ chainId: CHAIN_ID })
    } catch (e) {
      console.error(e)
    }
  }
  // useEffect(() => {
  //   if (isConnected === true) {
  //     if (!supportedChainIds.includes(chainId)) switchNetwork()
  //   }
  // }, [isConnected, chainId, switchChain])

  useEffect(() => {
    const FetchData = async () => {
      try {
        await fetch(apiUrl + `/api/getHistory`, {
          method: 'GET'
        }).then(async res => {
          let data = await res.json()
          if (data.length > 0) {
            let history
            let historyData = []
            for (let i = 0; i < data?.length; i++) {
              let chainId = data[i].chainId
              let amount = data[i].amount
              let buyer = data[i].buyer
              let name = data[i].name
              let token = data[i].token
              let type = data[i].type
              let contract = data[i].contract
              let avatarUrl = imageUrl + 'profile-' + data[i].buyer + '.png'
              history = {
                chainId: chainId,
                amount: amount,
                buyer: buyer,
                name: name,
                token: token,
                type: type,
                contract: contract,
                avatarUrl: avatarUrl
              }
              historyData.push(history)
            }
            setHistory(historyData)
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    FetchData()
  }, [])
  let currentPath = window.location.pathname

  const [animatedHistory, setAnimatedHistory] = useState([])

  useEffect(() => {
    if (animate) {
      if (animate) {
        setAnimatedHistory(history)
      } else {
        history()
      }
    }
  }, [history])

  const animateList = useCallback(() => {
    if (animate && history.length > 0 && animatedHistory.length > 0) {
      // Shift the list items by one
      const itemToMove = animatedHistory.shift()
      animatedHistory.push(itemToMove)
      setAnimatedHistory([...animatedHistory])
    }
  }, [animate, history, animatedHistory])

  useEffect(() => {
    let intervalId = null
    if (animate) {
      intervalId = setInterval(() => {
        animateList()
      }, 3000)
    }
    return () => {
      clearInterval(intervalId)
    }
  }, [animate, animateList])

  const overlayOpacity = useSpring({
    from: { opacity: 0 },
    to: [{ opacity: 0.8 }, { opacity: 0.6 }, { opacity: 0.2 }, { opacity: 0 }],
    config: {
      duration: 100,
      easing: t => t * (2 - t)
    }
  })

  const AnimatedOverlay = () => (
    <animated.div
      style={{
        ...overlayOpacity,
        position: 'absolute',
        top: 0,
        left: 'calc(50% - 320px / 2)',
        width: '320px',
        height: '100%',
        backgroundColor: 'white',
        zIndex: 1,
        borderRadius: '10px'
      }}
    />
  )

  const firstItemShakeAnimation = useSpring({
    from: { transform: 'translateX(0px)' },
    to: [
      { transform: 'translateX(-20px)' },
      { transform: 'translateX(15px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0px)' }
    ],
    config: {
      duration: 50, // Adjust duration as needed
      easing: t => t * (2 - t) // Easing function for a smooth start and end
    }
  })
  return (
    <>
      {/* <LeftBar
        isExpanded={isExpanded}
        onHamburgerClick={handleHamburgerClick}
      /> */}
      <div className="top-bar">
        {/* {sortedList.map(({ name, address, trending }, i) => ( */}
        {history.length > 0 ? (
          <div className="carousel-container">
            <div className="carousel-track">
              {history.map(
                (
                  {
                    chainId,
                    amount,
                    buyer,
                    name,
                    token,
                    contract,
                    type,
                    avatarUrl
                  },
                  i
                ) => (
                  // <animated.div
                  //   style={{
                  //     ...(i === 0 && animate.animate
                  //       ? firstItemShakeAnimation
                  //       : '')
                  //   }}
                  // >
                  // {animate.animate && i === 0 && <AnimatedOverlay />}

                  <div className="carousel-card" key={i}>
                    <img
                      src={avatarUrl}
                      width="32px"
                      height="32px"
                      alt=""
                      onError={event => {
                        event.target.src = '/img/profile-logo.png'
                        event.onerror = null
                      }}
                    />
                    <Link
                      className="top-bar-address"
                      to={'/profile/?address=' + buyer}
                      target={currentPath.includes('profile') ? '_blank' : ''}
                      rel="noreferrer"
                    >
                      {buyer.slice(0, 2) + buyer.slice(-3)}
                    </Link>
                    <span className="top-bar-description">
                      {formatNumber(Number(amount))} &nbsp;
                      {type === 'Bought' ? 'ETH' : 'Token'} {type}{' '}
                    </span>
                    <Link
                      className="top-bar-address"
                      to={`/buy/?chain=${chainId}&address=${contract}`}
                      rel="noreferrer"
                    >
                      <span className="top-bar-token">{name}</span>
                      <img
                        src={imageUrl + contract + '-logo.png'}
                        width="32px"
                        height="32px"
                        alt=""
                        className="top-bar-token-icon"
                      />
                    </Link>
                    <br />
                  </div>
                  // </animated.div>
                )
              )}
              {history.map(
                (
                  {
                    chainId,
                    amount,
                    buyer,
                    name,
                    token,
                    contract,
                    type,
                    avatarUrl
                  },
                  i
                ) => (
                  // <animated.div
                  //   style={{
                  //     ...(i === 0 && animate.animate
                  //       ? firstItemShakeAnimation
                  //       : '')
                  //   }}
                  // >
                  // {animate.animate && i === 0 && <AnimatedOverlay />}

                  <div className="carousel-card" key={i}>
                    <img
                      src={avatarUrl}
                      width="32px"
                      height="32px"
                      alt=""
                      onError={event => {
                        event.target.src = '/img/profile-logo.png'
                        event.onerror = null
                      }}
                    />
                    <Link
                      className="top-bar-address"
                      to={'/profile/?address=' + buyer}
                      target={currentPath.includes('profile') ? '_blank' : ''}
                      rel="noreferrer"
                    >
                      {buyer.slice(0, 2) + buyer.slice(-3)}
                    </Link>
                    <span className="top-bar-description">
                      {formatNumber(Number(amount))} &nbsp;
                      {type === 'Bought' ? 'ETH' : 'Token'} {type}{' '}
                    </span>
                    <Link
                      className="top-bar-address"
                      to={`/buy/?chain=${chainId}&address=${contract}`}
                      rel="noreferrer"
                    >
                      <span className="top-bar-token">{name}</span>
                      <img
                        src={imageUrl + contract + '-logo.png'}
                        width="32px"
                        height="32px"
                        alt=""
                        className="top-bar-token-icon"
                      />
                    </Link>
                    <br />
                  </div>
                  // </animated.div>
                )
              )}
            </div>
          </div>
        ) : (
          <></>
        )}

        {/* }))} */}
      </div>
      <div className="fixed top-0 left-0 w-full z-50 px-2">
        <div
          className={`my-4 max-w-7xl m-auto w-full bg-[#312185] rounded-[25px] lg:rounded-full lg:h-[70px] items-center ${
            isExpanded ? 'pb-2 px-2' : 'px-2'
          }`}
          // style={{
          //   boxShadow:
          //     'rgb(0, 0, 0) 2px 4px 0px 0px, rgb(255, 255, 255) 3px 4px 0px 0px inset'
          // }}
        >
          <div className="flex justify-between">
            <div className="flex flex-row items-center">
              <TeleFunHeaderLink className="w-[36px] h-[36px]" />
              <div
                className="lg:flex hidden flex-row gap-4"
                style={{ fontFamily: 'Dela Gothic One' }}
              >
                <Link to="/AllLaunches" className="left-bar-link">
                  <span
                    className={
                      currentPath === '/' || currentPath === '/AllLaunches'
                        ? 'text-[20px] uppercase text-[#c9e33f]'
                        : 'text-[20px] uppercase text-[#03a9f4] hover:text-[#c9e33f]'
                    }
                  >
                    Board
                  </span>
                </Link>
                <Link to="/CreateAgsys" className="left-bar-link">
                  <span
                    className={
                      currentPath === '/CreateAgsys'
                        ? 'text-[20px] uppercase text-[#c9e33f]'
                        : 'text-[20px] uppercase text-[#03a9f4] hover:text-[#c9e33f]'
                    }
                  >
                    Create&nbsp;Token
                  </span>
                </Link>
                <Link
                  to={'/profile/?address=' + address}
                  className="left-bar-link"
                >
                  <span
                    className={
                      currentPath.includes('/profile')
                        ? 'text-[20px] uppercase text-[#c9e33f]'
                        : 'text-[20px] uppercase text-[#03a9f4] hover:text-[#c9e33f]'
                    }
                  >
                    Portfolio
                  </span>
                </Link>
                <Link to="/Trending" className="left-bar-link">
                  <span
                    className={
                      currentPath === '/Trending'
                        ? 'text-[20px] uppercase text-[#c9e33f]'
                        : 'text-[20px] uppercase text-[#03a9f4] hover:text-[#c9e33f]'
                    }
                  >
                    Trending
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <div className="sm:flex hidden flex-row gap-4">
                <Link to="#" target="_blank" className="p-2">
                  <img src={iconX} className="w-[24px] h-[24px]" />
                </Link>
                <Link to="#" target="_blank" className="p-2">
                  <img src={iconTg} className="w-[24px] h-[24px]" />
                </Link>
                <Link to="#" target="_blank" className="p-2">
                  <img src={iconChart} className="w-[24px] h-[24px]" />
                </Link>
              </div>
              <div className="navConnectButtonBox">
                {!isConnected ? (
                  <>
                    <ExampleEVM />
                    {/* <button
                      className="navConnectButton hover:bg-[#399339]"
                      type="submit"
                      onClick={() => {
                        onConnectWallet()
                      }}
                    >
                      Connect<span className="navWallet"> Wallet</span>
                    </button> */}
                  </>
                ) : (
                  <section>
                    <div className="ChainGroupButton">
                      {supportedChainIds.includes(chainId) ? (
                        <button
                          className="navConnectButton"
                          type="submit"
                          onClick={() => disconnect()}
                        >
                          {address?.slice(0, 4) + '...' + address?.slice(-4)}
                        </button>
                      ) : (
                        <button
                          className="navConnectButton"
                          onClick={() => switchNetwork()}
                        >
                          {'Wrong Network'}
                        </button>
                      )}
                    </div>
                  </section>
                )}
              </div>
              {/* <ConnectButton /> */}
              <button
                className="bg-[#17134e] hover:bg-[#03a9f4] rounded-full p-2 flex lg:hidden"
                onClick={handleHamburgerClick}
              >
                <img
                  src={isExpanded ? iconCross : iconHamburger}
                  className="w-[32px] h-[32px]"
                />
              </button>
            </div>
          </div>
          {isExpanded && (
            <div
              className="relative bg-[#17134e] rounded-[25px] flex flex-col gap-[10px] px-[32px] pt-[40px] pb-[160px] sm:p-[48px] w-full items-center overflow-hidden"
              style={{ transform: 'none', transformOrigin: '50% 50% 0px' }}
            >
              {/* <div className='flex flex-col gap-4' style={{ fontFamily: "Dela Gothic One" }}>
              <Link to="/AllLaunches" className="left-bar-link">
                <span
                  className={
                    currentPath === '/' || currentPath === '/AllLaunches'
                      ? 'text-[20px] uppercase text-[#e2fea5]'
                      : 'text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]'
                  }
                >
                  Board
                </span>
              </Link>
              <Link to="/CreateTeleFun" className="left-bar-link">
                <span
                  className={
                    currentPath === '/CreateTeleFun'
                      ? 'text-[20px] uppercase text-[#e2fea5]'
                      : 'text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]'
                  }
                >
                  Create&nbsp;Token
                </span>
              </Link>
              <Link to={'/profile/?address=' + address} className="left-bar-link">
                <span
                  className={
                    currentPath.includes('/profile')
                      ? 'text-[20px] uppercase text-[#e2fea5]'
                      : 'text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]'
                  }
                >
                  Profile
                </span>
              </Link>
            </div> */}
              <div
                className="sm:hidden flex flex-col gap-4 items-center"
                style={{ fontFamily: 'Dela Gothic One' }}
              >
                <a href="https://t.me/agentsys" target="_blank" className="p-2">
                  {/* <img src={iconX1} className='w-[24px] h-[24px]' /> */}
                  <span className="text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]">
                    Telegram
                  </span>
                </a>
                <a
                  href="https://x.com/agentsysdotio"
                  target="_blank"
                  className="p-2"
                >
                  {/* <img src={iconTg1} className='w-[24px] h-[24px]' /> */}
                  <span className="text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]">
                    Twitter
                  </span>
                </a>
                <a
                  href="https://agentsys.io/documentation"
                  target="_blank"
                  className="p-2"
                >
                  {/* <img src={iconChart1} className='w-[24px] h-[24px]' /> */}
                  <span className="text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]">
                    Whitepaper
                  </span>
                </a>
                <Link to="#" target="_blank" className="p-2">
                  {/* <img src={iconChart1} className='w-[24px] h-[24px]' /> */}
                  <span className="text-[20px] uppercase text-[#f8ffe8] hover:text-[#e2fea5]">
                    Buy $AGSYS
                  </span>
                </Link>
              </div>
              <div
                className="h-[240px] sm:h-[350px] absolute right-[-57px] bottom-[-72px] sm:right-[-97px] sm:bottom-[-115px]"
                style={{
                  transform: 'rotate(-34deg)',
                  transformOrigin: '50% 50% 0px',
                  aspectRatio: '1.0713153724247226 / 1'
                }}
              >
                <img src={logo} className="" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TopBar

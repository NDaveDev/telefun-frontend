import React, { useState } from 'react'
import PropTypes from 'prop-types'
import WebsiteIcon from '../icons/website.png'
import TelegramIcon from '../icons/telegram.png'
import TwitterIcon from '../icons/x-icon.svg'
import CopyIcon from '../icons/copy.svg'
import ProfileIcon from '../icons/rocket.svg'
import DexIcon from '../icons/trader-joe.webp'
import { Link } from 'react-router-dom'

const LaunchpadCard = ({
  chainId,
  progress,
  Liquidity,
  tokenName,
  Logo,
  Banner,
  chadAddress,
  depositedAmount,
  contractAddress,
  dexAddress,
  devAddress,
  dexName,
  marketCap,
  website,
  twitter,
  telegram,
  BlockchainLogo
}) => {
  const link = `/buy/?chain=${chainId}&address=${chadAddress}`
  const progressText = progress
  if (progress > 100) {
    progress = 100
  }

  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)

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

  const SocialSection = ({ website, telegram, twitter }) => (
    <div
      className="social-section"
      style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
    >
      {twitter && (
        <a href={`${twitter}`} target="_blank" rel="noopener noreferrer">
          <img src={TwitterIcon} alt="Twitter" className="social-icon" />
        </a>
      )}
      {telegram && (
        <a href={`${telegram}`} target="_blank" rel="noopener noreferrer">
          <img src={TelegramIcon} alt="Telegram" className="social-icon" />
        </a>
      )}
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer">
          <img src={WebsiteIcon} alt="Website" className="social-icon" />
        </a>
      )}
    </div>
  )

  return (
    <Link to={link}>
      <div
        className="launchpad-card overflow-hidden relative"
      >
        {BlockchainLogo}
        <div className='relative flex flex-row items-center justify-center aspect-w-[208] w-full aspect-h-[85]  aspect-video'>
          <img src={Banner} sizes='100vw' width={208} height={85} className='object-cover object-center' />
        </div>
        <div className='p-4 sm:p-[20px] relative'>
          <div className="flex flex-row justify-between items-center">
            {Logo}
            {website || telegram || twitter ? (
              <SocialSection
                website={website}
                telegram={telegram}
                twitter={twitter}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="launchpad-header-container">
            <p className="launchpad-token-name left-aligned justify-start">{tokenName}</p>
          </div>
          <div className="flex flex-row items-center gap-2 text-[12px]">
            <div className='text-[#29f780] '>Created by:</div>
            <a
              href={'/profile?' + devAddress}
              className=""
            >
              <p className="text-[#29f780] ">
                {devAddress.slice(0, 2) + '..' + devAddress.slice(-3)}
              </p>
            </a>
          </div>
          {isTooltipDisplayed && <span className="tooltiptext">Copied!</span>}

          <div className="launchpad-progress-container">
            <div className="launchpad-progress-text">Progress</div>
            <div className="launchpad-progress-bar">
              {/* {progressText.toFixed(2)}% */}
              <div
                className="launchpad-progress-bar-filled"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <br />
          <div className="launchpad-addresses">
            <span className="left-aligned justify-start">Volume</span>
            <span className="center-aligned">MC</span>
            <span className="right-aligned">LP</span>
          </div>
          <div className="launchpad-addresses">
            <span className="left-aligned justify-start">
              <b>${depositedAmount.toFixed(0)}</b>
            </span>
            <span className="center-aligned">
              <b>${marketCap.toFixed(0)}</b>
            </span>
            <span className="right-aligned">
              <b>${(Liquidity / 10 ** 18).toFixed(0)}</b>
            </span>
          </div>

        </div>
      </div>
    </Link>
  )
}

LaunchpadCard.propTypes = {
  progress: PropTypes.number.isRequired,
  Liquidity: PropTypes.number.isRequired,
  tokenName: PropTypes.string.isRequired,

}

LaunchpadCard.defaultProps = {
  RugProof: false,
  AllIn: false
}

export default LaunchpadCard

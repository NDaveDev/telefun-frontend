import React from 'react'
import PropTypes from 'prop-types'

const TradeCard = ({
    amount,
    name,
    token,
    type,
    date,
    scanLink
}) => {
    const link = `${scanLink}address/${token}`
    return (
        <div className="trades-box">
            <a href={link} target="blank">
                <div className='balanceContent'>
                    <div className="trade-header-container">
                        <p className="Trade-token-name text-xs sm:text-sm left-aligned text-[#2fcdf3]">{name}</p>
                        <p className={`Balance-token-name text-xs sm:text-sm left-aligned ${type.toUpperCase() === 'SOLD' ? 'text-green-500' : 'text-red-500'}`}>&nbsp;{type.toUpperCase()}</p>
                        <p className="Balance-token-name text-xs sm:text-sm left-aligned">{amount.toFixed(3)} {type === 'Bought' ? '(ETH)' : '(' + name + ')'}</p>
                        <p className="Balance-token-name text-xs sm:text-sm left-aligned">&nbsp;{date}</p>
                    </div>
                </div>
            </a>
        </div>
    )
}

TradeCard.propTypes = {
    name: PropTypes.string.isRequired,
}

export default TradeCard

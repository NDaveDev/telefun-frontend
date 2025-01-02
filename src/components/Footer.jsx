import React from 'react'
import textLogo from '../assets/footertelefun.png'

const Footer = () => {
  return (
    <>
      <div className="max-w-7xl m-auto">
        <img src={textLogo} alt='' />
      </div>
      <p
        className="footMarkText"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <span className="chadfun">@ Agentsysbot, 2024</span>
      </p>
    </>
  )
}

export default Footer

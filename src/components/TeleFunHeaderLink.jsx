import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../icons/header-logo.png'

const TeleFunHeaderLink = ({ className }) => {
  return (
    <Link
      to="/AllLaunches"
      style={{ width: '100%', textDecoration: 'blink' }}
      className="logo-header"
    >
      <img src={logo} alt="logo" className={className} />
    </Link>
  )
}

export default TeleFunHeaderLink

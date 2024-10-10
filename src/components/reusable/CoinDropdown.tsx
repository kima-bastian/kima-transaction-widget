import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  // selectAvailableTokenList,
  selectSelectedToken,
  selectTheme
} from '../../store/selectors'
import { COIN_LIST } from '../../utils/constants'

const CoinDropdown = () => {
  const ref = useRef<any>()
  const [collapsed, setCollapsed] = useState(true)
  const selectedCoin = useSelector(selectSelectedToken)
  // const tokenList = useSelector(selectAvailableTokenList)
  const tokenList = ['USDC'] // Use just for demo
  const theme = useSelector(selectTheme)
  const Icon = COIN_LIST[selectedCoin || 'USDK']?.icon || COIN_LIST['USDK'].icon

  console.log("tokenlist: ", tokenList);
  console.log("selectedCoin: ", selectedCoin);

  useEffect(() => {
    const bodyMouseDowntHandler = (e: any) => {
      if (ref?.current && !ref.current.contains(e.target)) {
        setCollapsed(true)
      }
    }

    document.addEventListener('mousedown', bodyMouseDowntHandler)
    return () => {
      document.removeEventListener('mousedown', bodyMouseDowntHandler)
    }
  }, [setCollapsed])

  return (
    <div
      className={`coin-dropdown ${theme.colorMode} ${
        collapsed ? 'collapsed' : ''
      }`}
      onClick={() => setCollapsed((prev) => !prev)}
      ref={ref}
    >
      <div className='coin-wrapper'>
        {<Icon />}
        {selectedCoin}
      </div>
      <div
        className={`coin-menu ${theme.colorMode} ${collapsed ? 'collapsed' : ''}`}
      >
        {tokenList.map((token) => {
          const CoinIcon = COIN_LIST[token].icon || COIN_LIST['USDK'].icon
          return (
            <div className='coin-item' key={COIN_LIST[token]?.symbol}>
              {<CoinIcon />}
              <p>{COIN_LIST[token]?.symbol}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CoinDropdown

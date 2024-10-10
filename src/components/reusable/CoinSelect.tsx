import React, { useState } from 'react'
import {
  selectSelectedToken,
  selectMode,
  selectTheme,
  selectSourceChain,
  selectTargetChain
} from '../../store/selectors'
import { useSelector } from 'react-redux'
import { ModeOptions } from '../../interface'
import { setAmount } from '../../store/optionSlice'
import { useDispatch } from 'react-redux'
import { COIN_LIST, ChainName } from '../../utils/constants'

const CoinSelect = () => {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const mode = useSelector(selectMode)
  const selectedCoin = useSelector(selectSelectedToken)
  const sourceNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)
  const [amountValue, setAmountValue] = useState('')
  const Icon = COIN_LIST[selectedCoin || 'USDK'].icon

  return (
    <div className={`coin-select`}>
      <p>Select Amount of Token for Funding</p>
      {/* <div className='coin-list-container'>
        {coinList.map((coin, index) => (
          <div
            className={`card-item ${theme} ${
              index === selectedCoin ? 'active' : ''
            }`}
            key={coin.symbol}
            onClick={() => setCoin(index)}
          >
            {coin.icon}
            <span>{coin.symbol}</span>
          </div>
        ))}
      </div> */}
      <div className={`amount-input ${theme.colorMode}`}>
        <span>Amount:</span>
        <div className='input-wrapper'>
          <input
            type='number'
            value={amountValue || ''}
            readOnly={mode === ModeOptions.payment}
            onChange={(e) => {
              const _amount = +e.target.value
              const decimal =
                sourceNetwork === ChainName.BTC ||
                targetNetwork === ChainName.BTC
                  ? 8
                  : 2
              setAmountValue(e.target.value)
              dispatch(setAmount(_amount.toFixed(decimal)))
            }}
          />
          <div className='coin-label'>
            {<Icon />}
            <span>{selectedCoin}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoinSelect

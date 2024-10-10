import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCompliantOption,
  selectMode,
  selectSourceChain,
  selectTargetCompliant,
  selectTargetChain,
  selectTheme,
  selectTransactionOption,
  selectSelectedToken,
  selectServiceFee,
  selectFeeDeduct,
  selectAmount,
  selectSelectedBankAccount,
  selectTargetAddress
} from '../../store/selectors'
import { AddressInput, CoinDropdown, CustomCheckbox, WalletButton } from '.'
import { setAmount, setFeeDeduct } from '../../store/optionSlice'
import { ModeOptions, PaymentTitleOption } from '../../interface'
import NetworkDropdown from './NetworkDropdown'
import { COIN_LIST, ChainName } from '../../utils/constants'
import { formatterFloat } from '../../helpers/functions'
import ExpireTimeDropdown from './ExpireTimeDropdown'
import useIsWalletReady from '../../hooks/useIsWalletReady'
import AccountDropdown from './AccountDropdown'
import BankAccountDropdown from './BankAccountDropdown'

const OnrampForm = ({
  paymentTitleOption
}: {
  paymentTitleOption?: PaymentTitleOption
}) => {
  const dispatch = useDispatch()
  const mode = useSelector(selectMode)
  const theme = useSelector(selectTheme)
  const feeDeduct = useSelector(selectFeeDeduct)
  const serviceFee = useSelector(selectServiceFee)
  const compliantOption = useSelector(selectCompliantOption)
  const targetCompliant = useSelector(selectTargetCompliant)
  const transactionOption = useSelector(selectTransactionOption)
  const selectedCoin = useSelector(selectSelectedToken)
  const sourceNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)
  const targetAddress = useSelector(selectTargetAddress)
  const selectedBankAccount = useSelector(selectSelectedBankAccount)
  const [amountValue, setAmountValue] = useState('')
  const amount = useSelector(selectAmount)
  const { isReady } = useIsWalletReady()
  const Icon = COIN_LIST[selectedCoin || 'USDK']?.icon || COIN_LIST['USDK'].icon

  const errorMessage = useMemo(
    () =>
      compliantOption && targetCompliant !== 'low'
        ? `Target address has ${targetCompliant} risk`
        : '',
    [compliantOption, targetCompliant]
  )

  useEffect(() => {
    if (!errorMessage) return
    toast.error(errorMessage)
  }, [errorMessage])

  useEffect(() => {
    if (amountValue) return
    setAmountValue(amount)
  }, [amount])

  return (
    <div className='single-form'>
      <p className='payment-title' style={paymentTitleOption?.style}>
        {paymentTitleOption?.title}
      </p>

      <div className='form-item'>
        <span className='label'>Target Network</span>
          <NetworkDropdown />
      </div>
      {transactionOption ? (
        <div className={`form-item ${theme.colorMode}`}>
          <span className='label'>Target Address:</span>
          <strong>{targetAddress || "..."}</strong>
        </div>
      ) : (
        <div className='form-item wallet-button-item'>
          <span className='label'>Connect wallet:</span>
          <WalletButton />
        </div>
      )}
      {!isReady && !transactionOption && (
        <div>
          <h4 className='text-center'>or</h4>
          <div className={`form-item ${theme.colorMode}`}>
            <span className='label'>Input Address:</span>
            <AddressInput />
          </div>
        </div>
      )}
      <h3 className='text-center'>Select bank account</h3>
      <div className={`form-item ${theme.colorMode}`}>
        <span className='label'>Account:</span>
        <AccountDropdown />
      </div>
      <div className={`form-item ${theme.colorMode}`}>
        <span className='label'>Bank account:</span>
        <BankAccountDropdown />
      </div>
      <div className={`form-item ${theme.colorMode}`}>
        <span className='label'>Balance:</span>
        {selectedBankAccount?.balance !== undefined
          ? `${selectedBankAccount.balance} EUR`
          : '...'}
      </div>
      {!transactionOption ? (
        <div className={`form-item ${theme.colorMode}`}>
          <span className='label'>Amount:</span>
          <div className='amount-label-container'>
            <input
              type='number'
              value={amountValue || ''}
              onChange={(e) => {
                let _amount = +e.target.value
                const decimal =
                  sourceNetwork === ChainName.BTC ||
                  targetNetwork === ChainName.BTC
                    ? 8
                    : 2
                setAmountValue(e.target.value)
                dispatch(setAmount(_amount.toFixed(decimal)))
              }}
            />
            <CoinDropdown />
          </div>
        </div>
      ) : (
        <div className={`form-item ${theme.colorMode}`}>
          <span className='label'>Amount:</span>
          <div className={`amount-label ${theme.colorMode}`}>
            <span>{transactionOption.amount || ''}</span>
            <div className='coin-wrapper'>
              {<Icon />}
              {selectedCoin}
            </div>
          </div>
        </div>
      )}
      {mode === ModeOptions.bridge && serviceFee > 0 ? (
        <CustomCheckbox
          text={
            sourceNetwork === ChainName.BTC
              ? `Deduct ${formatterFloat.format(serviceFee)} BTC fee`
              : `Deduct $${formatterFloat.format(serviceFee)} fee`
          }
          checked={feeDeduct}
          setCheck={(value: boolean) => dispatch(setFeeDeduct(value))}
        />
      ) : null}
      {sourceNetwork === ChainName.BTC || targetNetwork === ChainName.BTC ? (
        <div className={`form-item ${theme.colorMode}`}>
          <span className='label'>Expire Time:</span>
          <ExpireTimeDropdown />
        </div>
      ) : null}
    </div>
  )
}

export default OnrampForm

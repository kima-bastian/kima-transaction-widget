import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { formatterFloat } from '../../helpers/functions'
import useIsWalletReady from '../../hooks/useIsWalletReady'
import { DAppOptions, ModeOptions } from '../../interface'
import {
  selectAmount,
  selectBankDetails,
  selectFeeDeduct,
  selectMode,
  selectSourceChain,
  selectServiceFee,
  selectSignature,
  selectTargetAddress,
  selectTargetChain,
  selectTheme,
  selectTransactionOption,
  selectDappOption,
  selectSelectedToken
} from '../../store/selectors'
import { ChainName, networkOptions } from '../../utils/constants'
import { getShortenedAddress } from '../../utils/functions'

const ConfirmDetails = ({ isApproved }: { isApproved: boolean }) => {
  const feeDeduct = useSelector(selectFeeDeduct)
  const mode = useSelector(selectMode)
  const dAppOption = useSelector(selectDappOption)
  const theme = useSelector(selectTheme)
  const amount = useSelector(selectAmount)
  const serviceFee = useSelector(selectServiceFee)
  const originNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)
  const targetAddress = useSelector(selectTargetAddress)
  const bankDetails = useSelector(selectBankDetails)
  const signature = useSelector(selectSignature)
  const transactionOption = useSelector(selectTransactionOption)
  const { walletAddress } = useIsWalletReady()
  const originNetworkOption = useMemo(
    () => networkOptions.filter((network) => network.id === originNetwork)[0],
    [networkOptions, originNetwork]
  )
  const targetNetworkOption = useMemo(
    () =>
      networkOptions.filter(
        (network) =>
          network.id ===
          (mode === ModeOptions.payment
            ? transactionOption?.targetChain
            : targetNetwork)
      )[0],
    [networkOptions, originNetwork]
  )
  const selectedCoin = useSelector(selectSelectedToken)

  const sourceWalletAddress = useMemo(() => {
    return getShortenedAddress(walletAddress || '')
  }, [walletAddress])

  const targetWalletAddress = useMemo(() => {
    return getShortenedAddress(
      (mode === ModeOptions.payment
        ? transactionOption?.targetAddress
        : targetAddress) || ''
    )
  }, [mode, transactionOption, targetAddress])

  const amountToShow = useMemo(() => {
    if (originNetwork === ChainName.BTC || targetNetwork === ChainName.BTC) {
      return (feeDeduct ? +amount : +amount + serviceFee).toFixed(8)
    }

    return formatterFloat.format(feeDeduct ? +amount : +amount + serviceFee)
  }, [amount, serviceFee, originNetwork, targetNetwork, feeDeduct])

  return (
    <div className={`confirm-details ${theme.colorMode}`}>
      <p>
        Step {isApproved ? '2' : '1'}&nbsp;of 2&nbsp;&nbsp;&nbsp;
        {isApproved
          ? 'Submit transaction'
          : originNetwork === ChainName.FIAT
            ? 'Bank Details'
            : 'Approval'}
      </p>
      {originNetwork === ChainName.FIAT ? (
        <div>
          <div className='detail-item'>
            <span className='label'>IBAN:</span>
            <p>ES6621000418401234567891</p>
            <span className='kima-card-network-label'>
              <originNetworkOption.icon />
              FIAT
            </span>
          </div>
          <div className='detail-item'>
            <span className='label'>Recipient:</span>
            <p>Kima Sandbox</p>
          </div>
          <div className='detail-item'>
            <span className='label'>BIC:</span>
            <p>CAIXESBBXXX</p>
          </div>
          <div className='detail-item'>
            <span className='label'>Description:</span>
            <p className='signature'>{signature}</p>
          </div>
        </div>
      ) : (
        <div className='detail-item'>
          <span className='label'>Source wallet:</span>
          <p>
            {dAppOption === DAppOptions.LPDrain
              ? targetWalletAddress
              : sourceWalletAddress}
          </p>
          <span className='kima-card-network-label'>
            <originNetworkOption.icon />
            {originNetworkOption.label}
          </span>
        </div>
      )}
      <div className='detail-item'>
        <span className='label'>Amount:</span>
        <p>
          {amountToShow} {selectedCoin}
        </p>
      </div>
      {targetNetwork === ChainName.FIAT ? (
        <div>
          <div className='detail-item'>
            <span className='label'>IBAN:</span>
            <p>{bankDetails.iban}</p>
            <span className='kima-card-network-label'>
              <targetNetworkOption.icon />
              FIAT
            </span>
          </div>
          <div className='detail-item'>
            <span className='label'>Recipient:</span>
            <p>{bankDetails.recipient}</p>
          </div>
        </div>
      ) : mode !== ModeOptions.onramp ? (
        <div className='detail-item'>
          <span className='label'>Target wallet:</span>
          <p>
            {dAppOption === DAppOptions.LPDrain
              ? sourceWalletAddress
              : targetWalletAddress}
          </p>
          <span className='kima-card-network-label'>
            <targetNetworkOption.icon />
            {targetNetworkOption.label}
          </span>
        </div>
      ): ''}
    </div>
  )
}

export default ConfirmDetails

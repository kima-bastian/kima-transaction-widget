import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
// import { formatterFloat } from '../../helpers/functions'
// import useIsWalletReady from '../../hooks/useIsWalletReady'
import {
  selectAmount,
  // selectFeeDeduct,
  // selectServiceFee,
  selectTheme,
  selectSelectedToken,
  selectSelectedAccount,
  selectSelectedBankAccount,
  selectTargetAddress,
  selectTargetChain
} from '../../store/selectors'
import { networkOptions } from '../../utils/constants'
import { getShortenedAddress } from '../../utils/functions'

const ConfirmOnrampDetails = () => {
  // const feeDeduct = useSelector(selectFeeDeduct)
  const theme = useSelector(selectTheme)
  const amount = useSelector(selectAmount)
  // const serviceFee = useSelector(selectServiceFee)
  // const originNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)
  // const { walletAddress } = useIsWalletReady()
  const targetAddress = useSelector(selectTargetAddress);
  const targetNetworkOption = useMemo(
    () => networkOptions.filter((network) => network.id === targetNetwork)[0],
    [networkOptions, targetNetwork]
  )
  const selectedCoin = useSelector(selectSelectedToken)
  const selectedAccount = useSelector(selectSelectedAccount)
  const selectedBankAccount = useSelector(selectSelectedBankAccount)

  // const sourceWalletAddress = useMemo(() => {
  //   return getShortenedAddress(walletAddress || '')
  // }, [walletAddress])

  // const amountToShow = useMemo(() => {
  //   if (originNetwork === ChainName.BTC || targetNetwork === ChainName.BTC) {
  //     return (feeDeduct ? +amount : +amount + serviceFee).toFixed(8)
  //   }

  //   return formatterFloat.format(feeDeduct ? +amount : +amount + serviceFee)
  // }, [amount, serviceFee, originNetwork, targetNetwork, feeDeduct])

  console.log("amount: ", amount);

  return (
    <div className={`confirm-details ${theme.colorMode}`}>
      <div className='detail-item'>
        <span className='label'>Target wallet:</span>
        <p>
          {getShortenedAddress(targetAddress)}
        </p>
        <span className='kima-card-network-label'>
          <targetNetworkOption.icon />
          {targetNetworkOption.label}
        </span>
      </div>

      <div className='detail-item'>
        <span className='label'>Amount:</span>
        <p>
          {parseFloat(amount)-1} {selectedCoin} (1 {selectedCoin} fee)
        </p>
      </div>

      <div className='detail-item'>
        <span className='label'>Account:</span>
        <p>
          {selectedAccount.name}
        </p>
      </div>

      <div className='detail-item'>
        <span className='label'>Bank account:</span>
        <p>
          {selectedBankAccount.name}
        </p>
      </div>
      
      <div className='detail-item'>
        <span className='label'>New balance:</span>
        <p>
          {selectedBankAccount.balance - parseFloat(amount)} EUR
        </p>
      </div>

    </div>
  )
}

export default ConfirmOnrampDetails

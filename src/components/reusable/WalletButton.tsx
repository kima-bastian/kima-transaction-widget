import React, { useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSolanaConnectModal,
  setTronConnectModal
} from '../../store/optionSlice'
import {
  selectCompliantOption,
  selectSelectedToken,
  selectSourceChain,
  selectSourceCompliant,
  selectTheme
} from '../../store/selectors'
import PrimaryButton from './PrimaryButton'
import useIsWalletReady from '../../hooks/useIsWalletReady'
import { ChainName } from '../../utils/constants'
import { getShortenedAddress } from '../../utils/functions'
import { connectWalletBtn } from '../../utils/testId'
import useBalance from '../../hooks/useBalance'
import { useWeb3Modal } from '@web3modal/ethers5/react'

const WalletButton = ({ errorBelow = false }: { errorBelow?: boolean }) => {
  const dispatch = useDispatch()
  const theme = useSelector(selectTheme)
  const selectedCoin = useSelector(selectSelectedToken)
  const sourceCompliant = useSelector(selectSourceCompliant)
  const compliantOption = useSelector(selectCompliantOption)
  const selectedNetwork = useSelector(selectSourceChain)
  const { isReady, statusMessage, walletAddress, connectBitcoinWallet } =
    useIsWalletReady()
  const { balance } = useBalance()
  const { open } = useWeb3Modal()

  const handleClick = () => {
    if (selectedNetwork === ChainName.SOLANA) {
      dispatch(setSolanaConnectModal(true))
      return
    }

    if (selectedNetwork === ChainName.TRON) {
      dispatch(setTronConnectModal(true))
      return
    }

    if (selectedNetwork === ChainName.BTC) {
      connectBitcoinWallet()
      return
    }

    open()
  }

  const errorMessage = useMemo(() => {
    if (!isReady) return statusMessage
    if (sourceCompliant !== 'low' && compliantOption)
      return `Source address has ${sourceCompliant} risk`
    return ''
  }, [isReady, statusMessage, sourceCompliant, compliantOption])

  useEffect(() => {
    if (!errorMessage) return
    toast.error(errorMessage)
  }, [errorMessage])

  return (
    <div
      className={`wallet-button ${theme.colorMode} ${
        errorBelow ? 'error-below' : ''
      }`}
      data-testid={connectWalletBtn}
    >
      <PrimaryButton clickHandler={handleClick}>
        {isReady ? `${getShortenedAddress(walletAddress || '')}` : 'Wallet'}
      </PrimaryButton>

      {isReady ? (
        <p className='balance-info'>
          {balance.toFixed(selectedCoin === 'WBTC' ? 8 : 2)}{' '}
          {selectedNetwork === ChainName.BTC ? 'BTC' : selectedCoin} available
        </p>
      ) : null}
    </div>
  )
}

export default WalletButton

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CheckIcon, WarningIcon } from '../../assets/icons'
import { Loading180Ring } from '../../assets/loading'
import { NetworkOptions, TransactionData } from '../../interface'
import {
  selectKimaExplorer,
  selectNetworkOption,
  selectRedirectUrl,
  selectTheme
} from '../../store/selectors'
import {
  ChainName,
  CHAIN_NAMES_TO_EXPLORER_MAINNET,
  CHAIN_NAMES_TO_EXPLORER_TESTNET,
  CHAIN_NAMES_TO_STRING
} from '../../utils/constants'
import { getShortenedAddress } from '../../utils/functions'
import CopyButton from './CopyButton'
import ExternalLink from './ExternalLink'

interface Props {
  step: number
  errorStep: number
  loadingStep: number
  data?: TransactionData
}

const stepInfo = [
  {
    title: 'Initialize'
  },
  {
    title: 'Source Transfer'
  },
  {
    title: 'Validation'
  },
  {
    title: 'Target Transfer'
  },
  {
    title: 'Finalize'
  }
]

const StepBox = ({ step, errorStep, loadingStep, data }: Props) => {
  const theme = useSelector(selectTheme)
  const explorerUrl = useSelector(selectKimaExplorer)
  const networkOption = useSelector(selectNetworkOption)
  const redirectUrl = useSelector(selectRedirectUrl)
  const CHAIN_NAMES_TO_EXPLORER =
    networkOption === NetworkOptions.mainnet
      ? CHAIN_NAMES_TO_EXPLORER_MAINNET
      : CHAIN_NAMES_TO_EXPLORER_TESTNET

  const [successTrigger, setSuccessTrigger] = useState(false)

  useEffect(() => {
    if (step === 4) {
      setTimeout(() => {
        setSuccessTrigger(true)
      }, 2000)
    }
  }, [step])

  useEffect(() => {
    if (successTrigger && redirectUrl) {
      setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 3000)
    }
  }, [successTrigger])

  return (
    <div className='kima-stepbox'>
      <div className='content-wrapper'>
        {successTrigger && redirectUrl ? (
          <div>
            <h1>Onramp transaction succeeded!</h1>
              <div>
                <p className='text-center'>You will now be redirected to the source page</p>
                <ExternalLink to={redirectUrl}>
                  Go back
                </ExternalLink>
              </div>
          </div>
        ) : (
          stepInfo.map((item, index) => (
            <div key={item.title} className='step-item'>
              <div className='info-item'>
                {index === loadingStep ? (
                  <Loading180Ring
                    fill={theme.colorMode === 'dark' ? 'white' : '#5aa0db'}
                  />
                ) : step >= index ? (
                  index === errorStep ? (
                    <WarningIcon />
                  ) : (
                    <CheckIcon />
                  )
                ) : null}
                <p>{item.title}</p>
              </div>
              {index === 0 && data?.kimaTxHash ? (
                <div className='info-item'>
                  <p>
                    Kima TX ID:{' '}
                    <ExternalLink
                      to={`${explorerUrl}/transactions/${data?.kimaTxHash}`}
                    >
                      {getShortenedAddress(data?.kimaTxHash || '')}
                    </ExternalLink>
                    <CopyButton text={data?.kimaTxHash} />
                  </p>
                </div>
              ) : null}
              {index === 1 && data?.tssPullHash ? (
                <div className='info-item'>
                  <p>
                    {
                      CHAIN_NAMES_TO_STRING[
                        data?.sourceChain || ChainName.ETHEREUM
                      ]
                    }{' '}
                    TX ID:
                    <ExternalLink
                      to={`https://${
                        CHAIN_NAMES_TO_EXPLORER[
                          data?.sourceChain || ChainName.ETHEREUM
                        ]
                      }/${data?.sourceChain === ChainName.TRON ? 'transaction' : 'tx'}/${data?.tssPullHash}${
                        data?.sourceChain === ChainName.SOLANA &&
                        networkOption === NetworkOptions.testnet
                          ? '?cluster=devnet'
                          : ''
                      }`}
                    >
                      {getShortenedAddress(data?.tssPullHash || '')}
                    </ExternalLink>
                    <CopyButton text={data?.tssPullHash || ''} />
                  </p>
                </div>
              ) : null}
              {index === 3 && data?.tssReleaseHash ? (
                <div className='info-item'>
                  <p>
                    {
                      CHAIN_NAMES_TO_STRING[
                        data?.targetChain || ChainName.ETHEREUM
                      ]
                    }{' '}
                    TX ID:
                    <ExternalLink
                      to={`https://${
                        CHAIN_NAMES_TO_EXPLORER[
                          data?.targetChain || ChainName.ETHEREUM
                        ]
                      }/${data?.targetChain === ChainName.TRON ? 'transaction' : 'tx'}/${data?.tssReleaseHash}${
                        data?.targetChain === ChainName.SOLANA &&
                        networkOption === NetworkOptions.testnet
                          ? '?cluster=devnet'
                          : ''
                      }`}
                    >
                      {getShortenedAddress(data?.tssReleaseHash || '')}
                    </ExternalLink>
                    <CopyButton text={data?.tssReleaseHash || ''} />
                  </p>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StepBox

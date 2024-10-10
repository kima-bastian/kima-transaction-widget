import React, { useEffect, useState } from 'react'
// import { Tooltip } from 'react-tooltip'
import { CrossIcon, FooterLogo, MinimizeIcon } from '../assets/icons'
import Progressbar from './reusable/Progressbar'
import { ExternalLink, NetworkLabel, StepBox } from './reusable'
import '../index.css'
import {
  ColorModeOptions,
  DAppOptions,
  ThemeOptions,
  TransactionData
} from '../interface'
import { Provider } from 'react-redux'
import { store } from '../store'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import { TransactionStatus } from '../utils/constants'
import { formatterFloat } from '../helpers/functions'
import { useSelector } from 'react-redux'
import {
  selectCloseHandler,
  selectDappOption,
  selectNodeProviderQuery,
  selectSuccessHandler,
  selectTxId
} from '../store/selectors'
import { useDispatch } from 'react-redux'
import { toast, Toaster } from 'react-hot-toast'
import { initialize } from '../store/optionSlice'

export const TransactionWidget = ({ theme }: { theme: ThemeOptions }) => {
  const [step, setStep] = useState(0)
  const [focus, setFocus] = useState(-1)
  const [errorStep, setErrorStep] = useState(-1)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingStep, setLoadingStep] = useState(-1)
  const [minimized, setMinimized] = useState(false)
  const [percent, setPercent] = useState(0)
  const [data, setData] = useState<TransactionData>()
  const dispatch = useDispatch()
  const txId = useSelector(selectTxId)
  const dAppOption = useSelector(selectDappOption)
  const closeHandler = useSelector(selectCloseHandler)
  const successHandler = useSelector(selectSuccessHandler)
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)

  useEffect(() => {
    if (!nodeProviderQuery || txId < 0) return
    const timerId = setInterval(async () => {
      // Monitor last transaction for now until transaction_data endpoint is ready
      try {
        let data
        let result: any
        const isLP =
          dAppOption === DAppOptions.LPAdd || dAppOption === DAppOptions.LPDrain

        // add onramp option

        if (isLP) {
          result = await fetchWrapper.get(
            `${nodeProviderQuery}/kima-finance/kima-blockchain/transaction/liquidity_transaction_data/${txId}`
          )
          data = result?.LiquidityTransactionData
        } else {
          result = await fetchWrapper.get(
            `${nodeProviderQuery}/kima-finance/kima-blockchain/transaction/transaction_data/${txId}`
          )
          data = result?.transactionData
        }

        if (!data) return

        // Status of last transaction
        if (isLP) {
          setData({
            status: data.status,
            sourceChain: data.chain,
            targetChain: data.chain,
            tssPullHash:
              dAppOption === DAppOptions.LPAdd ? data.tssReleaseHash : '',
            tssReleaseHash:
              dAppOption === DAppOptions.LPDrain ? data.tssReleaseHash : '',
            failReason: data.failReason,
            amount: +data.amount,
            symbol: data.symbol,
            kimaTxHash: data.kimaTxHash
          })
        } else {
          setData({
            status: data.status,
            sourceChain: data.originChain,
            targetChain: data.targetChain,
            tssPullHash: data.tssPullHash,
            tssReleaseHash: data.tssReleaseHash,
            failReason: data.failReason,
            amount: +data.amount,
            symbol: data.symbol,
            kimaTxHash: data.kimaTxHash
          })
        }

        if (data.status === TransactionStatus.COMPLETED) {
          clearInterval(timerId)
          setTimeout(() => {
            successHandler({
              txId
            })
          }, 3000)
        }
      } catch (e) {
        toast.error('rpc disconnected')
        console.log('rpc disconnected', e)
      }
    }, 10000)

    return () => {
      clearInterval(timerId)
    }
  }, [nodeProviderQuery, txId, dAppOption])

  useEffect(() => {
    if (!data) {
      setStep(0)
      setLoadingStep(0)
      return
    }

    console.log(data.status, errorMessage)
    setErrorStep(-1)
    const status = data.status as string

    if (
      status === TransactionStatus.AVAILABLE ||
      status === TransactionStatus.PULLED
    ) {
      setStep(1)
      setPercent(25)
      setLoadingStep(1)
    } else if (status === TransactionStatus.CONFIRMED) {
      setStep(2)
      setPercent(50)
      setLoadingStep(2)
    } else if (status.startsWith(TransactionStatus.UNAVAILABLE)) {
      setStep(1)
      setPercent(25)
      setErrorStep(1)
      setLoadingStep(-1)
      console.log(data.failReason)
      toast.error('Unavailable')
      setErrorMessage('Unavailable')
    } else if (status === TransactionStatus.KEYSIGNED) {
      setStep(3)
      setPercent(75)
      setLoadingStep(3)
    } else if (status === TransactionStatus.PAID) {
      setStep(3)
      setPercent(90)
      setLoadingStep(3)
    } else if (status === TransactionStatus.FAILEDTOPAY) {
      setStep(3)
      setPercent(90)
      setErrorStep(3)
      setLoadingStep(-1)
      console.log(data.failReason)
      toast.error('Failed to release tokens to target!')
      setErrorMessage('Failed to release tokens to target!')
    } else if (status === TransactionStatus.FAILEDTOPULL) {
      setStep(1)
      setPercent(25)
      setErrorStep(1)
      setLoadingStep(-1)
      console.log(data.failReason)
      toast.error('Failed to pull tokens from source!')
      setErrorMessage('Failed to pull tokens from source!')
    } else if (status === TransactionStatus.COMPLETED) {
      setStep(4)
      setPercent(100)
      setLoadingStep(-1)
    }
  }, [data?.status])

  return (
    <Provider store={store}>
      <div
        className={`kima-card transaction-card ${theme.colorMode} font-${
          theme.fontSize
        } ${minimized ? 'minimized' : ''}`}
        style={{
          fontFamily: theme.fontFamily,
          background:
            theme.colorMode === ColorModeOptions.light
              ? theme.backgroundColorLight
              : theme.backgroundColorDark
        }}
      >
        <div className='kima-card-header'>
          <div className='topbar'>
            <div className='title'>
              <h3>
                Transferring {data?.amount ? formatterFloat.format(data.amount): ''}{' '}
                {data?.symbol || ''}&nbsp;&nbsp;
                {`(${percent}%)`}
              </h3>
            </div>

            {!minimized ? (
              <div className='control-buttons'>
                <button
                  className='icon-button'
                  onClick={() => {
                    setMinimized(true)
                  }}
                >
                  <MinimizeIcon
                    fill={theme.colorMode === 'light' ? 'black' : 'white'}
                  />
                </button>
                {loadingStep < 0 ? (
                  <button
                    className='icon-button'
                    onClick={() => {
                      dispatch(initialize())
                      closeHandler()
                    }}
                  >
                    <CrossIcon
                      fill={theme.colorMode === 'light' ? 'black' : 'white'}
                    />
                  </button>
                ) : null}
              </div>
            ) : (
              <div className='control-buttons'>
                <div className='maximize' onClick={() => setMinimized(false)}>
                  View
                </div>
              </div>
            )}
          </div>
          {data?.sourceChain && data?.targetChain && (
            <NetworkLabel
              sourceChain={data?.sourceChain}
              targetChain={data?.targetChain}
              hasError={errorStep >= 0}
            />
          )}
        </div>

        <div className='kima-card-content'>
          <Progressbar
            step={step}
            focus={focus}
            errorStep={errorStep}
            setFocus={setFocus}
            loadingStep={loadingStep}
          />
          {/* <Tooltip
            step={step}
            focus={focus}
            errorStep={errorStep}
            loadingStep={loadingStep}
            data={data}
          /> */}
          <StepBox
            step={step}
            errorStep={errorStep}
            loadingStep={loadingStep}
            data={data}
          />
        </div>

        <div className='kima-card-footer'>
          <ExternalLink to={'https://kima.finance'}>
            <FooterLogo
              fill={theme.colorMode === 'light' ? 'black' : '#C5C5C5'}
            />
          </ExternalLink>
        </div>
        <Toaster
          position='top-right'
          reverseOrder={false}
          containerStyle={{
            position: 'absolute'
          }}
          toastOptions={{
            duration: 10 * 1000,
            style: {
              position: 'relative',
              top: '3rem',
              right: '1.5rem',
              margin: '5px 0',
              padding: '.7rem 1.5rem',
              color:
                theme.colorMode === ColorModeOptions.light ? 'black' : 'white',
              fontSize: '1em',
              borderRadius: '1em',
              border: '1px solid #66aae5',
              background: 'transparent'
            }
          }}
        />
        {/* <Tooltip
          id='error-tooltip'
          className={`error-tooltip ${theme.colorMode}`}
          content={errorMessage}
          style={{ zIndex: 10000 }}
        /> */}
      </div>
    </Provider>
  )
}

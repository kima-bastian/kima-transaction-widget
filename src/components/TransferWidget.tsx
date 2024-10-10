import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CrossIcon, FooterLogo } from '../assets/icons'
import {
  ConfirmDetails,
  ExternalLink,
  NetworkSelect,
  PrimaryButton,
  SecondaryButton,
  TxButton,
  WalletButton
} from './reusable'
import {
  ColorModeOptions,
  DAppOptions,
  ModeOptions,
  PaymentTitleOption,
  ThemeOptions,
  TitleOption
} from '../interface'
import SingleForm from './reusable/SingleForm'
import CoinSelect from './reusable/CoinSelect'

// store
import {
  initialize,
  setBankPopup,
  setAmount,
  setFeeDeduct,
  setPendingTxData,
  setPendingTxs,
  setSelectedToken,
  setSourceCompliant,
  setSubmitted,
  setTargetAddress,
  setTargetCompliant,
  setTheme,
  setTxId,
  setSelectedBankAccount
} from '../store/optionSlice'
import '../index.css'
import {
  selectAmount,
  selectBackendUrl,
  selectBankDetails,
  selectCloseHandler,
  selectCompliantOption,
  selectDappOption,
  selectErrorHandler,
  selectMode,
  selectNodeProviderQuery,
  selectSourceChain,
  selectSourceCompliant,
  selectTargetAddress,
  selectTargetCompliant,
  selectTargetChain,
  selectKycStatus,
  selectKeplrHandler,
  selectTransactionOption,
  selectFeeDeduct,
  selectExpireTime,
  selectBitcoinAddress,
  selectBitcoinPubkey,
  selectPendingTxs,
  selectSelectedBankAccount,
  selectSelectedAccount,
  selectSelectedToken
} from '../store/selectors'
import useIsWalletReady from '../hooks/useIsWalletReady'
import useServiceFee from '../hooks/useServiceFee'
import useAllowance from '../hooks/useAllowance'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import AddressInputWizard from './reusable/AddressInputWizard'
import { BankPopup, SolanaWalletConnectModal } from './modals'
import {
  ChainName,
  CHAIN_NAMES_TO_STRING,
  PendingTxData
} from '../utils/constants'
import { toast, Toaster } from 'react-hot-toast'
import useBalance from '../hooks/useBalance'
import useWidth from '../hooks/useWidth'
import useSign from '../hooks/useSign'
import TronWalletConnectModal from './modals/TronWalletConnectModal'
import {
  createHTLCScript,
  createReclaimPsbt,
  decodeBase64PSBT,
  htlcP2WSHAddress
} from '../utils/btc/htlc'
import {
  BitcoinNetworkType,
  sendBtcTransaction,
  signTransaction
} from 'sats-connect'
import * as bitcoin from 'bitcoinjs-lib' // you may comment this out during development to use the Node.js library so that you can get intellisense
import { sleep } from '../helpers/functions'
import PendingTxPopup from './modals/PendingTxPopup'
import { broadcastTransaction, getUTXOs } from '../utils/btc/utils'
import * as btc from '@kimafinance/btc-signer'
import ConfirmOnrampDetails from './reusable/ConfirmOnrampDetails'
import OnrampForm from './reusable/OnrampForm';

interface Props {
  theme: ThemeOptions
  feeURL: string
  helpURL?: string
  titleOption?: TitleOption
  paymentTitleOption?: PaymentTitleOption
}

export const TransferWidget = ({
  theme,
  feeURL,
  helpURL,
  titleOption,
  paymentTitleOption
}: Props) => {
  const dispatch = useDispatch()
  const mainRef = useRef<HTMLDivElement>(null)

  // State variables for UI
  const [isWizard, setWizard] = useState(false)
  const [formStep, setFormStep] = useState(0)
  const [wizardStep, setWizardStep] = useState(0)

  // Redux variables
  const mode = useSelector(selectMode)
  const dAppOption = useSelector(selectDappOption)
  const amount = useSelector(selectAmount)
  const feeDeduct = useSelector(selectFeeDeduct)
  const sourceChain = useSelector(selectSourceChain)
  const targetAddress = useSelector(selectTargetAddress)
  const targetChain = useSelector(selectTargetChain)
  const compliantOption = useSelector(selectCompliantOption)
  const sourceCompliant = useSelector(selectSourceCompliant)
  const targetCompliant = useSelector(selectTargetCompliant)
  const errorHandler = useSelector(selectErrorHandler)
  const keplrHandler = useSelector(selectKeplrHandler)
  const closeHandler = useSelector(selectCloseHandler)
  // const { options: selectedToken } = useCurrencyOptions()
  const selectedToken = useSelector(selectSelectedToken)
  const backendUrl = useSelector(selectBackendUrl)
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)
  const bankDetails = useSelector(selectBankDetails)
  const kycStatus = useSelector(selectKycStatus)
  const expireTime = useSelector(selectExpireTime)
  const bitcoinAddress = useSelector(selectBitcoinAddress)
  const bitcoinPubkey = useSelector(selectBitcoinPubkey)
  const transactionOption = useSelector(selectTransactionOption)
  const selectedAccount = useSelector(selectSelectedAccount)
  let selectedBankAccount = useSelector(selectSelectedBankAccount)

  // Hooks for wallet connection, allowance
  const [isCancellingApprove, setCancellingApprove] = useState(false)
  const [isApproving, setApproving] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isSigning, setSigning] = useState(false)
  const [isBTCSigning, setBTCSigning] = useState(false)
  const [isBTCSigned, setBTCSigned] = useState(false)
  const [btcHash, setBTCHash] = useState('')
  const [btcTimestamp, setBTCTimestamp] = useState(0)
  const [isConfirming, setConfirming] = useState(false)
  const [isVerifying, setVerifying] = useState(false)
  const { isReady, walletAddress } = useIsWalletReady()
  const pendingTxs = useSelector(selectPendingTxs)
  const {
    allowance,
    isApproved: approved,
    approve,
    poolAddress
  } = useAllowance({ setApproving, setCancellingApprove })
  const { isSigned, sign } = useSign({ setSigning })
  const { serviceFee: fee } = useServiceFee(isConfirming, feeURL)
  const { balance } = useBalance()
  const windowWidth = useWidth()
  const isApproved = useMemo(() => {
    if (sourceChain === ChainName.BTC) return isBTCSigned
    return approved
  }, [approved, isBTCSigned, sourceChain])

  useEffect(() => {
    if (!walletAddress) return
    dispatch(setTargetAddress(walletAddress))

    if (!compliantOption) return
    ;(async function () {
      try {
        const res = await fetchWrapper.post(
          `${backendUrl}/compliant`,
          JSON.stringify({
            address: walletAddress
          })
        )
        dispatch(setSourceCompliant(res))
      } catch (e) {
        toast.error('xplorisk check failed')
        console.log('xplorisk check failed', e)
      }
    })()
  }, [walletAddress, compliantOption])

  useEffect(() => {
    if (!targetAddress || !compliantOption) return
    ;(async function () {
      try {
        const res = await fetchWrapper.post(
          `${backendUrl}/compliant`,
          JSON.stringify({
            address: targetAddress
          })
        )
        dispatch(setTargetCompliant(res))
      } catch (e) {
        toast.error('xplorisk check failed')
        console.log('xplorisk check failed', e)
      }
    })()
  }, [targetAddress, compliantOption])

  useEffect(() => {
    if (!nodeProviderQuery) return
    ;(async function () {
      const res: any = await fetchWrapper.get(
        `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/pool_balance`
      )

      let poolsTable: any = []

      for (const pool of res.poolBalance) {
        for (const token of pool.balance) {
          poolsTable.push({
            chain: CHAIN_NAMES_TO_STRING[pool.chainName],
            symbol: token.tokenSymbol,
            balance: +token.amount
          })
        }
      }
      console.table(poolsTable)
    })()
  }, [nodeProviderQuery])

  useEffect(() => {
    console.log('selected token use effect: ', selectedToken)
    dispatch(setSelectedToken(selectedToken))
  }, [selectedToken])

  useEffect(() => {
    if (!isReady && mode !== ModeOptions.onramp) {
      if (formStep > 0) setFormStep(0)
      if (wizardStep > 0) setWizardStep(1)
    }
  }, [isReady, wizardStep, formStep, dAppOption])

  const checkPoolBalance = async () => {
    const res: any = await fetchWrapper.get(
      `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/pool_balance`
    )

    const poolBalance = res.poolBalance
    for (let i = 0; i < poolBalance.length; i++) {
      if (poolBalance[i].chainName === targetChain) {
        for (let j = 0; j < poolBalance[i].balance.length; j++) {
          if (poolBalance[i].balance[j].tokenSymbol !== selectedToken) continue
          if (+poolBalance[i].balance[j].amount >= +amount + fee) {
            return true
          }

          const symbol = selectedToken
          const errorString = `Tried to transfer ${amount} ${symbol}, but ${
            CHAIN_NAMES_TO_STRING[targetChain]
          } pool has only ${+poolBalance[i].balance[j].amount} ${symbol}`
          console.log(errorString)
          toast.error(errorString)

          toast.error(
            `${CHAIN_NAMES_TO_STRING[targetChain]} pool has insufficient balance!`
          )
          errorHandler(errorString)
          return false
        }
        return false
      }
    }
    console.log(`${CHAIN_NAMES_TO_STRING[targetChain]} pool error`)
    return false
  }

  const handleBTCFinish = async (hash, htlcAddress, timestamp) => {
    const params = JSON.stringify({
      fromAddress: walletAddress,
      senderPubkey: bitcoinPubkey,
      amount: feeDeduct ? amount : (+amount + fee).toFixed(8),
      txHash: hash,
      htlcTimeout: timestamp.toString(),
      htlcAddress
    })

    console.log(params)
    await fetchWrapper.post(`${backendUrl}/auth`, params)
    const result: any = await fetchWrapper.post(`${backendUrl}/htlc`, params)

    console.log(result)

    if (result?.code !== 0) {
      errorHandler(result)
      toast.error('Failed to submit htlc request!')
      return
    }

    do {
      await sleep(10000)
      try {
        const txInfo: any = await fetchWrapper.get(
          `${backendUrl}/btc/transaction?hash=${hash}`
        )

        if (txInfo?.status?.confirmed) {
          setBTCSigning(false)
          setBTCSigned(true)
          setBTCHash(hash)
          break
        }
      } catch (e) {
        console.log(e)
      }
    } while (1)
  }

  const handleHtlcContinue = async (expireTime, hash, amount) => {
    setBTCTimestamp(expireTime)
    setBTCSigning(false)
    setBTCSigned(true)
    setBTCHash(hash)
    dispatch(setFeeDeduct(true))
    dispatch(setAmount(amount))
  }

  const handleHtlcReclaim = async (expireTime, hash, amount) => {
    const htlcScript = createHTLCScript(
      bitcoinAddress,
      bitcoinPubkey,
      poolAddress,
      expireTime,
      bitcoin.networks.testnet
    )
    console.log('HTLC Script : ' + htlcScript.toString('hex'))

    const htlcAddress = htlcP2WSHAddress(htlcScript, bitcoin.networks.testnet)
    console.log('HTLC address : ' + htlcAddress)

    const [htlcUnspentOutputs] = await Promise.all([
      getUTXOs(BitcoinNetworkType.Testnet, htlcAddress!)
    ])

    if (htlcUnspentOutputs.length === 0) {
      alert('No unspent outputs found for HTLC address')
      return
    }

    // get the last element (i.e. the latest unspent output), assuming a chronological order from the API
    const htlcUtxo = htlcUnspentOutputs[htlcUnspentOutputs.length - 1]

    const fee = '5000' // set the miner fee amount, for now hardcoded // TODO: estimate the fee or allow the user to set it through min, mid, max choices

    const reclaimPsbtBase64 = createReclaimPsbt(
      bitcoinAddress,
      Math.round(+amount * 1e8).toString(),
      expireTime,
      htlcScript,
      htlcUtxo,
      bitcoin.networks.testnet,
      fee
    )

    await signTransaction({
      payload: {
        network: {
          type: BitcoinNetworkType.Testnet
        },
        message: 'Sign Reclaim Transaction',
        psbtBase64: reclaimPsbtBase64,
        broadcast: false,
        inputsToSign: [
          {
            address: bitcoinAddress,
            signingIndexes: [0],
            sigHash: btc.SigHash.ALL
          }
        ]
      },
      onFinish: async (response) => {
        console.log('response = ', response)
        console.log('reponse.txId = ', response.txId)
        const tx = decodeBase64PSBT(response.psbtBase64)
        // Finalize the PSBT
        tx.finalize()
        // Get the transaction in hexadecimal format
        const rawTxHex = tx.hex
        console.log('rawTxHex = ' + rawTxHex)
        try {
          const broadcastResponse = await broadcastTransaction(
            rawTxHex,
            '/testnet'
          )
          console.log('broadcastResponse = ' + broadcastResponse)
          console.log(broadcastResponse)
          // alert(
          //   'Transaction broadcasted successfully. TxId: ' + broadcastResponse
          // )

          const params = JSON.stringify({
            senderAddress: walletAddress,
            txHash: hash
          })

          await fetchWrapper.post(`${backendUrl}/auth`, params)
          const result: any = await fetchWrapper.post(
            `${backendUrl}/reclaim`,
            params
          )

          console.log(result)

          if (result?.code !== 0) {
            errorHandler(result)
            toast.error('Failed to submit htlc reclaim!')
            return
          }
        } catch (error) {
          toast.error('Error broadcasting the transaction!')
          console.error('Error broadcasting the transaction!', error)
        }
      },
      onCancel: () => {
        toast.error('Transaction cancelled!')
      }
    })
  }

  const handleSubmit = async () => {
    if (mode === ModeOptions.onramp) {
      setSubmitting(true)

      // build onramp transaction
      const params = {
        originAddress: walletAddress,
        originChain: 'FIAT',
        targetAddress: targetAddress || walletAddress,
        targetChain: targetChain,
        symbol: selectedToken,
        amount,
        fee: 1,
        htlcCreationHash: '',
        htlcCreationVout: 0,
        htlcExpirationTimestamp: '0',
        htlcVersion: '',
        senderPubKey: ''
      }

      const onrampParams = JSON.stringify({
        ...params,
        onramp: true,
        sourceAccountId: selectedAccount?.accountId,
        sourceBankAccountId: selectedBankAccount?.id
      })

      console.log('onramp params: ', onrampParams)

      await fetchWrapper.post(`${backendUrl}/auth`, JSON.stringify(params))
      const result: any = await fetchWrapper.post(
        `${backendUrl}/submit/onramp`,
        onrampParams
      )

      if (result?.code !== 0) {
        toast.error("Something went wrong");
      }

      const txId = result.kimaTxHash;

      let selectedBankAccountCopy = {...selectedBankAccount};
      selectedBankAccountCopy.balance -= parseFloat(amount);
      dispatch(setSelectedBankAccount(selectedBankAccountCopy));

      setSubmitting(false)
      dispatch(setTxId(txId));
      dispatch(setSubmitted(true));
      return
    }

    if (fee < 0 ) {
      toast.error('Fee is not calculated!')
      errorHandler('Fee is not calculated!')
      return
    }

    if (
      dAppOption !== DAppOptions.LPDrain &&
      balance < (feeDeduct ? +amount : +amount + fee)
    ) {
      toast.error('Insufficient balance!')
      errorHandler('Insufficient balance!')

      return
    }

    if (sourceChain === ChainName.BTC && +amount < 0.00015) {
      toast.error('Minimum BTC amount is 0.00015!')
      errorHandler('Minimum BTC amount is 0.00015!')
      return
    }

    if (sourceChain === ChainName.FIAT || targetChain === ChainName.FIAT) {
      if (kycStatus !== 'approved') {
        setVerifying(true)
        dispatch(setBankPopup(true))
        return
      }
    }

    if (sourceChain === ChainName.FIAT) {
      if (!isSigned) {
        sign()
        return
      }
    } else if (
      !isApproved &&
      dAppOption !== DAppOptions.LPDrain &&
      sourceChain !== ChainName.BTC
    ) {
      approve()
      return
    }

    if (sourceChain === ChainName.BTC && !isApproved) {
      setBTCSigning(true)
      const unixTimestamp =
        Math.floor(Date.now() / 1000) +
        (expireTime === '1 hour'
          ? 3600
          : expireTime === '2 hours'
            ? 7200
            : 10800)
      setBTCTimestamp(unixTimestamp)

      const htlcScript = createHTLCScript(
        bitcoinAddress,
        bitcoinPubkey,
        poolAddress,
        unixTimestamp,
        bitcoin.networks.testnet
      )

      const htlcAddress = htlcP2WSHAddress(htlcScript, bitcoin.networks.testnet)

      try {
        await sendBtcTransaction({
          payload: {
            network: {
              type: BitcoinNetworkType.Testnet
            },
            recipients: [
              {
                address: htlcAddress!,
                amountSats: BigInt(
                  Math.round((feeDeduct ? +amount : +amount + fee) * 100000000)
                )
              }
            ],
            senderAddress: bitcoinAddress!
          },
          onFinish: async (hash) => {
            handleBTCFinish(hash, htlcAddress, unixTimestamp)
          },
          onCancel: () => {
            toast.error('Transaction cancelled.')
            setBTCSigning(false)
          }
        })
      } catch (e) {
        setBTCSigning(false)
        console.log(e)
      }
      return
    }

    try {
      if (sourceChain === ChainName.FIAT || targetChain === ChainName.FIAT)
        return

      setSubmitting(true)

      if (
        dAppOption === DAppOptions.LPDrain ||
        dAppOption === DAppOptions.LPAdd
      ) {
        keplrHandler(walletAddress)
        return
      }

      if (!(await checkPoolBalance())) {
        setSubmitting(false)
        return
      }

      let params
      let feeParam
      if (sourceChain === ChainName.BTC || targetChain === ChainName.BTC) {
        feeParam = fee.toFixed(8)
      } else {
        feeParam = fee.toFixed(2)
      }

      if (sourceChain === ChainName.BTC) {
        params = JSON.stringify({
          originAddress: walletAddress,
          originChain: sourceChain,
          targetAddress:
            mode === ModeOptions.payment
              ? transactionOption?.targetAddress
              : targetAddress,
          targetChain: targetChain,
          symbol: selectedToken,
          amount: feeDeduct ? (+amount - fee).toFixed(8) : amount,
          fee: feeParam,
          htlcCreationHash: btcHash,
          htlcCreationVout: 0,
          htlcExpirationTimestamp: btcTimestamp.toString(),
          htlcVersion: 'v1',
          senderPubKey: bitcoinPubkey
        })
      } else {
        params = JSON.stringify({
          originAddress: walletAddress,
          originChain: sourceChain,
          targetAddress:
            mode === ModeOptions.payment
              ? transactionOption?.targetAddress
              : targetAddress,
          targetChain: targetChain,
          symbol: selectedToken,
          amount: feeDeduct ? (+amount - fee).toFixed(8) : amount,
          fee: feeParam,
          htlcCreationHash: '',
          htlcCreationVout: 0,
          htlcExpirationTimestamp: '0',
          htlcVersion: '',
          senderPubKey: ''
        })
      }

      console.log('tx params: ', params)
      await fetchWrapper.post(`${backendUrl}/auth`, params)
      const result: any = await fetchWrapper.post(
        `${backendUrl}/submit`,
        params
      )

      console.log(result)

      if (result?.code !== 0) {
        errorHandler(result)
        toast.error('Failed to submit transaction!')
        setSubmitting(false)
        return
      }

      let txId = -1

      for (const event of result.events) {
        if (event.type === 'transaction_requested') {
          for (const attr of event.attributes) {
            if (attr.key === 'txId') {
              txId = attr.value
            }
          }
        }
      }

      console.log(txId)
      setSubmitting(false)
      dispatch(setTxId(txId))
      dispatch(setSubmitted(true))
    } catch (e) {
      errorHandler(e)
      setSubmitting(false)
      console.log(e?.status !== 500 ? 'rpc disconnected here' : '', e)
      toast.error('rpc disconnected')
      toast.error('Failed to submit transaction')
    }
  }

  const onNext = () => {
    // Check if is onramp tx
    if (mode === ModeOptions.onramp) {
      if (formStep === 0) {
        if (!isReady && targetAddress?.length < 10)
          return toast.error('Invalid address')

        if (
          parseFloat(amount) < 0 ||
          selectedBankAccount?.balance < parseFloat(amount)
        )
          return toast.error('Invalid amount')

        if (!targetChain) return toast.error('Invalid network selected')

        // just set form step to 1
        setFormStep(1)
        return
      }
    }

    if (isWizard && wizardStep < 5) {
      if (wizardStep == 1 && !isReady) {
        toast.error('Wallet is not connected!')
        errorHandler('Wallet is not connected!')
        return
      }
      if (wizardStep === 3) {
        if (targetAddress) {
          setWizardStep(4)
        }
        return
      }
      if (wizardStep === 4) {
        if (fee >= 0 && +amount > 0) {
          setWizardStep(5)
        }
        return
      }

      if (fee > 0 && fee > +amount && feeDeduct) {
        toast.error('Fee is greater than amount to transfer!')
        errorHandler('Fee is greater than amount to transfer!')
        return
      }

      if (
        mode === ModeOptions.payment &&
        wizardStep === 1 &&
        fee >= 0 &&
        (!compliantOption ||
          (sourceCompliant === 'low' && targetCompliant === 'low'))
      ) {
        setConfirming(true)
        setWizardStep(5)
      } else setWizardStep((step) => step + 1)
    }

    if (!isWizard && !formStep) {
      if (isReady) {
        if (targetChain === ChainName.FIAT) {
          if (!bankDetails.iban) {
            toast.error('Invalid IBAN!')
            errorHandler('Invalid IBAN!')
            return
          }
          if (!bankDetails.recipient) {
            toast.error('Invalid Recipient Address!')
            errorHandler('Invalid Recipient Address!')
            return
          }
        }
        if (+amount <= 0) {
          toast.error('Invalid amount!')
          errorHandler('Invalid amount!')
          return
        }

        if (fee < 0 && mode !== ModeOptions.onramp) {
          toast.error('Fee is not calculated!')
          errorHandler('Fee is not calculated!')
          return
        }
        if (
          compliantOption &&
          (sourceCompliant !== 'low' || targetCompliant !== 'low')
        )
          return

        if (fee > 0 && fee > +amount && feeDeduct) {
          toast.error('Fee is greater than amount to transfer!')
          errorHandler('Fee is greater than amount to transfer!')
          return
        }

        if (mode === ModeOptions.payment || (targetAddress && +amount > 0)) {
          setConfirming(true)
          setFormStep(1)
        }
        return
      } else {
        toast.error('Wallet is not connected!')
        errorHandler('Wallet is not connected!')
      }
    }

    if ((isWizard && wizardStep === 5) || (!isWizard && formStep > 0)) {
      handleSubmit()
    }

    mainRef.current?.click()
  }

  const onBack = () => {
    if (isApproving || isSubmitting || isSigning) return
    if (isWizard && wizardStep > 0) {
      if (mode === ModeOptions.payment && wizardStep === 5) setWizardStep(1)
      else setWizardStep((step) => step - 1)
      setConfirming(false)
    }

    if (!isWizard && formStep > 0) {
      setFormStep(0)
      setConfirming(false)
    }

    if ((isWizard && wizardStep === 0) || (!isWizard && formStep === 0)) {
      closeHandler()
    }
  }

  const getButtonLabel = () => {
    if ((isWizard && wizardStep === 5) || (!isWizard && formStep === 1)) {
      if (mode === ModeOptions.onramp) {
        return isSubmitting ? 'Submitting...' : 'Submit'
      }

      if (sourceChain === ChainName.FIAT || targetChain === ChainName.FIAT) {
        if (isVerifying) return 'KYC Verifying...'
        if (kycStatus !== 'approved') {
          return 'KYC Verify'
        }
      }
      if (sourceChain === ChainName.BTC && !isApproved) {
        return isBTCSigning ? 'Signing...' : 'Sign'
      }

      if (
        (sourceChain !== ChainName.FIAT && isApproved) ||
        dAppOption === DAppOptions.LPDrain ||
        (sourceChain === ChainName.FIAT && isSigned)
      ) {
        return isSubmitting ? 'Submitting...' : 'Submit'
      } else if (sourceChain === ChainName.FIAT) {
        return isSigning ? 'Signing...' : 'Sign'
      } else {
        return isApproving ? 'Approving...' : 'Approve'
      }
    }

    return 'Next'
  }

  const onCancelApprove = () => {
    if (isCancellingApprove) return
    approve(true)
  }

  useEffect(() => {
    dispatch(setTheme(theme))
  }, [theme])

  useEffect(() => {
    if (!nodeProviderQuery || sourceChain !== ChainName.BTC || !walletAddress)
      return

    const updatePendingTxs = async () => {
      const result: any = await fetchWrapper.get(
        `${nodeProviderQuery}/kima-finance/kima-blockchain/transaction/get_htlc_transaction/${walletAddress}`
      )
      const data = result?.htlcLockingTransaction
      const txData: Array<PendingTxData> = []

      if (data.length > 0) {
        for (const tx of data) {
          let status = ''

          if (tx.status !== 'Completed') {
            status = 'Confirming'
          } else if (tx.pull_status === 'htlc_pull_available') {
            status = 'Pending'
          } else if (tx.pull_status === 'htlc_pull_in_progress') {
            status = 'In Progress'
          } else if (tx.pull_status === 'htlc_pull_succeed') {
            status = 'Completed'
          } else if (tx.pull_status === 'htlc_pull_failed') {
            status = 'Failed'
          }

          txData.push({
            hash: tx.txHash,
            amount: tx.amount,
            expireTime: tx.htlcTimestamp,
            status
          })
        }

        dispatch(setPendingTxData(txData))
        dispatch(
          setPendingTxs(
            txData.filter(
              (tx) => tx.status === 'Pending' || tx.status === 'Confirming'
            ).length
          )
        )
      }
    }

    const timerId = setInterval(() => {
      updatePendingTxs()
    }, 10000)

    updatePendingTxs()

    return () => {
      clearInterval(timerId)
    }
  }, [sourceChain, nodeProviderQuery, walletAddress])

  return (
    <div
      className={`kima-card ${theme.colorMode} font-${theme.fontSize}`}
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
              {mode === ModeOptions.onramp
                ? 'Onramp transaction'
                : (isWizard && wizardStep === 3) || (!isWizard && formStep > 0)
                  ? titleOption?.confirmTitle
                    ? titleOption?.confirmTitle
                    : 'Transfer Details'
                  : titleOption?.initialTitle
                    ? titleOption?.initialTitle
                    : 'New Transfer'}
            </h3>
          </div>
          <div className='control-buttons'>
            {pendingTxs > 0 ? <TxButton theme={theme} /> : null}
            <ExternalLink
              to={helpURL ? helpURL : 'https://docs.kima.finance/demo'}
            >
              <div className='menu-button'>I need help</div>
            </ExternalLink>
            <button
              className='icon-button'
              onClick={() => {
                if (isApproving || isSubmitting || isSigning) return
                dispatch(initialize())
                closeHandler()
              }}
              disabled={isApproving || isSubmitting || isSigning}
            >
              <CrossIcon
                fill={theme.colorMode === 'light' ? 'black' : 'white'}
              />
            </button>
          </div>
        </div>
      </div>

      <div className='kima-card-content' ref={mainRef}>
        {isWizard ? (
          mode !== ModeOptions.onramp ? (
            wizardStep === 0 ? (
              <NetworkSelect />
            ) : wizardStep === 1 ? (
              <div className='connect-wallet-step'>
                <p>Connect your wallet</p>
                <WalletButton errorBelow={true} />
              </div>
            ) : wizardStep === 2 ? (
              <NetworkSelect isOriginChain={false} />
            ) : wizardStep === 3 ? (
              <AddressInputWizard />
            ) : wizardStep === 4 ? (
              <CoinSelect />
            ) : (
              <ConfirmDetails
                isApproved={
                  sourceChain === ChainName.FIAT ? isSigned : isApproved
                }
              />
            )
          ) : wizardStep === 0 ? (
            <NetworkSelect />
          ) : wizardStep === 1 ? (
            <div className='connect-wallet-step'>
              <p>Connect your wallet</p>
              <WalletButton errorBelow={true} />
            </div>
          ) : wizardStep === 2 ? (
            <CoinSelect />
          ) : (
            <ConfirmDetails
              isApproved={
                sourceChain === ChainName.FIAT ? isSigned : isApproved
              }
            />
          )
        ) : mode !== ModeOptions.onramp ? (
          formStep === 0 ? (
            <SingleForm paymentTitleOption={paymentTitleOption} />
          ) : (
            <ConfirmDetails
              isApproved={
                sourceChain === ChainName.FIAT ? isSigned : isApproved
              }
            />
          )
        ) : formStep === 0 ? (
          <OnrampForm />
        ) : (
          <ConfirmOnrampDetails />
        )}
      </div>

      <div className='kima-card-footer'>
        <ExternalLink to={'https://kima.finance'}>
          <FooterLogo
            fill={theme.colorMode === 'light' ? 'black' : '#C5C5C5'}
          />
        </ExternalLink>

        <div className='button-group'>
          {mode !== ModeOptions.onramp && (
            <SecondaryButton
              clickHandler={() => {
                if (isApproving || isSubmitting || isSigning || isBTCSigning)
                  return
                setWizard((prev) => !prev)
              }}
              disabled={
                isApproving || isSubmitting || isSigning || isBTCSigning
              }
              theme={theme.colorMode}
              style={{ style: { width: '12em', marginLeft: 'auto' } }}
            >
              Switch to {isWizard ? 'Form' : 'Wizard'}
            </SecondaryButton>
          )}
          <SecondaryButton
            clickHandler={onBack}
            theme={theme.colorMode}
            disabled={isApproving || isSubmitting || isSigning || isBTCSigning}
          >
            {(isWizard && wizardStep > 0) || (!isWizard && formStep > 0)
              ? 'Back'
              : 'Cancel'}
          </SecondaryButton>
          {allowance > 0 &&
          ((isWizard && wizardStep === 5) ||
            (!isWizard && formStep === 1 && mode !== ModeOptions.onramp)) ? (
            <PrimaryButton
              clickHandler={onCancelApprove}
              isLoading={isCancellingApprove}
              disabled={isCancellingApprove}
            >
              {isCancellingApprove ? 'Cancelling Approval' : 'Cancel Approve'}
            </PrimaryButton>
          ) : null}
          <PrimaryButton
            clickHandler={onNext}
            isLoading={isApproving || isSubmitting || isSigning || isBTCSigning}
            disabled={isApproving || isSubmitting || isSigning || isBTCSigning}
          >
            {getButtonLabel()}
          </PrimaryButton>
        </div>
      </div>
      <SolanaWalletConnectModal />
      <TronWalletConnectModal />
      {sourceChain === ChainName.FIAT || targetChain === ChainName.FIAT ? (
        <BankPopup setVerifying={setVerifying} isVerifying={isVerifying} />
      ) : null}
      <Toaster
        position='top-right'
        reverseOrder={false}
        containerStyle={{
          position: 'absolute'
        }}
        toastOptions={{
          duration: 3 * 1000,
          style: {
            position: 'relative',
            top: windowWidth > 768 ? '3rem' : '1.5rem',
            right: windowWidth > 768 ? '1.5rem' : '0rem',
            margin: '5px 0',
            padding: '.7rem 1.5rem',
            color:
              theme.colorMode === ColorModeOptions.light ? 'black' : 'white',
            fontSize: '1em',
            borderRadius: '1em',
            border: '1px solid #66aae5',
            background:
              theme.colorMode === ColorModeOptions.light
                ? 'white'
                : theme.backgroundColorDark ?? '#1b1e25'
          }
        }}
      />
      <PendingTxPopup
        handleHtlcContinue={handleHtlcContinue}
        handleHtlcReclaim={handleHtlcReclaim}
      />
      {/* <Tooltip
        id='popup-tooltip'
        className={`popup-tooltip ${theme.colorMode}`}
        content={'Click to open popup to see pending transactions'}
        style={{ zIndex: 10000 }}
        place={'bottom'}
      /> */}
    </div>
  )
}

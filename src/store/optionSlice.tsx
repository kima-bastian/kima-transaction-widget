import * as toolkitRaw from '@reduxjs/toolkit'
import { PayloadAction } from '@reduxjs/toolkit'
const { createSlice } = toolkitRaw
// import { WalletName } from '@solana/wallet-adapter-base'
import {
  DAppOptions,
  ModeOptions,
  NetworkOptions,
  ThemeOptions,
  TransactionOption
} from '../interface'
import { PendingTxData } from '../utils/constants'

type BankDetails = {
  iban: string
  recipient: string
}

export type AddressOption = {
  [key: string]: string
}

export type TokenOptions = {
  [key: string]: AddressOption
}

export interface OptionState {
  theme: ThemeOptions // light or dark
  mode: ModeOptions // payment or bridge
  sourceChain: string // origin network on UI
  targetChain: string // target network on UI
  targetAddress: string // target address on UI
  bitcoinAddress: string // bitcoin address from xverse wallet
  bitcoinPubkey: string // bitcoin pubkey from xverse wallet
  tokenOptions: TokenOptions // token options from blockchain endpoint
  solanaConnectModal: boolean // solana wallet connection modal state - open or closed
  tronConnectModal: boolean // tron wallet connection modal state - open or closed
  helpPopup: boolean // shows popup to show help instructions
  hashPopup: boolean // shows popup to show hashes of transactions (kima tx, pull & release hashes)
  bankPopup: boolean // shows popup to simulate bank transfer
  pendingTxPopup: boolean // shows popup to show pending transactions
  walletAutoConnect: boolean // propmpt metamask connect automatically
  provider: any // Ethereum wallet provider
  dAppOption: DAppOptions // specify which dApp is using this widget
  solanaProvider: any // selected solana wallet provider - phantom, solflare or ...
  tronProvider: any //selected tron wallet provider - tronlink, okxwallet or ...
  submitted: boolean // if transaction is submitted, shows Transaction Widget to monitor status
  amount: string // amount input
  feeDeduct: boolean // whether deduct fee from amount or not
  transactionOption?: TransactionOption // input option from dApp
  errorHandler: Function // error callback function from dApp
  keplrHandler: Function // keplr wallet integration function from dApp
  closeHandler: Function // callback function for close event
  successHandler: Function // callback function for success event
  switchChainHandler: Function // callback function to switch chain request
  initChainFromProvider: boolean // chainId is initialized from provider or not
  serviceFee: number // service fee from kima node
  backendUrl: string // URL for kima-transaction-backend component
  nodeProviderQuery: string // REST API endpoint to query kima node
  kimaExplorerUrl: string // URL for kima explore (testnet, staging or demo)
  redirectUrl: string // URL for redirecting after a transaction is completed succesfully
  txId: number // transaction id to monitor it's status
  selectedToken: string // Currently selected token
  expireTime: string // Bitcoi HTLC expiration time
  availableTokenList: Array<string> // Available token list by source, target chain
  compliantOption: boolean // option to check compliant addresses
  sourceCompliant: string // source address is compliant or not
  targetCompliant: string // target address is compliant or not
  useFIAT: boolean // use FIAT Payment mockup or not?
  bankDetails: BankDetails
  targetNetworkFetching: boolean // is fetching available chains according to current source network or not
  signature: string // off-chain proof of target address for on-ramping fiat transaction
  uuid: string // uuid for depasify KYC
  kycStatus: string // kyc status from depasify
  pendingTxs: number // number of pending bitcoin transactions
  pendingTxData: Array<PendingTxData> // pending bitcoin transaction data
  networkOption: NetworkOptions // specify testnet or mainnet
  accounts: [] // array of accounts with balance from depasify
  selectedAccount: any
  selectedBankAccount: any
}

const initialState: OptionState = {
  networkOption: NetworkOptions.testnet,
  theme: {},
  tokenOptions: {},
  pendingTxs: 0,
  pendingTxData: [],
  kimaExplorerUrl: 'explorer.kima.finance',
  redirectUrl: '',
  mode: ModeOptions.bridge,
  sourceChain: '',
  targetChain: '',
  targetAddress: '',
  bitcoinAddress: '',
  bitcoinPubkey: '',
  solanaConnectModal: false,
  tronConnectModal: false,
  helpPopup: false,
  hashPopup: false,
  pendingTxPopup: false,
  bankPopup: false,
  walletAutoConnect: true,
  provider: undefined,
  dAppOption: DAppOptions.None,
  solanaProvider: undefined,
  tronProvider: undefined,
  submitted: false,
  amount: '',
  feeDeduct: false,
  errorHandler: () => void 0,
  closeHandler: () => void 0,
  successHandler: () => void 0,
  switchChainHandler: () => void 0,
  keplrHandler: () => void 0,
  initChainFromProvider: false,
  serviceFee: -1,
  backendUrl: '',
  nodeProviderQuery: '',
  txId: -1,
  selectedToken: 'USDK',
  availableTokenList: ['USDK'],
  compliantOption: true,
  sourceCompliant: 'low',
  targetCompliant: 'low',
  useFIAT: false,
  bankDetails: {
    iban: '',
    recipient: ''
  },
  targetNetworkFetching: false,
  signature: '',
  uuid: '',
  kycStatus: '',
  expireTime: '1 hour',
  accounts: [],
  selectedAccount: null,
  selectedBankAccount: null
}

export const optionSlice = createSlice({
  name: 'option',
  initialState,
  reducers: {
    initialize: (state) => {
      state.submitted = false
      state.txId = -1
      state.serviceFee = -1
      state.amount = ''
      state.targetAddress = ''
      state.compliantOption = true
      state.sourceCompliant = 'low'
      state.targetCompliant = 'low'
      ;(state.bitcoinAddress = ''), (state.useFIAT = false)
      ;(state.tokenOptions = {}),
        (state.bankDetails = {
          iban: '',
          recipient: ''
        })
      state.initChainFromProvider = false
      state.targetNetworkFetching = false
      state.signature = ''
    },
    setNetworkOption: (state, action: PayloadAction<NetworkOptions>) => {
      state.networkOption = action.payload
    },
    setPendingTxs: (state, action: PayloadAction<number>) => {
      state.pendingTxs = action.payload
    },
    setPendingTxData: (state, action: PayloadAction<Array<PendingTxData>>) => {
      state.pendingTxData = action.payload
    },
    setTokenOptions: (state, action: PayloadAction<TokenOptions>) => {
      state.tokenOptions = action.payload
    },
    setTheme: (state, action: PayloadAction<ThemeOptions>) => {
      state.theme = action.payload
    },
    setKimaExplorer: (state, action: PayloadAction<string>) => {
      state.kimaExplorerUrl = action.payload
    },
    setSourceChain: (state, action: PayloadAction<string>) => {
      state.sourceChain = action.payload
    },
    setTargetChain: (state, action: PayloadAction<string>) => {
      state.targetChain = action.payload
    },
    setTargetAddress: (state, action: PayloadAction<string>) => {
      state.targetAddress = action.payload
    },
    setBitcoinAddress: (state, action: PayloadAction<string>) => {
      state.bitcoinAddress = action.payload
    },
    setBitcoinPubkey: (state, action: PayloadAction<string>) => {
      state.bitcoinPubkey = action.payload
    },
    setSolanaConnectModal: (state, action: PayloadAction<boolean>) => {
      state.solanaConnectModal = action.payload
    },
    setTronConnectModal: (state, action: PayloadAction<boolean>) => {
      state.tronConnectModal = action.payload
    },
    setHelpPopup: (state, action: PayloadAction<boolean>) => {
      state.helpPopup = action.payload
    },
    setHashPopup: (state, action: PayloadAction<boolean>) => {
      state.hashPopup = action.payload
    },
    setPendingTxPopup: (state, action: PayloadAction<boolean>) => {
      state.pendingTxPopup = action.payload
    },
    setBankPopup: (state, action: PayloadAction<boolean>) => {
      state.bankPopup = action.payload
    },
    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload
    },
    setDappOption: (state, action: PayloadAction<DAppOptions>) => {
      state.dAppOption = action.payload
    },
    setWalletAutoConnect: (state, action: PayloadAction<boolean>) => {
      state.walletAutoConnect = action.payload
    },
    setSolanaProvider: (state, action: PayloadAction<any>) => {
      state.solanaProvider = action.payload
    },
    setTronProvider: (state, action: PayloadAction<any>) => {
      state.tronProvider = action.payload
    },
    setSubmitted: (state, action: PayloadAction<boolean>) => {
      state.submitted = action.payload
    },
    setTransactionOption: (state, action: PayloadAction<TransactionOption>) => {
      state.transactionOption = action.payload
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload
    },
    setErrorHandler: (state, action: PayloadAction<Function>) => {
      state.errorHandler = action.payload
    },
    setKeplrHandler: (state, action: PayloadAction<Function>) => {
      state.keplrHandler = action.payload
    },
    setCloseHandler: (state, action: PayloadAction<Function>) => {
      state.closeHandler = action.payload
    },
    setSwitchChainHandler: (state, action: PayloadAction<Function>) => {
      state.switchChainHandler = action.payload
    },
    setInitChainFromProvider: (state, action: PayloadAction<boolean>) => {
      state.initChainFromProvider = action.payload
    },
    setSuccessHandler: (state, action: PayloadAction<Function>) => {
      state.successHandler = action.payload
    },
    setServiceFee: (state, action: PayloadAction<number>) => {
      state.serviceFee = action.payload
    },
    setMode: (state, action: PayloadAction<ModeOptions>) => {
      state.mode = action.payload
    },
    setFeeDeduct: (state, action: PayloadAction<boolean>) => {
      state.feeDeduct = action.payload
    },
    setBackendUrl: (state, action: PayloadAction<string>) => {
      state.backendUrl = action.payload
    },
    setNodeProviderQuery: (state, action: PayloadAction<string>) => {
      state.nodeProviderQuery = action.payload
    },
    setTxId: (state, action: PayloadAction<number>) => {
      state.txId = action.payload
    },
    setSelectedToken: (state, action: PayloadAction<string>) => {
      state.selectedToken = action.payload
    },
    setAvailableTokenList: (state, action: PayloadAction<Array<string>>) => {
      state.availableTokenList = action.payload
    },
    setCompliantOption: (state, action: PayloadAction<boolean>) => {
      state.compliantOption = action.payload
    },
    setSourceCompliant: (state, action: PayloadAction<string>) => {
      state.sourceCompliant = action.payload
    },
    setTargetCompliant: (state, action: PayloadAction<string>) => {
      state.targetCompliant = action.payload
    },
    setUseFIAT: (state, action: PayloadAction<boolean>) => {
      state.useFIAT = action.payload
    },
    setBankDetails: (state, action: PayloadAction<BankDetails>) => {
      state.bankDetails = action.payload
    },
    setTargetChainFetching: (state, action: PayloadAction<boolean>) => {
      state.targetNetworkFetching = action.payload
    },
    setSignature: (state, action: PayloadAction<string>) => {
      state.signature = action.payload
    },
    setUuid: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload
    },
    setKYCStatus: (state, action: PayloadAction<string>) => {
      state.kycStatus = action.payload
    },
    setExpireTime: (state, action: PayloadAction<string>) => {
      state.expireTime = action.payload
    },
    setDepasifyAccounts: (state, action: PayloadAction<[]>) => {
      state.accounts = action.payload
    },
    setSelectedAccount: (state, action: PayloadAction<any> ) => {
      state.selectedAccount = action.payload
    },
    setSelectedBankAccount: (state, action: PayloadAction<any> ) => {
      state.selectedBankAccount = action.payload
    },
    setRedirectUrl: (state, action: PayloadAction<any>) => {
      state.redirectUrl = action.payload;
    }
  }
})

export const {
  initialize,
  setNetworkOption,
  setTokenOptions,
  setKimaExplorer,
  setTheme,
  setSourceChain,
  setTargetChain,
  setTargetAddress,
  setBitcoinAddress,
  setBitcoinPubkey,
  setSolanaConnectModal,
  setTronConnectModal,
  setHelpPopup,
  setHashPopup,
  setPendingTxPopup,
  setBankPopup,
  setSolanaProvider,
  setTronProvider,
  setProvider,
  setDappOption,
  setWalletAutoConnect,
  setSubmitted,
  setTransactionOption,
  setAmount,
  setErrorHandler,
  setKeplrHandler,
  setCloseHandler,
  setSuccessHandler,
  setSwitchChainHandler,
  setInitChainFromProvider,
  setServiceFee,
  setMode,
  setFeeDeduct,
  setBackendUrl,
  setNodeProviderQuery,
  setTxId,
  setSelectedToken,
  setAvailableTokenList,
  setCompliantOption,
  setSourceCompliant,
  setTargetCompliant,
  setUseFIAT,
  setBankDetails,
  setTargetChainFetching,
  setSignature,
  setUuid,
  setKYCStatus,
  setExpireTime,
  setPendingTxData,
  setPendingTxs,
  setDepasifyAccounts,
  setSelectedAccount,
  setSelectedBankAccount,
  setRedirectUrl
} = optionSlice.actions

export default optionSlice.reducer

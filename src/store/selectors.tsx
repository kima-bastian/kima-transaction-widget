import { RootState } from '.'

/*
 * Option
 */

export const selectNetworkOption = (state: RootState) =>
  state.option.networkOption
export const selectTokenOptions = (state: RootState) =>
  state.option.tokenOptions
export const selectTheme = (state: RootState) => state.option.theme
export const selectKimaExplorer = (state: RootState) =>
  state.option.kimaExplorerUrl
export const selectSourceChain = (state: RootState) => state.option.sourceChain
export const selectTargetChain = (state: RootState) => state.option.targetChain
export const selectTargetAddress = (state: RootState) =>
  state.option.targetAddress
export const selectBitcoinAddress = (state: RootState) =>
  state.option.bitcoinAddress
export const selectBitcoinPubkey = (state: RootState) =>
  state.option.bitcoinPubkey
export const selectSolanaConnectModal = (state: RootState) =>
  state.option.solanaConnectModal
export const selectTronConnectModal = (state: RootState) =>
  state.option.tronConnectModal
export const selectHelpPopup = (state: RootState) => state.option.helpPopup
export const selectHashPopup = (state: RootState) => state.option.hashPopup
export const selectPendingTxPopup = (state: RootState) =>
  state.option.pendingTxPopup
export const selectBankPopup = (state: RootState) => state.option.bankPopup
export const selectSolanaProvider = (state: RootState) =>
  state.option.solanaProvider
export const selectTronProvider = (state: RootState) =>
  state.option.tronProvider
export const selectProvider = (state: RootState) => state.option.provider
export const selectDappOption = (state: RootState) => state.option.dAppOption
export const selectWalletAutoConnect = (state: RootState) =>
  state.option.walletAutoConnect
export const selectSubmitted = (state: RootState) => state.option.submitted
export const selectTransactionOption = (state: RootState) =>
  state.option.transactionOption
export const selectAmount = (state: RootState) => state.option.amount
export const selectErrorHandler = (state: RootState) =>
  state.option.errorHandler
export const selectKeplrHandler = (state: RootState) =>
  state.option.keplrHandler
export const selectCloseHandler = (state: RootState) =>
  state.option.closeHandler
export const selectSuccessHandler = (state: RootState) =>
  state.option.successHandler
export const selectSwitchChainHandler = (state: RootState) =>
  state.option.switchChainHandler
export const selectInitChainFromProvider = (state: RootState) =>
  state.option.initChainFromProvider
export const selectServiceFee = (state: RootState) => state.option.serviceFee
export const selectMode = (state: RootState) => state.option.mode
export const selectFeeDeduct = (state: RootState) => state.option.feeDeduct
export const selectBackendUrl = (state: RootState) => state.option.backendUrl
export const selectNodeProviderQuery = (state: RootState) =>
  state.option.nodeProviderQuery
export const selectTxId = (state: RootState) => state.option.txId
export const selectSelectedToken = (state: RootState) =>
  state.option.selectedToken
export const selectAvailableTokenList = (state: RootState) =>
  state.option.availableTokenList
export const selectCompliantOption = (state: RootState) =>
  state.option.compliantOption
export const selectSourceCompliant = (state: RootState) =>
  state.option.sourceCompliant
export const selectTargetCompliant = (state: RootState) =>
  state.option.targetCompliant
export const selectUseFIAT = (state: RootState) => state.option.useFIAT
export const selectBankDetails = (state: RootState) => state.option.bankDetails
export const selectTargetChainFetching = (state: RootState) =>
  state.option.targetNetworkFetching
export const selectSignature = (state: RootState) => state.option.signature
export const selectUuid = (state: RootState) => state.option.uuid
export const selectKycStatus = (state: RootState) => state.option.kycStatus
export const selectExpireTime = (state: RootState) => state.option.expireTime
export const selectPendingTxs = (state: RootState) => state.option.pendingTxs
export const selectPendingTxData = (state: RootState) =>
  state.option.pendingTxData
export const selectSelectedAccount = (state: RootState) =>
  state.option.selectedAccount
export const selectSelectedBankAccount = (state: RootState) => 
  state.option.selectedBankAccount
export const selectAccounts = (state: RootState) =>
  state.option.accounts

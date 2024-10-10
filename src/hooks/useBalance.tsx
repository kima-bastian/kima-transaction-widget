import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Contract } from '@ethersproject/contracts'
import { formatUnits } from '@ethersproject/units'
import {
  useConnection,
  useWallet as useSolanaWallet
} from '@solana/wallet-adapter-react'
import {
  ChainName,
  CHAIN_IDS_TO_NAMES_MAINNET,
  CHAIN_IDS_TO_NAMES_TESTNET,
  CHAIN_NAMES_TO_IDS_TESTNET,
  CHAIN_NAMES_TO_IDS_MAINNET,
  isEVMChain
} from '../utils/constants'
import ERC20ABI from '../utils/ethereum/erc20ABI.json'
import {
  selectSelectedToken,
  selectErrorHandler,
  selectSourceChain,
  selectTokenOptions,
  selectBitcoinAddress,
  selectBackendUrl,
  selectNetworkOption
} from '../store/selectors'
import { getOrCreateAssociatedTokenAccount } from '../utils/solana/getOrCreateAssociatedTokenAccount'
import { PublicKey } from '@solana/web3.js'
import { useWallet as useTronWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { tronWebTestnet, tronWebMainnet } from '../tronweb'
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from '@web3modal/ethers5/react'
import { ethers } from 'ethers'
import { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers'
import { NetworkOptions, Web3ModalAccountInfo } from '../interface'
import { isEmptyObject } from '../helpers/functions'
import { fetchWrapper } from '../helpers/fetch-wrapper'

type ParsedAccountData = {
  /** Name of the program that owns this account */
  program: string
  /** Parsed account data */
  parsed: any
  /** Space used by account data */
  space: number
}

export default function useBalance() {
  const [balance, setBalance] = useState<number>(0)
  const web3ModalAccountInfo: Web3ModalAccountInfo = useWeb3ModalAccount()

  const { address: signerAddress, chainId: evmChainId } =
    web3ModalAccountInfo || {
      address: null,
      chainId: null,
      isConnected: null
    }

  const { walletProvider } = useWeb3ModalProvider()
  const selectedNetwork = useSelector(selectSourceChain)
  const errorHandler = useSelector(selectErrorHandler)
  const networkOption = useSelector(selectNetworkOption)
  const sourceChain = useMemo(() => {
    if (
      selectedNetwork === ChainName.SOLANA ||
      selectedNetwork === ChainName.TRON ||
      selectedNetwork === ChainName.BTC
    )
      return selectedNetwork
    const CHAIN_NAMES_TO_IDS =
      networkOption === NetworkOptions.mainnet
        ? CHAIN_NAMES_TO_IDS_MAINNET
        : CHAIN_NAMES_TO_IDS_TESTNET
    const CHAIN_IDS_TO_NAMES =
      networkOption === NetworkOptions.mainnet
        ? CHAIN_IDS_TO_NAMES_MAINNET
        : CHAIN_IDS_TO_NAMES_TESTNET
    if (CHAIN_NAMES_TO_IDS[selectedNetwork] !== evmChainId) {
      return CHAIN_IDS_TO_NAMES[evmChainId as number]
    }

    return selectedNetwork
  }, [selectedNetwork, evmChainId, networkOption])
  const { publicKey: solanaAddress, signTransaction } = useSolanaWallet()
  const { address: tronAddress } = useTronWallet()
  const btcAddress = useSelector(selectBitcoinAddress)
  const { connection } = useConnection()
  const kimaBackendUrl = useSelector(selectBackendUrl)
  const selectedCoin = useSelector(selectSelectedToken)
  const tokenOptions = useSelector(selectTokenOptions)
  const tokenAddress = useMemo(() => {
    if (isEmptyObject(tokenOptions) || sourceChain === ChainName.FIAT) return ''

    if (tokenOptions && typeof tokenOptions === 'object') {
      const coinOptions = tokenOptions[selectedCoin]
      if (coinOptions && typeof coinOptions === 'object') {
        return tokenOptions[selectedCoin][sourceChain]
      }
    }

    return ''
  }, [selectedCoin, sourceChain, tokenOptions])

  useEffect(() => {
    setBalance(0)
  }, [sourceChain])

  useEffect(() => {
    ;(async () => {
      if (!tokenAddress) return
      const tronWeb =
        networkOption === NetworkOptions.mainnet
          ? tronWebMainnet
          : tronWebTestnet
      try {
        if (!isEVMChain(sourceChain)) {
          if (sourceChain === ChainName.SOLANA && solanaAddress && connection) {
            const mint = new PublicKey(tokenAddress)
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
              connection,
              solanaAddress as PublicKey,
              mint,
              solanaAddress as PublicKey,
              signTransaction /* as SignerWalletAdapterProps['signTransaction']*/
            )

            const accountInfo = await connection.getParsedAccountInfo(
              fromTokenAccount.address
            )

            const parsedAccountInfo = accountInfo?.value
              ?.data as ParsedAccountData

            setBalance(
              +formatUnits(
                parsedAccountInfo.parsed?.info?.tokenAmount?.amount,
                parsedAccountInfo.parsed?.info?.tokenAmount?.decimals
              )
            )
            return
          }

          if (sourceChain === ChainName.TRON && tronAddress) {
            let trc20Contract = await tronWeb.contract(
              ERC20ABI.abi,
              tokenAddress
            )

            const decimals = await trc20Contract.decimals().call()
            const userBalance = await trc20Contract
              .balanceOf(tronAddress)
              .call()
            setBalance(+formatUnits(userBalance.balance, decimals))
            return
          }

          if (sourceChain === ChainName.BTC && btcAddress) {
            const btcInfo: any = await fetchWrapper.get(
              `${kimaBackendUrl}/btc/balance?address=${btcAddress}`
            )
            const balance = parseFloat(btcInfo.balance) / Math.pow(10, 8)

            setBalance(balance)
            return
          }
        }

        if (walletProvider) {
          const provider = new ethers.providers.Web3Provider(
            walletProvider as ExternalProvider | JsonRpcFetchFunc
          )
          const signer = provider?.getSigner()

          if (!tokenAddress || !signer || !signerAddress) return

          const erc20Contract = new Contract(tokenAddress, ERC20ABI.abi, signer)
          const decimals = await erc20Contract.decimals()
          const userBalance = await erc20Contract.balanceOf(signerAddress)

          setBalance(+formatUnits(userBalance, decimals))
        }
      } catch (error) {
        errorHandler(error)
      }
    })()
  }, [
    signerAddress,
    tokenAddress,
    sourceChain,
    solanaAddress,
    tronAddress,
    btcAddress,
    walletProvider,
    networkOption
  ])

  return useMemo(
    () => ({
      balance
    }),
    [balance]
  )
}

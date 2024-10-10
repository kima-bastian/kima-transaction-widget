import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Contract } from '@ethersproject/contracts'
import { formatUnits, parseUnits } from '@ethersproject/units'
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
  selectAmount,
  selectSelectedToken,
  selectDappOption,
  selectErrorHandler,
  selectNodeProviderQuery,
  selectSourceChain,
  selectServiceFee,
  selectTokenOptions,
  selectTargetChain,
  selectFeeDeduct,
  selectNetworkOption
} from '../store/selectors'
import { getOrCreateAssociatedTokenAccount } from '../utils/solana/getOrCreateAssociatedTokenAccount'
import { PublicKey, Transaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { createApproveTransferInstruction } from '../utils/solana/createTransferInstruction'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import { useWallet as useTronWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { tronWebMainnet, tronWebTestnet } from '../tronweb'
import { fromHex } from '../utils/func'
import { NetworkOptions, Web3ModalAccountInfo } from '../interface'
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider
} from '@web3modal/ethers5/react'
import { ethers } from 'ethers'
import { ExternalProvider, JsonRpcFetchFunc } from '@ethersproject/providers'
import { isEmptyObject, sleep } from '../helpers/functions'
import toast from 'react-hot-toast'

type ParsedAccountData = {
  /** Name of the program that owns this account */
  program: string
  /** Parsed account data */
  parsed: any
  /** Space used by account data */
  space: number
}

export default function useAllowance({
  setApproving,
  setCancellingApprove
}: {
  setApproving: any
  setCancellingApprove: any
}) {
  const [allowance, setAllowance] = useState<number>(0)
  const [decimals, setDecimals] = useState<number | null>(null)
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
  const dAppOption = useSelector(selectDappOption)
  const targetChain = useSelector(selectTargetChain)
  const feeDeduct = useSelector(selectFeeDeduct)
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
  const amount = useSelector(selectAmount)
  const serviceFee = useSelector(selectServiceFee)
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)
  const { connection } = useConnection()
  const { publicKey: solanaAddress, signTransaction: signSolanaTransaction } =
    useSolanaWallet()
  const { address: tronAddress, signTransaction: signTronTransaction } =
    useTronWallet()
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
  const [targetAddress, setTargetAddress] = useState<string>()
  const [poolAddress, setPoolAddress] = useState<string>('')

  const amountToShow = useMemo(() => {
    if (sourceChain === ChainName.BTC || targetChain === ChainName.BTC) {
      return (feeDeduct ? +amount : +amount + serviceFee).toFixed(8)
    }

    return (feeDeduct ? +amount : +amount + serviceFee).toFixed(2)
  }, [amount, serviceFee, sourceChain, targetChain, feeDeduct])

  const isApproved = useMemo(() => {
    return allowance >= +amountToShow
  }, [allowance, amountToShow, dAppOption])

  const updatePoolAddress = async () => {
    try {
      const result: any = await fetchWrapper.get(
        `${nodeProviderQuery}/kima-finance/kima-blockchain/kima/tss_pubkey`
      )
      if (result?.tssPubkey?.length < 1) {
        return
      }

      if (sourceChain === ChainName.SOLANA && !result.tssPubkey[0].eddsa) {
        console.log('solana pool address is missing')
        toast.error('solana pool address is missing')
      }

      setPoolAddress(result.tssPubkey[0].reserved)
      setTargetAddress(
        sourceChain === ChainName.SOLANA
          ? result.tssPubkey[0].eddsa
          : sourceChain === ChainName.TRON
            ? fromHex(result.tssPubkey[0].ecdsa)
            : result.tssPubkey[0].ecdsa
      )
    } catch (e) {
      console.log('rpc disconnected', e)
      toast.error('rpc disconnected')
    }
  }

  useEffect(() => {
    if (!nodeProviderQuery) return
    updatePoolAddress()
  }, [nodeProviderQuery, sourceChain])

  useEffect(() => {
    ;(async () => {
      try {
        const tronWeb =
          networkOption === NetworkOptions.mainnet
            ? tronWebMainnet
            : tronWebTestnet
        if (!isEVMChain(sourceChain)) {
          if (solanaAddress && tokenAddress && connection) {
            const mint = new PublicKey(tokenAddress)
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
              connection,
              solanaAddress as PublicKey,
              mint,
              solanaAddress as PublicKey,
              signSolanaTransaction /* as SignerWalletAdapterProps['signTransaction']*/
            )

            const accountInfo = await connection.getParsedAccountInfo(
              fromTokenAccount.address
            )
            console.log('solana token account: ', accountInfo)

            const parsedAccountInfo = accountInfo?.value
              ?.data as ParsedAccountData

            setDecimals(parsedAccountInfo.parsed?.info?.tokenAmount?.decimals)
            setAllowance(
              parsedAccountInfo.parsed?.info?.delegate === targetAddress
                ? parsedAccountInfo.parsed?.info?.delegatedAmount?.uiAmount
                : 0
            )
          } else if (tronAddress && tokenAddress) {
            let trc20Contract = await tronWeb.contract(
              ERC20ABI.abi,
              tokenAddress
            )

            const decimals = await trc20Contract.decimals().call()
            const userAllowance = await trc20Contract
              .allowance(tronAddress, targetAddress)
              .call()

            setDecimals(+decimals)
            setAllowance(+formatUnits(userAllowance, decimals))
          } else {
            setAllowance(0)
          }
          return
        }

        const provider = new ethers.providers.Web3Provider(
          walletProvider as ExternalProvider | JsonRpcFetchFunc
        )
        const signer = provider?.getSigner()
        if (!tokenAddress || !targetAddress || !signer || !signerAddress) return

        const erc20Contract = new Contract(tokenAddress, ERC20ABI.abi, signer)
        const decimals = await erc20Contract.decimals()
        const userAllowance = await erc20Contract.allowance(
          signerAddress,
          targetAddress
        )

        setDecimals(+decimals)
        setAllowance(+formatUnits(userAllowance, decimals))
      } catch (error) {
        errorHandler(error)
      }
    })()
  }, [
    signerAddress,
    tokenAddress,
    targetAddress,
    sourceChain,
    solanaAddress,
    tronAddress,
    walletProvider,
    networkOption
  ])

  const approve = useCallback(
    async (isCancel = false) => {
      if (isEVMChain(sourceChain)) {
        const provider = new ethers.providers.Web3Provider(
          walletProvider as ExternalProvider | JsonRpcFetchFunc
        )
        const signer = provider.getSigner()
        if (!decimals || !tokenAddress || !signer || !targetAddress) return

        try {
          const erc20Contract = new Contract(tokenAddress, ERC20ABI.abi, signer)

          isCancel ? setCancellingApprove(true) : setApproving(true)

          const approve = await erc20Contract.approve(
            targetAddress,
            parseUnits(isCancel ? '0' : amountToShow, decimals),
            networkOption === NetworkOptions.mainnet &&
              sourceChain === ChainName.ETHEREUM
              ? { gasLimit: 60000 }
              : {}
          )

          await approve.wait()
          isCancel ? setCancellingApprove(false) : setApproving(false)
          setAllowance(+amountToShow)
        } catch (error) {
          errorHandler(error)
          isCancel ? setCancellingApprove(false) : setApproving(false)
        }

        return
      }

      if (sourceChain === ChainName.TRON) {
        if (
          !decimals ||
          !tokenAddress ||
          !targetAddress ||
          !signTronTransaction
        )
          return

        try {
          isCancel ? setCancellingApprove(true) : setApproving(true)
          const functionSelector = 'approve(address,uint256)'
          const parameter = [
            { type: 'address', value: targetAddress },
            {
              type: 'uint256',
              value: parseUnits(
                isCancel ? '0' : amountToShow,
                decimals
              ).toString()
            }
          ]

          const tronWeb =
            networkOption === NetworkOptions.mainnet
              ? tronWebMainnet
              : tronWebTestnet
          const tx = await tronWeb.transactionBuilder.triggerSmartContract(
            tronWeb.address.toHex(tokenAddress),
            functionSelector,
            {},
            parameter,
            tronWeb.address.toHex(tronAddress)
          )
          const signedTx = await signTronTransaction(tx.transaction)
          await tronWeb.trx.sendRawTransaction(signedTx)

          isCancel ? setCancellingApprove(false) : setApproving(false)
          setAllowance(+amountToShow)
        } catch (error) {
          errorHandler(error)
          isCancel ? setCancellingApprove(false) : setApproving(false)
        }
        return
      }

      // Solana
      if (!signSolanaTransaction) return

      try {
        isCancel ? setCancellingApprove(true) : setApproving(true)
        const mint = new PublicKey(tokenAddress)
        const toPublicKey = new PublicKey(targetAddress as string)
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          solanaAddress as PublicKey,
          mint,
          solanaAddress as PublicKey,
          signSolanaTransaction /* as SignerWalletAdapterProps['signTransaction']*/
        )

        const transaction = new Transaction().add(
          createApproveTransferInstruction(
            fromTokenAccount.address, // source
            toPublicKey, // dest
            solanaAddress as PublicKey,
            isCancel ? 0 : +amountToShow * Math.pow(10, decimals ?? 6), // amount * LAMPORTS_PER_SOL,
            [],
            TOKEN_PROGRAM_ID
          )
        )

        const blockHash = await connection.getLatestBlockhash()
        transaction.feePayer = solanaAddress as PublicKey
        transaction.recentBlockhash = await blockHash.blockhash
        const signed = await signSolanaTransaction(transaction)

        await connection.sendRawTransaction(signed.serialize())

        let accountInfo
        let allowAmount = 0
        let retryCount = 0

        if (isCancel) {
          do {
            accountInfo = await connection.getParsedAccountInfo(
              fromTokenAccount.address
            )

            const parsedAccountInfo = accountInfo?.value
              ?.data as ParsedAccountData
            allowAmount =
              parsedAccountInfo.parsed?.info?.delegate === targetAddress
                ? parsedAccountInfo.parsed?.info?.delegatedAmount?.uiAmount
                : 0

            await sleep(1000)
          } while (allowAmount < +amountToShow || retryCount++ < 5)

          setAllowance(+amountToShow)
        } else {
          setAllowance(0)
        }
        isCancel ? setCancellingApprove(false) : setApproving(false)
      } catch (e) {
        errorHandler(e)
        isCancel ? setCancellingApprove(false) : setApproving(false)
      }
    },
    [
      decimals,
      tokenAddress,
      walletProvider,
      targetAddress,
      tronAddress,
      signSolanaTransaction,
      signTronTransaction,
      amountToShow,
      networkOption
    ]
  )

  return useMemo(
    () => ({
      isApproved,
      poolAddress,
      approve,
      allowance
    }),
    [isApproved, poolAddress, approve, allowance]
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ChainName } from '../../utils/constants'
import {
  selectDappOption,
  selectMode,
  selectNodeProviderQuery,
  selectSourceChain,
  selectTargetChain,
  selectTheme,
  selectUseFIAT,
  selectValidTransactionOptionTargetNetwork,
  selectWalletAutoConnect
} from '../../store/selectors'
import {
  setSourceChain,
  setServiceFee,
  setTargetChain,
  setTargetChainFetching
} from '../../store/optionSlice'
import useNetworkOptions from '../../hooks/useNetworkOptions'
import { DAppOptions, ModeOptions } from '../../interface'
import { fetchWrapper } from '../../helpers/fetch-wrapper'
import toast from 'react-hot-toast'

import { Loading180Ring } from '../../assets/loading'

const NetworkDropdown = React.memo(
  ({ isOriginChain = true }: { isOriginChain?: boolean }) => {
    const [collapsed, setCollapsed] = useState(true)
    const [availableNetworks, setAvailableNetworks] = useState<
      Array<ChainName>
    >([])
    const ref = useRef<any>()
    const sourceChangeRef = useRef<boolean>(false)
    const mode = useSelector(selectMode)
    const autoSwitchChain = useSelector(selectWalletAutoConnect)
    const useFIAT = useSelector(selectUseFIAT)
    const dAppOption = useSelector(selectDappOption)
    const originNetwork = useSelector(selectSourceChain)
    const targetNetwork = useSelector(selectTargetChain)
    const validTransactionOptionTargetNetwork = useSelector(selectValidTransactionOptionTargetNetwork)
    const nodeProviderQuery = useSelector(selectNodeProviderQuery)
    const { options: networkOptions } = useNetworkOptions()
    const selectedNetwork = useMemo(() => {
      const index = networkOptions.findIndex(
        (option) =>
          option.id === (isOriginChain ? originNetwork : targetNetwork)
      )
      if (index >= 0) return networkOptions[index]

      if (availableNetworks.length !== 0) {
        return networkOptions.find(
          (networkOption) => networkOption.id === availableNetworks[0]
        )
      }
      return null
    }, [originNetwork, targetNetwork, networkOptions, availableNetworks])

    const networks = useMemo(() => {
      if (isOriginChain && mode === ModeOptions.bridge) {
        return networkOptions
      }

      return networkOptions.filter(
        (network) =>
          availableNetworks.findIndex((id: any) => id === network.id) >= 0
      )
    }, [
      networkOptions,
      isOriginChain,
      availableNetworks,
      dAppOption,
      originNetwork
    ])
    const theme = useSelector(selectTheme)
    const dispatch = useDispatch()

    useEffect(() => {
      if (!nodeProviderQuery || mode != ModeOptions.onramp) return
      ;(async function () {
        try {
          let chains: ChainName[] = []
          const networks: any = await fetchWrapper.get(
            `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/get_available_chains/FIAT`
          )

          chains = networks.Chains
          if (useFIAT) chains.push(ChainName.FIAT)

          setAvailableNetworks(chains)

          if(validTransactionOptionTargetNetwork === "invalid") {
            console.log("targetChain from network dropdown ue")
            dispatch(setTargetChain(chains[0]))
          }

          if (sourceChangeRef.current) {
            sourceChangeRef.current = false
            dispatch(
              setTargetChain(
                chains.findIndex((chain) => chain === targetNetwork) < 0 ||
                  targetNetwork === originNetwork
                  ? chains[0]
                  : targetNetwork
              )
            )
            dispatch(setTargetChainFetching(false))
          }
        } catch (e) {
          console.log('rpc disconnected', e)
          toast.error('rpc disconnected')
        }
      })()
    }, [nodeProviderQuery, targetNetwork, mode, isOriginChain, useFIAT, validTransactionOptionTargetNetwork])

    useEffect(() => {
      if (!nodeProviderQuery || mode !== ModeOptions.bridge) return
      ;(async function () {
        try {
          let chains: ChainName[] = []
          if (originNetwork === ChainName.FIAT) {
            chains = [ChainName.ETHEREUM, ChainName.POLYGON]
          } else {
            const networks: any = await fetchWrapper.get(
              `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/get_available_chains/${originNetwork}`
            )

            chains = networks.Chains
            if (useFIAT) chains.push(ChainName.FIAT)
          }

          setAvailableNetworks(chains)

          if (isOriginChain && !targetNetwork) {
            dispatch(setTargetChain(chains[0]))
          }

          if (sourceChangeRef.current) {
            sourceChangeRef.current = false
            dispatch(
              setTargetChain(
                chains.findIndex((chain) => chain === targetNetwork) < 0 ||
                  targetNetwork === originNetwork
                  ? chains[0]
                  : targetNetwork
              )
            )
            dispatch(setTargetChainFetching(false))
          }
        } catch (e) {
          console.log('rpc disconnected', e)
          toast.error('rpc disconnected')
        }
      })()
    }, [
      nodeProviderQuery,
      originNetwork,
      targetNetwork,
      mode,
      isOriginChain,
      useFIAT
    ])

    useEffect(() => {
      if (!nodeProviderQuery || mode !== ModeOptions.payment) return
      ;(async function () {
        try {
          if (
            dAppOption === DAppOptions.LPAdd ||
            dAppOption === DAppOptions.LPDrain
          ) {
            setAvailableNetworks([targetNetwork as ChainName])
          } else {
            if (targetNetwork === ChainName.FIAT) {
              setAvailableNetworks([ChainName.ETHEREUM, ChainName.POLYGON])
              return
            }

            const networks: any = await fetchWrapper.get(
              `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/get_available_chains/${targetNetwork}`
            )

            setAvailableNetworks(networks.Chains)
          }
        } catch (e) {
          console.log('rpc disconnected', e)
          toast.error('rpc disconnected')
        }
      })()
    }, [nodeProviderQuery, mode, targetNetwork, dAppOption])

    useEffect(() => {
      const bodyMouseDowntHandler = (e: any) => {
        if (ref?.current && !ref.current.contains(e.target)) {
          setCollapsed(true)
        }
      }

      document.addEventListener('mousedown', bodyMouseDowntHandler)
      return () => {
        document.removeEventListener('mousedown', bodyMouseDowntHandler)
      }
    }, [setCollapsed])

    return (
      <div
        className={`network-dropdown ${theme.colorMode} ${
          collapsed ? 'collapsed' : ''
        }`}
        onClick={() => {
          if (!autoSwitchChain && isOriginChain && mode !== ModeOptions.onramp)
            return
          setCollapsed((prev) => !prev)
        }}
        ref={ref}
      >
        {availableNetworks.length != 0 && selectedNetwork ? (
          <div className='network-wrapper'>
            <selectedNetwork.icon />
            <span>{selectedNetwork.label}</span>
          </div>
        ) : (
          <div className='network-wrapper'>
            <Loading180Ring width={24} height={24} fill='white' />
          </div>
        )}
        <div
          className={`network-menu custom-scrollbar ${theme.colorMode} ${
            collapsed ? 'collapsed' : ''
          }`}
        >
          {networks.map((network) => (
            <div
              className='network-menu-item'
              key={network.label}
              onClick={async () => {
                if (isOriginChain) {
                  console.log('origin chain')
                  dispatch(setTargetChainFetching(true))
                  dispatch(setSourceChain(network.id))
                  sourceChangeRef.current = true
                } else {
                  dispatch(setTargetChain(network.id))
                  dispatch(setServiceFee(-1))
                }
              }}
            >
              {<network.icon />}
              <p>{network.label}</p>
            </div>
          ))}
          {/* {useFIAT ? (
            <div
              className='network-menu-item'
              onClick={() => {
                dispatch(setBankPopup(true))
              }}
            >
              <BankIcon />
              <p>pay with FIAT</p>
            </div>
          ) : null} */}
        </div>
      </div>
    )
  }
)

export default NetworkDropdown

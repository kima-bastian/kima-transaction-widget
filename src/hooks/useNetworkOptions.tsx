import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import {
  selectMode,
  selectNodeProviderQuery,
  selectUseFIAT
} from '../store/selectors'
import { ChainName, networkOptions } from '../utils/constants'
import { useDispatch } from 'react-redux'
import { TokenOptions, setTokenOptions } from '../store/optionSlice'
import toast from 'react-hot-toast'
import { ModeOptions } from '../interface'

export default function useNetworkOptions() {
  const dispatch = useDispatch()
  const useFIAT = useSelector(selectUseFIAT)
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)
  const mode = useSelector(selectMode)
  const [options, setOptions] = useState<Array<any>>(networkOptions)

  useEffect(() => {
    if (!nodeProviderQuery) return
    ;(async function () {
      try {
        const networks: any = await fetchWrapper.get(
          `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/chain`
        )

        if (mode === ModeOptions.onramp) {
          setOptions(
            networkOptions.filter((network) =>
              networks.Chain.some(
                (chain) =>
                  !chain.disabled &&
                  chain.modes.includes('onramp') &&
                  chain.symbol === network.id
              )
            )
          )
        } else {
          setOptions(
            networkOptions.filter(
              (network) =>
                networks.Chain.findIndex(
                  (chain: any) => chain.symbol === network.id && !chain.disabled
                ) >= 0 ||
                (network.id === ChainName.FIAT && useFIAT)
            )
          )
        }

        let tokenOptions: TokenOptions = {}

        for (const network of networks.Chain) {
          for (const token of network.tokens) {
            if (!tokenOptions[token.symbol]) {
              tokenOptions[token.symbol] = {}
            }
            tokenOptions[token.symbol][network.symbol] = token.address
          }
        }

        dispatch(setTokenOptions(tokenOptions))
      } catch (e) {
        console.log('rpc disconnected', e)
        toast.error('rpc disconnected')
      }
    })()
  }, [nodeProviderQuery, mode])

  return useMemo(
    () => ({
      options
    }),
    [options]
  )
}

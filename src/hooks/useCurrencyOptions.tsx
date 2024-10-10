import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchWrapper } from '../helpers/fetch-wrapper'
import {
  selectNodeProviderQuery,
  selectSourceChain,
  selectTargetChain
} from '../store/selectors'
import { ChainName } from '../utils/constants'
import { useDispatch } from 'react-redux'
import { setAvailableTokenList, setSelectedToken } from '../store/optionSlice'
import toast from 'react-hot-toast'

export default function useCurrencyOptions() {
  const dispatch = useDispatch()
  const [options, setOptions] = useState('USDK')
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)
  const originNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)

  useEffect(() => {
    if (!nodeProviderQuery || !originNetwork || !targetNetwork) return
    ;(async function () {
      try {
        // if (
        //   originNetwork === ChainName.FIAT ||
        //   targetNetwork === ChainName.FIAT
        // ) {
        //   setOptions('KEUR')
        //   return
        // }
        const coins: any = await fetchWrapper.get(
          `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/get_currencies/${originNetwork}/${targetNetwork}`
        )

        console.log("coins: ", coins);

        let tokenList = coins.Currencies.map((coin: string) =>
          coin.toUpperCase()
        ) || ['USDK']
        if (
          originNetwork === ChainName.BTC ||
          targetNetwork === ChainName.BTC
        ) {
          tokenList = ['WBTC']
        }

        setOptions(tokenList[0]);
        dispatch(setSelectedToken(tokenList[0]))
        dispatch(setAvailableTokenList(tokenList))
        setOptions(tokenList[0])
      } catch (e) {
        console.log('rpc disconnected', e)
        toast.error('rpc disconnected')
      }
    })()
  }, [nodeProviderQuery, originNetwork, targetNetwork])

  return useMemo(
    () => ({
      options
    }),
    [options]
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useNetworkOptions from '../../hooks/useNetworkOptions'
import { ArrowIcon } from '../../assets/icons'
import {
  selectDappOption,
  selectMode,
  selectNodeProviderQuery,
  selectSourceChain,
  selectTargetChain,
  selectTheme
} from '../../store/selectors'
import {
  setSourceChain,
  setServiceFee,
  setTargetChain
} from '../../store/optionSlice'
import { ChainName } from '../../utils/constants'
import { ModeOptions } from '../../interface'
import { fetchWrapper } from '../../helpers/fetch-wrapper'
import toast from 'react-hot-toast'

interface Props {
  isOriginChain?: boolean
}

const Network = ({ isOriginChain = true }: Props) => {
  const sourceChangeRef = useRef<boolean>(false)
  const theme = useSelector(selectTheme)
  const mode = useSelector(selectMode)
  const dAppOption = useSelector(selectDappOption)
  const originNetwork = useSelector(selectSourceChain)
  const targetNetwork = useSelector(selectTargetChain)
  const nodeProviderQuery = useSelector(selectNodeProviderQuery)
  const dispatch = useDispatch()
  const sliderRef = useRef<any>()
  const [availableNetworks, setAvailableNetworks] = useState<Array<ChainName>>(
    []
  )
  const { options: networkOptions } = useNetworkOptions()
  const selectedNetwork = useMemo(() => {
    const index = networkOptions.findIndex(
      (option) => option.id === (isOriginChain ? originNetwork : targetNetwork)
    )
    if (index >= 0) return networkOptions[index]
    return networkOptions[3]
  }, [originNetwork, targetNetwork, networkOptions])
  const networks = useMemo(() => {
    if (isOriginChain && mode === ModeOptions.bridge) {
      return networkOptions
    }

    return networkOptions.filter(
      (network) =>
        availableNetworks.findIndex((id: any) => id === network.id) >= 0
    )
  }, [networkOptions, isOriginChain, availableNetworks, dAppOption])

  useEffect(() => {
    if (!nodeProviderQuery || (mode !== ModeOptions.bridge && mode !== ModeOptions.onramp)) return
    ;(async function () {
      try {
        const networks: any = await fetchWrapper.get(
          `${nodeProviderQuery}/kima-finance/kima-blockchain/chains/get_available_chains/${originNetwork}`
        )

        setAvailableNetworks(networks.Chains)
        if (isOriginChain && !targetNetwork) {
          dispatch(setTargetChain(networks.Chains[0]))
        }
        if (sourceChangeRef.current) {
          sourceChangeRef.current = false
          dispatch(setTargetChain(networks.Chains[0]))
        }
      } catch (e) {
        console.log('rpc disconnected', e)
        toast.error('rpc disconnected')
      }
    })()
  }, [nodeProviderQuery, originNetwork, targetNetwork, mode, isOriginChain])

  useEffect(() => {
    let isDown = false
    let startX: number
    let scrollLeft: number

    sliderRef.current?.addEventListener('mousedown', (e: any) => {
      isDown = true
      sliderRef.current?.classList.add('active')
      startX = e.pageX - sliderRef.current?.offsetLeft
      scrollLeft = sliderRef.current?.scrollLeft
    })
    sliderRef.current?.addEventListener('mouseleave', () => {
      isDown = false
      sliderRef.current.classList.remove('active')
    })
    sliderRef.current?.addEventListener('mouseup', () => {
      isDown = false
      sliderRef.current.classList.remove('active')
    })
    sliderRef.current?.addEventListener('mousemove', (e: any) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - sliderRef.current.offsetLeft
      const walk = (x - startX) * 1 //scroll-fast
      sliderRef.current.scrollLeft = scrollLeft - walk
    })
  })

  const slideLeft = () => {
    let temp = 0
    const timerId = setInterval(() => {
      sliderRef.current.scrollLeft -= 10
      if (temp++ === 20) clearInterval(timerId)
    }, 10)
  }

  const slideRight = () => {
    let temp = 0
    const timerId = setInterval(() => {
      sliderRef.current.scrollLeft += 10
      if (temp++ === 20) clearInterval(timerId)
    }, 10)
  }

  return (
    <div className={`network-select`}>
      <p>
        {isOriginChain
          ? 'Which network are you funding from?'
          : 'Which network are you funding to?'}
      </p>
      <div className='scroll-button'>
        <ArrowIcon
          fill={theme.colorMode === 'light' ? 'black' : 'white'}
          onClick={slideLeft}
        />
        <ArrowIcon
          fill={theme.colorMode === 'light' ? 'black' : 'white'}
          onClick={slideRight}
        />
      </div>
      <div className='slide-area hide-scrollbar' ref={sliderRef}>
        <div className='network-container'>
          {networks.map((network) => (
            <div
              className={`card-item ${theme.colorMode} ${
                network.id === selectedNetwork.id ? 'active' : ''
              }`}
              key={network.id}
              onClick={() => {
                if (isOriginChain) {
                  dispatch(setSourceChain(network.id))
                  sourceChangeRef.current = true
                } else {
                  dispatch(setTargetChain(network.id))
                  dispatch(setServiceFee(-1))
                }
              }}
            >
              <network.icon />
              <span>{network.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Network

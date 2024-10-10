import {
  KimaTransactionWidget,
  KimaProvider,
  FontSizeOptions,
  ModeOptions,
  ColorModeOptions,
  NetworkOptions,
  SupportNetworks,
  // DAppOptions
} from '@kimafinance/kima-transaction-widget'
import '@kimafinance/kima-transaction-widget/dist/index.css'

const App = () => {
  return (
    <KimaProvider
      walletConnectProjectId='e579511a495b5c312b572b036e60555a'
      networkOption={NetworkOptions.testnet}
    >
      <div
        style={{
          margin: '0 5vw'
        }}
      >
        <div className='container'>
          <KimaTransactionWidget
            theme={{
              colorMode: ColorModeOptions.light,
              fontSize: FontSizeOptions.medium
            }}
            mode={ModeOptions.onramp}
            networkOption={NetworkOptions.testnet}
            // dAppOption={DAppOptions.LPAdd}
            kimaBackendUrl='https://kima-transaction-backend-onramp-221056059036.us-central1.run.app'
            kimaNodeProviderQuery='https://kima-blockchain-simulator-onramp-221056059036.us-central1.run.app'
            kimaExplorer='https://explorer-testnet.kima.finance'
            feeURL='https://fee.kima.finance'
            // autoSwitchChain={false}
            defaultToken={'USDC'}
            // useFIAT={true}
            // titleOption={{
            //   initialTitle: 'New Purchase'
            // }}
            // paymentTitleOption={{
            //   title:
            //     'You can now purchase our NFT on Polygon, using funds from other chains.',
            //   style: {
            //     fontSize: '1.2em',
            //     fontWeight: '500'
            //   }
            // }}
            transactionOption={{
              targetChain: SupportNetworks.PEAQ,
              targetAddress: '0x152CFF35d84E6a6b95A5EDb4cee50961670D377D',
              amount: 5
            }}
            // txId={-1}
            redirectURL='https://invest.penomo.com/dashboard'
            errorHandler={(e: any) => {
              console.log('error:', e)
            }}
            successHandler={() => {
              console.log('success')
            }}
            closeHandler={() => {
              console.log('closed')
            }}
          />
        </div>
      </div>
    </KimaProvider>
  )
}

export default App

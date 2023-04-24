import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import {
  KimaProvider,
  FontSizeOptions,
  ColorModeOptions,
  KimaTransactionWidget,
  ModeOptions,
  DAppOptions,
  SupportNetworks
} from '..'
import { renderWithProviders } from '../utils/utils-for-tests'

describe('TransferWidget test', function () {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })
  })

  it('render component', async function () {
    const { container } = await act(async () =>
      renderWithProviders(
        <KimaProvider>
          <KimaTransactionWidget
            theme={{
              colorMode: ColorModeOptions.light,
              fontSize: FontSizeOptions.medium
            }}
            mode={ModeOptions.payment}
            titleOption={{
              initialTitle: 'New Purchase'
            }}
            dAppOption={DAppOptions.LightDemo}
            lightModeOption={{
              kimaAccounts: [
                '0x1150bd27bA25fa13806C98324F201dfe815A4502',
                '0x97810930b49D820205Be8eFe370201D32d9255B5'
              ],
              chains: [
                SupportNetworks.ETHEREUM,
                SupportNetworks.AVALANCHE,
                SupportNetworks.POLYGON
              ]
            }}
            useFIAT={true}
            paymentTitleOption={{
              title:
                'You can now purchase our NFT on Polygon, using funds from other chains.',
              style: {
                fontSize: '1.2em',
                fontWeight: '500'
              }
            }}
            transactionOption={{
              targetChain: SupportNetworks.AVALANCHE,
              targetAddress: '0x67cc400c434F691Ed45e452dC8F2Baf0101a9B63',
              amount: 5
            }}
            kimaBackendUrl='https://backend_demo_staging.kima.finance'
            kimaNodeProviderQuery='https://api_staging_testnet.kima.finance'
          />
        </KimaProvider>
      )
    )

    expect(container).toMatchSnapshot()

    expect(screen.getByText('Next')).toBeInTheDocument()
    const submitButton = container.querySelector(
      '.kima-card-footer button:last-of-type'
    )
    fireEvent.click(submitButton as Element)

    await waitFor(() => fireEvent.click(submitButton as Element), {
      timeout: 5000
    })
  }, 5000)
})

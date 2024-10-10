import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAccounts,
  selectSelectedAccount,
  selectTheme
} from '../../store/selectors'
import {
  setSelectedAccount,
  setSelectedBankAccount
} from '../../store/optionSlice'
import { Loading180Ring } from '../../assets/loading'

const AccountDropdown = () => {
  const ref = useRef<any>()
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = useState(true)
  const accounts = useSelector(selectAccounts)
  const selectedAccount = useSelector(selectSelectedAccount)
  const theme = useSelector(selectTheme)

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

  const handleSelectAccount = ({ target }) => {
    console.log(target.id)

    const account: any = accounts.find(
      (account: any) => account.accountId === target.id
    )
    dispatch(setSelectedAccount(account))
    dispatch(setSelectedBankAccount(account?.bankAccounts[0]))
  }

  return (
    <div
      className={`coin-dropdown ${theme.colorMode} ${
        collapsed ? 'collapsed' : ''
      }`}
      onClick={() => setCollapsed((prev) => !prev)}
      ref={ref}
    >
      <div className='coin-wrapper'>
        {selectedAccount ? (
          selectedAccount.name
        ) : (
          <Loading180Ring width={24} height={24} fill='white' />
        )}
      </div>
      <div
        className={`coin-menu ${theme.colorMode} ${collapsed ? 'collapsed' : ''}`}
      >
        {accounts.map((account: any) => {
          if (account?.accountId !== selectedAccount?.accountId)
            return (
              <div className='coin-item' key={account?.accountId}>
                <p id={account?.accountId} onClick={handleSelectAccount}>
                  {account?.name}
                </p>
              </div>
            )
        })}
      </div>
    </div>
  )
}

export default AccountDropdown

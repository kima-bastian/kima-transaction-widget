import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSelectedAccount, selectSelectedBankAccount, selectTheme } from '../../store/selectors'
import { setSelectedBankAccount } from '../../store/optionSlice'
import { Loading180Ring } from '../../assets/loading'



const BankAccountDropdown = () => {
  const ref = useRef<any>()
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(true)
  const selectedAccount = useSelector(selectSelectedAccount)
  const selectedBankAccount = useSelector(selectSelectedBankAccount)
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

  const handleSelectBankAccount = ({target}) => {
    console.log(target.id);

    const bankAccount:any = selectedAccount.bankAccounts.find((availableBankAccount:any) => availableBankAccount.id === target.id);
    dispatch(setSelectedBankAccount(bankAccount));
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
        {selectedBankAccount ? 
          selectedBankAccount.name:
          <Loading180Ring width={24} height={24} fill='white' />
      }
      </div>
      <div
        className={`coin-menu ${theme.colorMode} ${collapsed ? 'collapsed' : ''}`}
      >
        {selectedAccount?.bankAccounts.map((bankAccount:any) => {
          if (bankAccount?.accountId !== selectedAccount?.accountId)
          return (
            <div className='coin-item' key={bankAccount?.accountId}>
              <p id={bankAccount?.accountId} onClick={handleSelectBankAccount}>{bankAccount?.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BankAccountDropdown

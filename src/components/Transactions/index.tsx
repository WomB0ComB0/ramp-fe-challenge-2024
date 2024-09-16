import { useCallback, useEffect } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions, updateTransaction }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  useEffect(() => {
    console.log('Transactions component received transactions:', transactions)
  }, [transactions])

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      updateTransaction(transactionId, newValue)
    },
    [fetchWithoutCache, updateTransaction]
  )

  if (transactions === null || transactions.length === 0) {
    console.log('No transactions found')
    return <div className="RampLoading--container">No transactions found</div>
  }

  console.log('Rendering transactions:', transactions)
  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}

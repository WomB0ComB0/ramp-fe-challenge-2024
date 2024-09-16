import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = {
  transactions: Transaction[] | null
  updateTransaction: (transactionId: string, newApprovalStatus: boolean) => void
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>

export type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  setTransactionApproval: SetTransactionApprovalFunction
}


export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>

import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee() {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )
      console.log('Data fetched in useTransactionsByEmployee:', data)
      setTransactionsByEmployee(data)
      return data
    },
    [fetchWithCache]
  )

  const updateTransaction = useCallback((transactionId: string, newApprovalStatus: boolean) => {
    setTransactionsByEmployee((prevTransactions) => {
      if (!prevTransactions) return prevTransactions
      return prevTransactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, approved: newApprovalStatus }
          : transaction
      )
    })
  }, [])

  return {
    data: transactionsByEmployee,
    loading,
    fetchById,
    updateTransaction,
  }
}

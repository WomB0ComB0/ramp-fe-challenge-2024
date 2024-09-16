import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"
import { UsePaginatedTransactionsResult } from "./types"

export function usePaginatedTransactions(): UsePaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null)

  const fetchAll = useCallback(async () => {
    console.log('Fetching all transactions')
    // Only fetch if paginatedTransactions is null
    if (paginatedTransactions === null) {
      try {
        const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
          "paginatedTransactions",
          { page: 0 }
        )
        console.log('Response from fetchAll:', response)
        setPaginatedTransactions(response)
        return response;
      } catch (error) {
        console.error('Error in fetchAll:', error)
        return null;
      }
    } else {
      console.log('Transactions already loaded, returning existing data')
      return paginatedTransactions;
    }
  }, [fetchWithCache, paginatedTransactions])

  const loadMore = useCallback(async () => {
    if (!paginatedTransactions || paginatedTransactions.nextPage === null) {
      console.log('No more transactions to load');
      return null;
    }
    
    console.log('Loading more transactions, page:', paginatedTransactions.nextPage);
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions.nextPage,
      }
    )

    if (response === null) {
      console.error('Failed to load more transactions');
      return null;
    }

    const newPaginatedTransactions = {
      data: [...paginatedTransactions.data, ...response.data],
      nextPage: response.nextPage,
    };

    console.log('New paginated transactions:', newPaginatedTransactions);
    setPaginatedTransactions(newPaginatedTransactions);
    return newPaginatedTransactions;
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  const updateTransaction = useCallback((transactionId: string, newApprovalStatus: boolean) => {
    setPaginatedTransactions((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        data: prev.data.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, approved: newApprovalStatus }
            : transaction
        ),
      }
    })
  }, [])

  return {
    data: paginatedTransactions,
    loading,
    fetchAll,
    loadMore: async () => {
      const result = await loadMore();
      if (result) {
        setPaginatedTransactions(result);
      }
    },
    invalidateData,
    updateTransaction,
  }
}

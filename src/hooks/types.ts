import { Employee, PaginatedResponse, Transaction } from "../utils/types"

type UseTypeBaseResult<TValue> = {
  data: TValue
  loading: boolean
  invalidateData: () => void
}

type UseTypeBaseAllResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchAll: () => Promise<void>
}

type UseTypeBaseByIdResult<TValue> = UseTypeBaseResult<TValue> & {
  fetchById: (id: string) => Promise<void>
}

type UseTypeBaseUpdateResult<TValue> = UseTypeBaseResult<TValue> & {
  updateTransaction: (id: string, newApprovalStatus: boolean) => void
}

export type EmployeeResult = UseTypeBaseAllResult<Employee[] | null>

export type PaginatedTransactionsResult = UseTypeBaseAllResult<PaginatedResponse<Transaction[]> | null> & UseTypeBaseUpdateResult<PaginatedResponse<Transaction[]> | null>

export type TransactionsByEmployeeResult = UseTypeBaseByIdResult<Transaction[] | null> & UseTypeBaseUpdateResult<Transaction[] | null>

export type UseCustomFetchResult<TData> = {
  data: TData | null
  loading: boolean
  fetchWithCache: <TResult, TParams extends object>(
    endpoint: string,
    params: TParams
  ) => Promise<TResult | null>
  fetchWithoutCache: <TResult, TParams extends object>(
    endpoint: string,
    params: TParams
  ) => Promise<TResult | null>
  clearCache: () => void
}

export type UsePaginatedTransactionsResult = {
  data: PaginatedResponse<Transaction[]> | null
  loading: boolean
  fetchAll: () => Promise<PaginatedResponse<Transaction[]> | null>
  loadMore: () => Promise<void>
  invalidateData: () => void
  updateTransaction: (transactionId: string, newApprovalStatus: boolean) => void
}

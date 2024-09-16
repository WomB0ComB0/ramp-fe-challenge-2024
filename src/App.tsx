import { Fragment, useCallback, useEffect, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[] | null>(null)
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
  const [allTransactions, setAllTransactions] = useState<Transaction[] | null>(null)

  useEffect(() => {
    if (currentEmployeeId === null) {
      setCurrentTransactions(allTransactions)
    } else {
      setCurrentTransactions(transactionsByEmployee)
    }
  }, [currentEmployeeId, allTransactions, transactionsByEmployee])

  const loadAllTransactions = useCallback(async () => {
    console.log('Starting loadAllTransactions')
    setIsLoading(true)
    setCurrentEmployeeId(null)

    try {
      console.log('Fetching employees')
      await employeeUtils.fetchAll()
      console.log('Employees fetched, now fetching transactions')
      const response = await paginatedTransactionsUtils.fetchAll();
      console.log('Raw response from loadAllTransactions:', response)
      
      if (response !== null && response !== undefined) {
        console.log('Setting transactions from response:', response.data)
        setAllTransactions(response.data)
        setCurrentTransactions(response.data)
      } else {
        console.error('Failed to fetch transactions: response is null or undefined')
        setAllTransactions([])
        setCurrentTransactions([])
      }
    } catch (error) {
      console.error('Error in loadAllTransactions:', error)
      setAllTransactions([])
      setCurrentTransactions([])
    } finally {
      setIsLoading(false)
      console.log('Finished loadAllTransactions')
    }
  }, [employeeUtils, paginatedTransactionsUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      console.log('Starting loadTransactionsByEmployee for employee:', employeeId)
      setIsLoading(true)
      setCurrentEmployeeId(employeeId)

      try {
        const response = await transactionsByEmployeeUtils.fetchById(employeeId)
        console.log('Raw response from loadTransactionsByEmployee:', response)
        
        if (response !== null && response !== undefined) {
          console.log('Setting transactions from response:', response)
          setCurrentTransactions(response)
        } else {
          console.error('Response is null or undefined in loadTransactionsByEmployee')
          setCurrentTransactions([])
        }
      } catch (error) {
        console.error('Error in loadTransactionsByEmployee:', error)
        setCurrentTransactions([])
      } finally {
        setIsLoading(false)
        console.log('Finished loadTransactionsByEmployee')
      }
    },
    [transactionsByEmployeeUtils]
  )

  const updateTransaction = useCallback(async (transactionId: string, newApprovalStatus: boolean) => {
    setIsLoading(true)

    const updateTransactions = (transactions: Transaction[] | null) =>
      transactions?.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, approved: newApprovalStatus }
          : transaction
      ) ?? null

    setCurrentTransactions((prev) => updateTransactions(prev))
    setAllTransactions((prev) => updateTransactions(prev))

    await paginatedTransactionsUtils.updateTransaction(transactionId, newApprovalStatus)
    if (currentEmployeeId) {
      await transactionsByEmployeeUtils.updateTransaction(transactionId, newApprovalStatus)
    }

    setIsLoading(false)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils, currentEmployeeId])

  useEffect(() => {
    console.log('Initial load effect triggered')
    console.log('Employees:', employees)
    console.log('Employee utils loading:', employeeUtils.loading)
    if (employees === null && !employeeUtils.loading) {
      console.log('Calling loadAllTransactions from initial load effect')
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  const handleViewMore = useCallback(async () => {
    console.log('Handling View More');
    setIsLoading(true);
    const newTransactions = await paginatedTransactionsUtils.loadMore() as any;
    console.log('New transactions loaded:', newTransactions);
    
    if (newTransactions && newTransactions.data) {
      setAllTransactions(newTransactions.data);
      setCurrentTransactions(newTransactions.data);
    }
    setIsLoading(false);
  }, [paginatedTransactionsUtils]);

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading || employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
            transactions={currentTransactions ?? []}
            updateTransaction={updateTransaction}
          />

          {currentEmployeeId === null && paginatedTransactions?.nextPage !== null && (
            <button
              className="RampButton"
              disabled={isLoading}
              onClick={handleViewMore}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}

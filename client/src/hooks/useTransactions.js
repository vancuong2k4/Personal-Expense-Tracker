import { useState, useCallback } from 'react'
import * as txApi from '../api/transactionApi'

const DEFAULT_FILTERS = { page: 1, limit: 15 }

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination]     = useState(null)
  const [filters, setFilters]           = useState(DEFAULT_FILTERS)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const fetchTransactions = useCallback(async (overrideFilters) => {
    setLoading(true)
    setError(null)
    try {
      const params = overrideFilters ?? filters
      // Strip undefined/empty values before sending
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
      )
      const res = await txApi.getTransactions(cleanParams)
      setTransactions(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải giao dịch')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const applyFilters = (newFilters) => {
    const updated = { ...DEFAULT_FILTERS, ...newFilters }
    setFilters(updated)
    fetchTransactions(updated)
  }

  const changePage = (page) => applyFilters({ ...filters, page })

  const addTransaction = async (data) => {
    const res = await txApi.createTransaction(data)
    fetchTransactions()          // Refresh list
    return res.data
  }

  const editTransaction = async (id, data) => {
    const res = await txApi.updateTransaction(id, data)
    fetchTransactions()
    return res.data
  }

  const removeTransaction = async (id) => {
    await txApi.deleteTransaction(id)
    fetchTransactions()
  }

  return {
    transactions, pagination, filters,
    loading, error,
    fetchTransactions, applyFilters, changePage,
    addTransaction, editTransaction, removeTransaction,
  }
}

// TODO: Bước 4 — implement fetch transactions with filters
import { useState, useEffect } from 'react'
import { getTransactions } from '../api/transactionApi'

export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTransactions(filters)
      .then(res => setTransactions(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  return { transactions, loading, error, setTransactions }
}

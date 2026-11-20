import { useState, useEffect, useCallback } from 'react'
import * as recurringApi from '../api/recurringApi'

export const useRecurring = () => {
  const [recurringList, setRecurringList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRecurring = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await recurringApi.getRecurring()
      setRecurringList(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách định kỳ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecurring()
  }, [fetchRecurring])

  const addRecurring = async (data) => {
    const res = await recurringApi.createRecurring(data)
    await fetchRecurring()
    return res.data
  }

  const toggleActive = async (id) => {
    await recurringApi.toggleRecurring(id)
    setRecurringList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    )
  }

  const recordTransaction = async (id) => {
    const res = await recurringApi.executeRecurring(id)
    await fetchRecurring()
    return res.data
  }

  const removeRecurring = async (id) => {
    await recurringApi.deleteRecurring(id)
    setRecurringList((prev) => prev.filter((r) => r.id !== id))
  }

  const dueItems = recurringList.filter((r) => r.is_due)

  return {
    recurringList,
    dueItems,
    dueCount: dueItems.length,
    loading,
    error,
    fetchRecurring,
    addRecurring,
    toggleActive,
    recordTransaction,
    removeRecurring,
  }
}

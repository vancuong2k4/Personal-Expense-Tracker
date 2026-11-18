import { useState, useCallback } from 'react'
import * as budgetApi from '../api/budgetApi'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

export const useBudgets = (initialMonth = CURRENT_MONTH) => {
  const [month, setMonthState] = useState(initialMonth)
  const [budgets, setBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBudgets = useCallback(async (targetMonth) => {
    const m = targetMonth || month
    setLoading(true)
    setError(null)
    try {
      const res = await budgetApi.getBudgets(m)
      setBudgets(res.data.budgets || [])
      setSummary(res.data.summary || null)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu ngân sách')
    } finally {
      setLoading(false)
    }
  }, [month])

  const changeMonth = (newMonth) => {
    setMonthState(newMonth)
    fetchBudgets(newMonth)
  }

  const saveBudget = async (data) => {
    const res = await budgetApi.setBudget({ ...data, month })
    await fetchBudgets(month)
    return res.data
  }

  const removeBudget = async (id) => {
    await budgetApi.deleteBudget(id)
    await fetchBudgets(month)
  }

  return {
    budgets,
    summary,
    month,
    loading,
    error,
    fetchBudgets,
    changeMonth,
    saveBudget,
    removeBudget,
  }
}

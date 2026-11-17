import { useState, useCallback } from 'react'
import * as statsApi from '../api/statsApi'

export const useStats = () => {
  const [overview,         setOverview]         = useState(null)
  const [monthlySummary,   setMonthlySummary]   = useState([])
  const [categorySummary,  setCategorySummary]  = useState([])
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState(null)

  const fetchAll = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, monthlyRes, categoryRes] = await Promise.all([
        statsApi.getOverview(),
        statsApi.getMonthlySummary(params.months || 6),
        statsApi.getCategorySummary({ type: params.type || 'expense', month: params.month }),
      ])
      setOverview(overviewRes.data)
      setMonthlySummary(monthlyRes.data)
      setCategorySummary(categoryRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu thống kê')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategoryByType = useCallback(async (type, month) => {
    try {
      const res = await statsApi.getCategorySummary({ type, month })
      setCategorySummary(res.data)
    } catch {}
  }, [])

  return {
    overview, monthlySummary, categorySummary,
    loading, error,
    fetchAll, fetchCategoryByType,
  }
}

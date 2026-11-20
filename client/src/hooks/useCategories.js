import { useState, useEffect, useCallback } from 'react'
import * as categoryApi from '../api/categoryApi'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoryApi.getCategories()
      setCategories(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh mục')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = async (data) => {
    const res = await categoryApi.createCategory(data)
    setCategories((prev) => [...prev, res.data])
    return res.data
  }

  const editCategory = async (id, data) => {
    const res = await categoryApi.updateCategory(id, data)
    setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    return res.data
  }

  const removeCategory = async (id) => {
    await categoryApi.deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const byType = (type) => categories.filter((c) => c.type === type)

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    byType,
  }
}

import { useState, useEffect } from 'react'
import { getCategories } from '../api/categoryApi'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .finally(() => setLoading(false))
  }, [])

  const byType = (type) => categories.filter(c => c.type === type)

  return { categories, loading, byType }
}

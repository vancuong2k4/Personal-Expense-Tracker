import { useState, useCallback } from 'react'
import * as walletApi from '../api/walletApi'

export const useWallets = () => {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // useCallback: đảm bảo hàm không bị tạo lại mỗi render
  const fetchWallets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await walletApi.getWallets()
      setWallets(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách ví')
    } finally {
      setLoading(false)
    }
  }, [])

  const addWallet = async (data) => {
    const res = await walletApi.createWallet(data)
    setWallets(prev => [...prev, res.data])
    return res.data
  }

  const editWallet = async (id, data) => {
    const res = await walletApi.updateWallet(id, data)
    setWallets(prev => prev.map(w => w.id === id ? res.data : w))
    return res.data
  }

  const removeWallet = async (id) => {
    await walletApi.deleteWallet(id)
    setWallets(prev => prev.filter(w => w.id !== id))
  }

  return { wallets, loading, error, fetchWallets, addWallet, editWallet, removeWallet }
}

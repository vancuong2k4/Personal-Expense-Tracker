// TODO: Bước 2 — implement fetch wallets, create, update, delete
import { useState, useEffect } from 'react'
import { getWallets } from '../api/walletApi'

export const useWallets = () => {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getWallets()
      .then(res => setWallets(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { wallets, loading, error, setWallets }
}

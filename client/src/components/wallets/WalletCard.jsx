// TODO: Bước 3 — Hiển thị thông tin một ví
export default function WalletCard({ wallet }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{wallet?.name}</h3>
      <p className="text-gray-500">{wallet?.type}</p>
    </div>
  )
}

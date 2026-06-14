import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { settlementsApi } from '../api/client'
import Card from '../components/Card'

function formatMoney(amount) {
  return `$${parseFloat(amount).toFixed(2)}`
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settlementsApi.dashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">You are owed</p>
          <p className="text-2xl font-bold text-green-600">{formatMoney(data.total_owed_to_you)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">You owe</p>
          <p className="text-2xl font-bold text-red-600">{formatMoney(data.total_you_owe)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Net balance</p>
          <p className={`text-2xl font-bold ${parseFloat(data.net_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatMoney(data.net_balance)}
          </p>
        </Card>
      </div>

      <Card title="Your Groups">
        {data.groups.length === 0 ? (
          <p className="text-gray-500">
            No groups yet.{' '}
            <Link to="/groups" className="text-primary-600 hover:underline">Create one</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {data.groups.map((g) => (
              <Link
                key={g.group_id}
                to={`/groups/${g.group_id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{g.group_name}</p>
                  {g.suggested_settlements.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {g.suggested_settlements.length} pending settlement(s)
                    </p>
                  )}
                </div>
                <span className={`text-sm font-semibold ${parseFloat(g.your_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(g.your_balance) >= 0 ? '+' : ''}{formatMoney(g.your_balance)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

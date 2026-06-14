import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authApi, expensesApi, groupsApi, settlementsApi } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'

function formatMoney(amount) {
  return `$${parseFloat(amount).toFixed(2)}`
}

export default function GroupDetail() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState(null)
  const [settlements, setSettlements] = useState([])
  const [tab, setTab] = useState('expenses')
  const [loading, setLoading] = useState(true)

  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', paid_by_id: '' })
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [settlementForm, setSettlementForm] = useState({ from_user_id: '', to_user_id: '', amount: '', note: '' })

  const loadData = useCallback(() => {
    Promise.all([
      groupsApi.get(id),
      expensesApi.list(id),
      settlementsApi.balances(id),
      settlementsApi.list(id),
    ]).then(([groupRes, expRes, balRes, setRes]) => {
      setGroup(groupRes.data)
      setExpenses(expRes.data)
      setBalances(balRes.data)
      setSettlements(setRes.data)
      if (!expenseForm.paid_by_id && groupRes.data.members.length) {
        setExpenseForm((f) => ({ ...f, paid_by_id: String(groupRes.data.members[0].id) }))
      }
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (memberSearch.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(() => {
      authApi.searchUsers(memberSearch).then((res) => setSearchResults(res.data))
    }, 300)
    return () => clearTimeout(timer)
  }, [memberSearch])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    await expensesApi.create(id, {
      description: expenseForm.description,
      amount: expenseForm.amount,
      paid_by_id: parseInt(expenseForm.paid_by_id, 10),
    })
    setExpenseForm({ description: '', amount: '', paid_by_id: expenseForm.paid_by_id })
    loadData()
  }

  const handleAddMember = async (userId) => {
    await groupsApi.addMember(id, userId)
    setMemberSearch('')
    setSearchResults([])
    loadData()
  }

  const handleSettlement = async (e) => {
    e.preventDefault()
    await settlementsApi.create(id, {
      from_user_id: parseInt(settlementForm.from_user_id, 10),
      to_user_id: parseInt(settlementForm.to_user_id, 10),
      amount: settlementForm.amount,
      note: settlementForm.note,
    })
    setSettlementForm({ from_user_id: '', to_user_id: '', amount: '', note: '' })
    loadData()
  }

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!group) return <p className="text-gray-500">Group not found</p>

  const memberIds = new Set(group.members.map((m) => m.id))

  return (
    <div className="space-y-6">
      <div>
        <Link to="/groups" className="text-sm text-primary-600 hover:underline">&larr; Back to groups</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{group.name}</h1>
        {group.description && <p className="text-gray-500">{group.description}</p>}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {['expenses', 'balances', 'settlements', 'members'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <div className="space-y-4">
          <Card title="Add Expense">
            <form onSubmit={handleAddExpense} className="grid gap-4 sm:grid-cols-2">
              <Input label="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
              <Input label="Amount" type="number" step="0.01" min="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Paid by</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={expenseForm.paid_by_id}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paid_by_id: e.target.value })}
                >
                  {group.members.map((m) => (
                    <option key={m.id} value={m.id}>{m.username}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit">Add Expense (equal split)</Button>
              </div>
            </form>
          </Card>

          <Card title="Expenses">
            {expenses.length === 0 ? (
              <p className="text-gray-500">No expenses yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{exp.description}</p>
                      <p className="text-sm text-gray-500">
                        Paid by {exp.paid_by.username} &middot; split {exp.splits.length} ways
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatMoney(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'balances' && balances && (
        <div className="space-y-4">
          <Card title="Member Balances">
            {balances.balances.length === 0 ? (
              <p className="text-gray-500">All settled up!</p>
            ) : (
              <div className="space-y-2">
                {balances.balances.map((b) => (
                  <div key={b.user.id} className="flex justify-between py-2">
                    <span>{b.user.username}</span>
                    <span className={parseFloat(b.balance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {parseFloat(b.balance) >= 0 ? 'gets back ' : 'owes '}{formatMoney(Math.abs(b.balance))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {balances.suggested_settlements.length > 0 && (
            <Card title="Suggested Settlements">
              <div className="space-y-2">
                {balances.suggested_settlements.map((s, i) => (
                  <p key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{s.from_user.username}</span> owes{' '}
                    <span className="font-medium">{s.to_user.username}</span>{' '}
                    <span className="font-semibold text-primary-600">{formatMoney(s.amount)}</span>
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'settlements' && (
        <div className="space-y-4">
          <Card title="Record Settlement">
            <form onSubmit={handleSettlement} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">From</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={settlementForm.from_user_id} onChange={(e) => setSettlementForm({ ...settlementForm, from_user_id: e.target.value })} required>
                  <option value="">Select...</option>
                  {group.members.map((m) => <option key={m.id} value={m.id}>{m.username}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">To</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={settlementForm.to_user_id} onChange={(e) => setSettlementForm({ ...settlementForm, to_user_id: e.target.value })} required>
                  <option value="">Select...</option>
                  {group.members.map((m) => <option key={m.id} value={m.id}>{m.username}</option>)}
                </select>
              </div>
              <Input label="Amount" type="number" step="0.01" min="0.01" value={settlementForm.amount} onChange={(e) => setSettlementForm({ ...settlementForm, amount: e.target.value })} required />
              <Input label="Note" value={settlementForm.note} onChange={(e) => setSettlementForm({ ...settlementForm, note: e.target.value })} />
              <div className="sm:col-span-2">
                <Button type="submit">Record Settlement</Button>
              </div>
            </form>
          </Card>

          <Card title="Settlement History">
            {settlements.length === 0 ? (
              <p className="text-gray-500">No settlements recorded.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {settlements.map((s) => (
                  <div key={s.id} className="py-3 text-sm">
                    <span className="font-medium">{s.from_user.username}</span> paid{' '}
                    <span className="font-semibold text-primary-600">{formatMoney(s.amount)}</span> to{' '}
                    <span className="font-medium">{s.to_user.username}</span>
                    {s.note && <span className="text-gray-400"> &mdash; {s.note}</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'members' && (
        <div className="space-y-4">
          <Card title="Members">
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <span key={m.id} className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                  {m.username}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Add Member">
            <div className="space-y-3">
              <Input
                label="Search by username"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Type at least 2 characters..."
              />
              {searchResults.filter((u) => !memberIds.has(u.id)).map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <span className="text-sm font-medium">{u.username}</span>
                  <Button variant="secondary" onClick={() => handleAddMember(u.id)}>Add</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { groupsApi } from '../api/client'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const loadGroups = () => {
    groupsApi.list()
      .then((res) => setGroups(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadGroups() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await groupsApi.create(form)
      setForm({ name: '', description: '' })
      setShowForm(false)
      loadGroups()
    } catch (err) {
      setError('Failed to create group')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Group'}
        </Button>
      </div>

      {showForm && (
        <Card title="Create Group">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : groups.length === 0 ? (
        <Card>
          <p className="text-gray-500">No groups yet. Create your first group to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`}>
              <Card>
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                {group.description && <p className="mt-1 text-sm text-gray-500">{group.description}</p>}
                <p className="mt-2 text-xs text-gray-400">{group.members.length} member(s)</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

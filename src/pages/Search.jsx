import React, { useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Search(){
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const onSearch = async e => {
    e.preventDefault()
    const res = await api.get(`/api/recipes?q=${encodeURIComponent(q)}`)
    setResults(res.data)
  }
  return (
    <div>
      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipes or ingredients" className="flex-1 p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
      </form>
      <div className="grid gap-3">
        {results.map(r=> (
          <Link to={`/r/${r._id}`} key={r._id} className="p-3 bg-white rounded shadow">{r.title}</Link>
        ))}
      </div>
    </div>
  )
}

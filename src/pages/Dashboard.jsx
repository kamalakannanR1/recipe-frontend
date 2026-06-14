import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [data, setData] = useState(null)
  useEffect(()=>{ api.get('/api/users/dashboard/me').then(r=>setData(r.data)).catch(()=>{}); },[])
  if (!data) return <div>Loading dashboard...</div>
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl mb-4 font-semibold text-primary-deep">Your Dashboard</h2>
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Your Recipes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recipes.map(r=> (
            <Link key={r._id} to={`/r/${r._id}`} className="card p-3 flex items-center gap-3">
              <div className="flex-1 font-semibold text-primary-deep">{r.title}</div>
              <div className="text-sm text-gray-600">{r._id && r._id.slice(0,6)}</div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h3 className="font-semibold mb-2">Favorites</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.user.favorites && data.user.favorites.map(f=> (
            <Link key={f._id} to={`/r/${f._id}`} className="card p-3 flex items-center justify-between">
              <div className="font-medium text-primary-deep">{f.title}</div>
              <div className="text-sm text-gray-600">View</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

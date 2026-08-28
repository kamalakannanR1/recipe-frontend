import React, { useEffect, useState } from 'react'
import api, { assetUrl } from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [data, setData] = useState(null)
  const [showAllRecipes, setShowAllRecipes] = useState(false)
  const [showAllFavorites, setShowAllFavorites] = useState(false)
  const navigate = useNavigate()
  useEffect(()=>{ api.get('/api/users/dashboard/me').then(r=>setData(r.data)).catch(err=>{ if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login') } }); },[navigate])
  if (!data) return <div>Loading dashboard...</div>
  const favorites = data.user.favorites || []
  return (
    <div className="max-w-5xl mx-auto">
      <section className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-3">Your kitchen journal</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-primary-deep">Welcome back, {data.user.name || 'chef'}.</h2>
          <p className="mt-3 text-gray-600">Keep your recipes close and your next meal inspired.</p>
        </div>
        <Link to="/new" className="btn-primary text-center whitespace-nowrap">+ Create recipe</Link>
      </section>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        <div className="bg-primary-deep text-white rounded-xl p-4"><div className="text-3xl font-bold">{data.recipes.length}</div><div className="text-sm text-teal-100">Your recipes</div></div>
        <div className="bg-white border border-[#e0ebe4] rounded-xl p-4"><div className="text-3xl font-bold text-primary-deep">{favorites.length}</div><div className="text-sm text-gray-500">Saved favorites</div></div>
      </div>
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4"><h3 className="text-2xl font-semibold text-primary-deep">Your recipes</h3><div className="flex items-center gap-4"><Link to="/my-recipes" className="text-sm font-semibold text-primary-deep hover:text-accent-gold">View list →</Link><Link to="/new" className="text-sm font-semibold text-primary-deep hover:text-accent-gold">Create new →</Link></div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.recipes.slice(0, 4).map(r=> (
            <Link key={r._id} to={`/r/${r._id}`} className="card p-5 flex items-center justify-between gap-4 hover:-translate-y-1">
              {r.images?.[0] && <img src={assetUrl(r.images[0])} alt="" className="w-20 h-20 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0"><div className="font-semibold text-lg text-primary-deep truncate">{r.title}</div><div className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description || 'A recipe from your kitchen journal.'}</div><div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">{r.cuisine && <span className="px-2 py-1 rounded-full bg-accent-gold/15 text-primary-deep">{r.cuisine}</span>}{r.cookTime && <span className="px-2 py-1 rounded-full bg-gray-100">{r.cookTime}</span>}{(r.dietary || []).map(type=><span key={type} className="px-2 py-1 rounded-full bg-primary-soft/20 text-primary-deep">{type}</span>)}</div></div>
              <span className="text-primary-deep text-xl">→</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4"><h3 className="text-2xl font-semibold text-primary-deep">Favorites</h3><div className="flex items-center gap-4"><span className="text-sm text-gray-500 hidden sm:inline">Your saved collection</span>{favorites.length > 4 && <button type="button" onClick={()=>setShowAllFavorites(value=>!value)} className="text-sm font-semibold text-primary-deep hover:text-accent-gold">{showAllFavorites ? 'View less' : 'View all'}</button>}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {favorites.slice(0, showAllFavorites ? favorites.length : 4).map(f=> (
            <Link key={f._id} to={`/r/${f._id}`} className="card p-5 flex items-center justify-between gap-4 hover:-translate-y-1">
              {f.images?.[0] && <img src={assetUrl(f.images[0])} alt="" className="w-20 h-20 rounded-lg object-cover" />}
              <div className="flex-1"><div className="font-semibold text-lg text-primary-deep">{f.title}</div><div className="text-sm text-gray-500 mt-1">Saved favorite</div></div>
              <span className="text-accent-gold text-xl">♥</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

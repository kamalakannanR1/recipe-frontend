import React, { useEffect, useState } from 'react'
import api, { assetUrl } from '../api'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'

export default function Home(){
  const [recipes, setRecipes] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    const q = params.get('q')
    const ingredient = params.get('ingredient')
    const cuisine = params.get('cuisine')
    const dietary = params.get('dietary')
    const filters = { q, ingredient, cuisine, dietary }
    const hasFilters = Object.values(filters).some(value => value)
    api.get('/api/recipes', hasFilters ? { params: filters } : undefined)
      .then(r => setRecipes(r.data))
      .catch(()=>{})
  },[location.search])

  function getAnonId(){
    let id = localStorage.getItem('anonId')
    if (!id){ 
      id = 'anon_' + Math.random().toString(36).slice(2,9)
      localStorage.setItem('anonId', id) 
    }
    return id
  }

  const logged = Boolean(localStorage.getItem('token'))
  const [plannerIds, setPlannerIds] = useState(() => (
    JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]').map(i=>i._id)
  ))

  useEffect(()=>{
    function updateFromStorage(){
      const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]')
      setPlannerIds(cur.map(i=>i._id))
    }
    updateFromStorage()
    window.addEventListener('storage', updateFromStorage)
    window.addEventListener('mealPlannerUpdated', updateFromStorage)
    return ()=>{
      window.removeEventListener('storage', updateFromStorage)
      window.removeEventListener('mealPlannerUpdated', updateFromStorage)
    }
  },[])

  return (
    <div>
      <section className="mb-10 max-w-3xl">
        <p className="uppercase tracking-[.22em] text-xs font-bold text-accent-gold mb-3">Cook something memorable</p>
        <h2 className="text-4xl sm:text-5xl leading-tight mb-3 text-primary-deep">Discover recipes worth sharing.</h2>
        <p className="text-gray-600 text-base sm:text-lg">Find thoughtful, everyday dishes from a community of home cooks.</p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recipes.map(r => (
          <Link to={`/r/${r._id}`} key={r._id} className="p-4 card flex gap-4 hover:-translate-y-1">
            <div className="w-32 h-28 sm:w-36 sm:h-32 bg-[#e8f0eb] flex-shrink-0 rounded-lg overflow-hidden">
              {r.images && r.images[0] ? (() => {
                const src = assetUrl(r.images[0])
                return <img src={src} alt="thumb" className="w-full h-full object-cover"/>
              })() : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-primary-deep truncate">{r.title}</h3>
                <StarRating recipe={r} small readOnly />
              </div>
              <p className="text-sm text-gray-600 truncate">{r.description}</p>
              <p className="text-xs text-gray-500">By: {r.author?.name || 'Unknown'}</p>
              <div className="mt-2">
                  <button 
                    disabled={plannerIds.includes(r._id)} 
                    onClick={(e)=>{ 
                      e.preventDefault()
                      const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]')
                      const avg = r._avg || (r.ratings && r.ratings.length 
                        ? (r.ratings.reduce((s,x)=>s+(x.rating||0),0)/r.ratings.length) 
                        : 0)
                      cur.push({_id: r._id, title: r.title, images: r.images, avg })
                      localStorage.setItem('mealPlannerTemp', JSON.stringify(cur))
                      setPlannerIds(cur.map(i=>i._id))
                      try{ window.dispatchEvent(new Event('mealPlannerUpdated')) }catch(e){}
                      navigate('/mealplanner') 
                    }} 
                    className={"mt-2 px-3 py-1 rounded text-sm btn-primary " + 
                      (plannerIds.includes(r._id) ? 'opacity-50 cursor-not-allowed' : '')}>
                    Add to meal planner
                  </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import api from '../api'
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
    api.get('/api/recipes', { params: { q, ingredient, cuisine, dietary } })
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
      <h2 className="text-3xl mb-6 text-primary-deep">Discover Recipes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map(r => (
          <Link to={`/r/${r._id}`} key={r._id} className="p-4 card flex gap-4 transform hover:scale-[1.01]">
            <div className="w-28 h-20 bg-gray-100 flex-shrink-0">
              {r.images && r.images[0] ? (() => {
                const s = r.images[0]
                const src = (s.startsWith('http://') || s.startsWith('https://')) 
                  ? s 
                  : (`http://localhost:5000${s}`)
                return <img src={src} alt="thumb" className="w-full h-full object-cover"/>
              })() : null}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-primary-deep">{r.title}</h3>
                <StarRating recipe={r} small readOnly />
              </div>
              <p className="text-sm text-gray-600 truncate">{r.description}</p>
              <p className="text-xs text-gray-500">By: {r.author?.name || 'Unknown'}</p>
              {!logged && (
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
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

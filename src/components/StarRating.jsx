import React, { useState } from 'react'
import api from '../api'

export default function StarRating({ recipe, small, readOnly = false }){
  const avg = recipe._avg || (recipe.ratings && recipe.ratings.length ? (recipe.ratings.reduce((s,r)=>s+(r.rating||0),0)/recipe.ratings.length) : 0)
  const [hover, setHover] = useState(0)
  const [value, setValue] = useState(0)
  const logged = Boolean(localStorage.getItem('token'))

  function getAnonId(){
    let id = localStorage.getItem('anonId')
    if (!id){ id = 'anon_' + Math.random().toString(36).slice(2,9); localStorage.setItem('anonId', id) }
    return id
  }

  const submit = async (v)=>{
    if (readOnly) return
    try{
      const payload = { rating: v }
      if (!logged) payload.anonId = getAnonId()
      const res = await api.post(`/api/recipes/${recipe._id}/rate`, payload)
      setValue(v)
      if (res.data && res.data.average !== undefined) recipe._avg = res.data.average
    }catch(e){ console.error(e) }
  }

  return (
    <div className={"flex items-center gap-2 " + (small ? 'text-sm' : '')}>
      <div className="flex">
        {[1,2,3,4,5].map(i=>{
          const filled = hover ? i<=hover : i<=Math.round(recipe._avg || avg || value)
          if (readOnly) {
            return <span key={i} className={"px-1 text-2xl " + (i <= Math.round(recipe._avg || avg || value) ? 'text-accent-gold' : 'text-gray-200')}>★</span>
          }
          return (
            <button key={i} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>submit(i)} className="text-2xl leading-none">
              <span className={"px-1 " + (filled ? 'text-accent-gold' : 'text-gray-200')}>★</span>
            </button>
          )
        })}
      </div>
      <div className="text-sm text-gray-600">{(recipe._avg || avg).toFixed ? (recipe._avg || avg).toFixed(1) : (recipe._avg || avg)}</div>
    </div>
  )
}

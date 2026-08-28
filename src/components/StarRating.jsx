import React, { useState } from 'react'
import api from '../api'

export default function StarRating({ recipe, small, readOnly = false }){
  const avg = recipe._avg || (recipe.ratings && recipe.ratings.length ? (recipe.ratings.reduce((s,r)=>s+(r.rating||0),0)/recipe.ratings.length) : 0)
  const [hover, setHover] = useState(0)
  const [value, setValue] = useState(0)
  const [displayedAverage, setDisplayedAverage] = useState(avg)
  const [message, setMessage] = useState('')
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
      if (res.data && res.data.average !== undefined) {
        recipe._avg = res.data.average
        setDisplayedAverage(res.data.average)
      }
      setMessage('Thanks for rating')
    }catch(e){
      console.error(e)
      setMessage('Rating failed')
    }
  }

  return (
    <div className={"flex items-center gap-2 " + (small ? 'text-sm' : '')}>
      <div className="flex">
        {[1,2,3,4,5].map(i=>{
          const filled = hover ? i<=hover : value ? i<=value : i<=Math.round(displayedAverage)
          if (readOnly) {
            return <span key={i} className={"px-1 text-2xl " + (i <= Math.round(recipe._avg || avg || value) ? 'text-accent-gold' : 'text-gray-200')}>★</span>
          }
          return (
            <button type="button" key={i} aria-label={`Rate ${i} out of 5`} title={`Rate ${i} out of 5`} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)} onClick={()=>submit(i)} className="text-2xl leading-none hover:scale-110">
              <span className={"px-1 " + (filled ? 'text-accent-gold' : 'text-gray-200')}>★</span>
            </button>
          )
        })}
      </div>
      <div className="text-sm text-gray-600">{Number(displayedAverage).toFixed(1)}</div>
      {!readOnly && message && <span className={message === 'Rating failed' ? 'text-sm text-red-600' : 'text-sm text-primary-deep'}>{message}</span>}
    </div>
  )
}

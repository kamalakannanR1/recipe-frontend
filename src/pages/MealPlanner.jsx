import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function MealPlanner(){
  const [plans, setPlans] = useState([])
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  
  const [temp, setTemp] = useState([])
  useEffect(()=>{ api.get('/api/mealplans').then(r=>setPlans(r.data)).catch(()=>{}); },[])
  useEffect(()=>{
    const t = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]')
    setTemp(t)
  },[])
  

  const removeTemp = (idx)=>{
    const next = temp.slice()
    next.splice(idx,1)
    setTemp(next)
    localStorage.setItem('mealPlannerTemp', JSON.stringify(next))
    // notify other pages to update their UI
    try{ window.dispatchEvent(new Event('mealPlannerUpdated')) }catch(e){}
  }

  
  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')} className="px-3 py-1 bg-white border border-primary-deep text-primary-deep rounded">Back</button>
      </div>
      <h2 className="text-2xl mb-4">Meal Planner</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Selected recipes</h3>
        {temp.length === 0 ? <div className="text-sm text-gray-600">No recipes selected. Add from the home or recipe page.</div> : (
          <div className="space-y-2">
            {temp.map((t,i)=> (
              <div key={i} className="p-2 bg-white rounded shadow flex items-center gap-3">
                {t.images && t.images[0] ? <img src={(t.images[0].startsWith && (t.images[0].startsWith('http://')||t.images[0].startsWith('https://')))? t.images[0] : (`http://localhost:5000${t.images[0]}`)} alt="thumb" className="w-16 h-12 object-cover"/> : null}
                <div className="flex-1">
                  <div className="font-semibold text-primary-deep">{t.title}</div>
                  {typeof t.avg !== 'undefined' && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <div className="text-accent-gold">
                        {Array.from({length:5}).map((_,k)=> (
                          <span key={k} className={k < Math.round(t.avg) ? 'text-accent-gold' : 'text-gray-200'}>★</span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{(t.avg||0).toFixed(1)}</div>
                    </div>
                  )}
                </div>
                <button onClick={()=>removeTemp(i)} className="px-2 py-1 text-sm border rounded">Remove</button>
              </div>
            ))}
            
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {plans.map(p=> (
          <div key={p._id} className="p-3 bg-white rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}

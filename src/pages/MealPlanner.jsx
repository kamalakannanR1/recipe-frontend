import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { assetUrl } from '../api'

export default function MealPlanner(){
  const [plans, setPlans] = useState([])
  const [title, setTitle] = useState('My meal plan')
  const [saveState, setSaveState] = useState('')
  const [shareState, setShareState] = useState('')
  const navigate = useNavigate()
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  
  const [temp, setTemp] = useState([])
  const weekDays = Array.from({length: 7}, (_, index) => { const date = new Date(); date.setDate(date.getDate() + index); return date.toISOString().slice(0, 10) })
  useEffect(()=>{
    if (isLoggedIn) api.get('/api/mealplans').then(r=>setPlans(r.data)).catch(()=>{})
  },[isLoggedIn])
  useEffect(()=>{
    const t = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]')
    setTemp(t.map(item => ({...item, day: item.day || weekDays[0]})))
  },[])
  

  const removeTemp = (idx)=>{
    const next = temp.slice()
    next.splice(idx,1)
    setTemp(next)
    localStorage.setItem('mealPlannerTemp', JSON.stringify(next))
    // notify other pages to update their UI
    try{ window.dispatchEvent(new Event('mealPlannerUpdated')) }catch(e){}
  }

  const savePlan = async (e) => {
    e.preventDefault()
    if (!temp.length) return
    setSaveState('saving')
    try {
      const details = await Promise.all(temp.map(recipe => api.get(`/api/recipes/${recipe._id}`).then(res=>res.data)))
      const shopping = {}
      details.forEach(recipe => (recipe.ingredients || []).forEach(item => { const key = item.name.trim().toLowerCase(); shopping[key] = shopping[key] || {name:item.name, qty:[]}; if (item.quantity) shopping[key].qty.push(item.quantity) }))
      const plan = await api.post('/api/mealplans', {
        title: title.trim() || 'My meal plan',
        days: weekDays.map(day => ({ date: day, meals: temp.filter(recipe=>recipe.day===day).map(recipe => ({ mealType: 'meal', recipe: recipe._id })) })).filter(day=>day.meals.length),
        shoppingList: Object.values(shopping).map(item => ({name:item.name, qty:item.qty.join(' + ')}))
      })
      setPlans(current => [plan.data, ...current])
      setTemp([])
      localStorage.removeItem('mealPlannerTemp')
      window.dispatchEvent(new Event('mealPlannerUpdated'))
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
    }
  }

  const sharePlan = async plan => {
    try {
      await api.put(`/api/mealplans/${plan._id}/share`, {shared:true})
      const shareUrl = `${window.location.origin}/mealplans/shared/${plan._id}`
      if (navigator.share) await navigator.share({ title: plan.title, text: 'View my meal plan', url: shareUrl })
      else if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl)
      setShareState(plan._id)
    } catch (err) { setShareState('error') }
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
              <div key={i} role="link" tabIndex="0" onClick={()=>navigate(`/r/${t._id}`, { state: { fromPlanner: true } })} onKeyDown={e=>{ if (e.key === 'Enter' || e.key === ' ') navigate(`/r/${t._id}`, { state: { fromPlanner: true } }) }} className="p-2 bg-white rounded shadow flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md">
                {t.images && t.images[0] ? <img src={assetUrl(t.images[0])} alt="thumb" className="w-16 h-12 object-cover"/> : null}
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
                <select value={t.day} onClick={e=>e.stopPropagation()} onChange={e=>{ e.stopPropagation(); const next=temp.map((item,index)=>index===i?{...item,day:e.target.value}:item); setTemp(next); localStorage.setItem('mealPlannerTemp', JSON.stringify(next)) }} className="w-32 p-2 border rounded text-sm"><option value={weekDays[0]}>Today</option>{weekDays.slice(1).map(day=><option key={day} value={day}>{new Date(`${day}T00:00:00`).toLocaleDateString(undefined,{weekday:'short'})}</option>)}</select>
                <button onClick={e=>{ e.stopPropagation(); removeTemp(i) }} className="px-2 py-1 text-sm border rounded">Remove</button>
              </div>
            ))}
            
          </div>
        )}
      </div>

      {!isLoggedIn && temp.length > 0 && <div className="mb-6 rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-semibold text-primary-deep">Ready to save this plan?</p><p className="text-sm text-gray-600">Log in to save your week and share it with others.</p></div><button type="button" onClick={()=>navigate('/login')} className="btn-primary text-center">Log in to save & share</button></div>}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-3"><h3 className="text-2xl font-semibold text-primary-deep">This week</h3><span className="text-sm text-gray-500">Plan by day</span></div>
        <div className="grid grid-cols-7 min-w-[840px] gap-2">
          {weekDays.map((day, index)=><div key={day} className="min-h-36 rounded-xl border border-[#dce9e0] bg-white p-3"><div className="text-xs uppercase tracking-wider text-gray-500">{index === 0 ? 'Today' : new Date(`${day}T00:00:00`).toLocaleDateString(undefined,{weekday:'short'})}</div><div className="text-sm font-semibold text-primary-deep mb-3">{new Date(`${day}T00:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div><div className="space-y-2">{temp.filter(recipe=>recipe.day===day).map(recipe=><button type="button" key={recipe._id} onClick={()=>navigate(`/r/${recipe._id}`, {state:{fromPlanner:true}})} className="w-full text-left text-xs font-semibold p-2 rounded-lg bg-primary-soft/20 text-primary-deep hover:bg-primary-soft/40 truncate">{recipe.title}</button>)}</div></div>)}
        </div>
      </section>

      {isLoggedIn && temp.length > 0 && (
        <form onSubmit={savePlan} className="mb-6 p-4 bg-white rounded shadow">
          <label htmlFor="plan-title" className="block font-semibold mb-2">Save this plan</label>
          <div className="flex gap-2">
            <input id="plan-title" value={title} onChange={e=>setTitle(e.target.value)} className="p-2 border rounded flex-1" />
            <button type="submit" disabled={saveState === 'saving'} className="px-3 py-2 btn-primary">
              {saveState === 'saving' ? 'Saving...' : 'Save plan'}
            </button>
          </div>
          {saveState === 'saved' && <p className="text-sm text-green-700 mt-2">Plan saved.</p>}
          {saveState === 'error' && <p className="text-sm text-red-700 mt-2">Could not save the plan.</p>}
        </form>
      )}

      <div className="grid gap-3">
        {plans.map(p=> (
          <div key={p._id} className="p-3 bg-white rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-600">{p.shoppingList?.length || 0} ingredients to shop</p>
            {p.shoppingList?.length > 0 && <ul className="mt-2 space-y-1 text-sm text-gray-700">{p.shoppingList.slice(0, 6).map((item, index)=><li key={index} className="flex justify-between gap-3"><span>{item.name}</span><span className="text-gray-500">{item.qty}</span></li>)}</ul>}
            {p.shoppingList?.length > 6 && <p className="text-xs text-gray-500 mt-1">+ {p.shoppingList.length - 6} more ingredients</p>}
            <button type="button" onClick={()=>sharePlan(p)} className="mt-2 text-sm font-semibold text-primary-deep">{shareState === p._id ? 'Link copied' : 'Share plan'}</button>
            {shareState === p._id && <a href={`/mealplans/shared/${p._id}`} target="_blank" rel="noreferrer" className="block text-xs text-primary-deep underline mt-1">Open shared plan</a>}
            {shareState === p._id && <div className="flex flex-wrap gap-3 mt-3 text-xs font-semibold"><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&url=${encodeURIComponent(`${window.location.origin}/mealplans/shared/${p._id}`)}`} target="_blank" rel="noreferrer" className="text-primary-deep hover:text-accent-gold">Share on X</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/mealplans/shared/${p._id}`)}`} target="_blank" rel="noreferrer" className="text-primary-deep hover:text-accent-gold">Facebook</a><a href={`https://wa.me/?text=${encodeURIComponent(`${p.title} ${window.location.origin}/mealplans/shared/${p._id}`)}`} target="_blank" rel="noreferrer" className="text-primary-deep hover:text-accent-gold">WhatsApp</a></div>}
            {shareState === 'error' && <p className="text-xs text-red-600 mt-1">Could not create share link.</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

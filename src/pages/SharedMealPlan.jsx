import React, { useEffect, useState } from 'react'
import api from '../api'

export default function SharedMealPlan(){
  const id = window.location.pathname.split('/').pop()
  const [plan, setPlan] = useState(null)
  useEffect(()=>{ api.get(`/api/mealplans/${id}`).then(res=>setPlan(res.data)).catch(()=>setPlan({error:true})) },[id])
  if (!plan) return <div>Loading shared meal plan...</div>
  if (plan.error) return <div className="text-center text-gray-600">Shared meal plan not found.</div>
  return <div className="max-w-4xl mx-auto"><p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-2">Shared meal plan</p><h2 className="text-4xl sm:text-5xl font-bold text-primary-deep">{plan.title}</h2><div className="mt-8 grid gap-4">{plan.days.map(day=><section key={day.date} className="bg-white rounded-2xl border border-[#e0ebe4] p-5"><h3 className="text-xl font-semibold text-primary-deep mb-3">{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}</h3>{day.meals.map((meal,index)=><div key={index} className="flex items-center gap-3 py-2 border-t border-gray-100"><span className="text-gray-500 text-sm">{meal.mealType}</span><span className="font-semibold">{meal.recipe?.title || 'Recipe'}</span></div>)}</section>)}</div>{plan.shoppingList?.length > 0 && <section className="mt-6 bg-[#f1f7f3] rounded-2xl p-5"><h3 className="text-xl font-semibold text-primary-deep mb-3">Shopping list</h3><ul className="space-y-2">{plan.shoppingList.map((item,index)=><li key={index} className="flex justify-between border-b border-white/70 pb-2"><span>{item.name}</span><span className="text-gray-600">{item.qty}</span></li>)}</ul></section>}</div>
}

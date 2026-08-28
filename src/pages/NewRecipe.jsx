import React, { useState } from 'react'
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom'

export default function NewRecipe(){
  const location = useLocation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState(1)
  const [videoUrl, setVideoUrl] = useState('')
  const [images, setImages] = useState([])
  const [dietary, setDietary] = useState([])
  const nav = useNavigate()

  const onFiles = e => setImages(Array.from(e.target.files))

  const onSubmit = async e => {
    e.preventDefault()
    try {
      const recipe = {
        title,
        description,
        dietary,
        ingredients: ingredients.split('\n').filter(Boolean).map(l => {
          const [name, qty] = l.split('|').map(s=>s.trim())
          return { name, quantity: qty || '' }
        }),
        steps: steps.split('\n').filter(Boolean),
        cookTime,
        servings: Number(servings)
      }

      const fd = new FormData()
      fd.append('recipe', JSON.stringify(recipe))
      fd.append('videoUrl', videoUrl)
      images.forEach(f => fd.append('images', f))

      const res = await api.post('/api/recipes', fd)
      alert('Recipe created')
      nav(`/r/${res.data._id}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Submit failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={()=>nav(location.state?.fromMyRecipes ? '/my-recipes' : '/dashboard')} className="px-3 py-2 bg-white border border-[#cadbd2] text-primary-deep rounded-lg hover:bg-primary-soft/20">← Back to {location.state?.fromMyRecipes ? 'my recipes' : 'dashboard'}</button>
      </div>
      <div className="mb-6"><p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-2">Your next signature dish</p><h2 className="text-4xl sm:text-5xl font-bold text-primary-deep">Create a recipe</h2><p className="mt-2 text-gray-600">Share the details that make your dish worth returning to.</p></div>
      <div className="bg-[#fffefa] rounded-2xl border border-[#e0ebe4] shadow-sm p-5 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 block w-full rounded border p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 block w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Ingredients (one per line, optional quantity after | )</label>
          <textarea value={ingredients} onChange={e=>setIngredients(e.target.value)} placeholder="e.g. Tomato | 2 pcs" className="mt-1 block w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Steps (one per line)</label>
          <textarea value={steps} onChange={e=>setSteps(e.target.value)} className="mt-1 block w-full rounded border p-2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={cookTime} onChange={e=>setCookTime(e.target.value)} placeholder="Cook time" className="p-2 border rounded" />
          <input type="number" value={servings} onChange={e=>setServings(e.target.value)} placeholder="Servings" className="p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Dietary</label>
          <div className="mt-1">
            <DietaryCheckboxes value={dietary} onChange={setDietary} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">YouTube video URL (optional)</label>
          <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="mt-1 block w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Images (multiple)</label>
          <input type="file" accept="image/*" multiple onChange={onFiles} />
        </div>
        <button type="submit" className="btn-primary">Publish recipe →</button>
      </form>
      </div>
    </div>
  )
}

const DIETARY_OPTIONS = ['Dairy-free','Gluten-free','Vegetarian','Vegan']

function DietaryCheckboxes({ value, onChange }){
  const toggle = (opt)=>{
    const next = value.includes(opt) ? value.filter(v=>v!==opt) : value.concat(opt)
    onChange(next)
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {DIETARY_OPTIONS.map(opt=> (
        <label key={opt} className="flex items-center gap-2">
          <input type="checkbox" checked={value.includes(opt)} onChange={()=>toggle(opt)} />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  )
}

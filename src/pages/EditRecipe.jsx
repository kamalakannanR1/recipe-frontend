import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditRecipe(){
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState(1)
  const [videoUrl, setVideoUrl] = useState('')
  const [images, setImages] = useState([])
  const nav = useNavigate()

  useEffect(()=>{
    if (!id) return
    api.get(`/api/recipes/${id}`).then(r=>{
      const rec = r.data
      setTitle(rec.title||'')
      setDescription(rec.description||'')
      setIngredients((rec.ingredients||[]).map(i=>`${i.name} | ${i.quantity}`).join('\n'))
      setSteps((rec.steps||[]).join('\n'))
      setCookTime(rec.cookTime||'')
      setServings(rec.servings||1)
      setVideoUrl(rec.videoUrl||'')
      setLoading(false)
    }).catch(err=>{ alert('Failed to load'); nav('/') })
  },[id])

  const onFiles = e => setImages(Array.from(e.target.files))

  const onSubmit = async e => {
    e.preventDefault()
    try{
      const payload = {
        title, description,
        ingredients: ingredients.split('\n').filter(Boolean).map(l => { const [name, qty] = l.split('|').map(s=>s.trim()); return { name, quantity: qty || '' } }),
        steps: steps.split('\n').filter(Boolean), cookTime, servings: Number(servings)
      }
      const fd = new FormData()
      fd.append('recipe', JSON.stringify(payload))
      fd.append('videoUrl', videoUrl)
      images.forEach(f => fd.append('images', f))
      const res = await api.put(`/api/recipes/${id}`, fd)
      alert('Updated')
      nav(`/r/${id}`)
    } catch (err){ alert(err.response?.data?.error || 'Update failed') }
  }

  if (loading) return <div>Loading...</div>
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card p-6">
        <h2 className="text-2xl mb-4 font-semibold text-primary-deep">Edit Recipe</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 block w-full p-3 border rounded border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-soft" required />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 block w-full p-3 border rounded border-gray-200" />
          </div>
          <div>
            <label className="text-sm font-medium">Ingredients</label>
            <textarea value={ingredients} onChange={e=>setIngredients(e.target.value)} placeholder="one per line" className="mt-1 block w-full p-3 border rounded border-gray-200" />
          </div>
          <div>
            <label className="text-sm font-medium">Steps</label>
            <textarea value={steps} onChange={e=>setSteps(e.target.value)} placeholder="one per line" className="mt-1 block w-full p-3 border rounded border-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={cookTime} onChange={e=>setCookTime(e.target.value)} placeholder="Cook time" className="p-2 border rounded" />
            <input type="number" value={servings} onChange={e=>setServings(e.target.value)} placeholder="Servings" className="p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">YouTube URL</label>
            <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="mt-1 block w-full p-3 border rounded border-gray-200" placeholder="YouTube URL" />
          </div>
          <div>
            <label className="text-sm font-medium">Images</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} className="mt-1" />
          </div>
          <div>
            <button className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

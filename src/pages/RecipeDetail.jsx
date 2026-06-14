import React, { useEffect, useState } from 'react'
import api from '../api'
import { useParams, useNavigate } from 'react-router-dom'
import StarRating from '../components/StarRating'

function VideoEmbed({ url }){
  if (!url) return null
  // basic YouTube embed support
  const m = url.match(/v=([^&]+)/)
  const id = m ? m[1] : null
  if (!id) return <a href={url} target="_blank">Watch video</a>
  return <iframe width="560" height="315" src={`https://www.youtube.com/embed/${id}`} title="Video" frameBorder="0" allowFullScreen />
}

export default function RecipeDetail(){
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [favState, setFavState] = useState(null)
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const navigate = useNavigate()
  const [inPlanner, setInPlanner] = useState(() => {
    const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]')
    return cur.findIndex(i=>i._id===id) >= 0
  })
  function getAnonId(){
    let id = localStorage.getItem('anonId')
    if (!id){ id = 'anon_' + Math.random().toString(36).slice(2,9); localStorage.setItem('anonId', id) }
    return id
  }
  useEffect(()=>{ if (!id) return; api.get(`/api/recipes/${id}`).then(r=>setRecipe(r.data)).catch(()=>{}); },[id])

  useEffect(()=>{
    function update(){ const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]'); setInPlanner(cur.findIndex(i=>i._id===id) >= 0) }
    window.addEventListener('storage', update)
    window.addEventListener('mealPlannerUpdated', update)
    update()
    return ()=>{ window.removeEventListener('storage', update); window.removeEventListener('mealPlannerUpdated', update) }
  },[id])

  useEffect(()=>{
    // fetch current user to check favorites (simple)
    if (!recipe) { setFavState(null); return }
    if (!isLoggedIn) { setFavState(false); return }
    api.get('/api/users').then(r=>{
      const favs = (r.data && r.data.favorites) || []
      setFavState(favs.findIndex(f=>f._id===id) >= 0)
    }).catch(()=>{})
  },[recipe])

  const toggleFav = async () => {
    if (!isLoggedIn) { alert('Please log in to add favorites'); window.location.href = '/login'; return }
    const res = await api.post(`/api/users/favorites/${id}`)
    setFavState(res.data.added)
  }

  const [isOwner, setIsOwner] = useState(false)
  useEffect(()=>{
    if (!recipe) { setIsOwner(false); return }
    if (!isLoggedIn) { setIsOwner(false); return }
    api.get('/api/users').then(r=>{
      if (!r.data) return
      const currentUserId = r.data._id || r.data.id
      const authorId = recipe.author && (recipe.author._id || recipe.author)
      setIsOwner(Boolean(currentUserId && authorId && String(currentUserId) === String(authorId)))
    }).catch(()=>{})
  },[recipe])

  const onDelete = async () => {
    if (!confirm('Delete this recipe?')) return
    try {
      await api.delete(`/api/recipes/${id}`)
      alert('Deleted')
      window.location.href = '/'
    } catch (err) { alert(err.response?.data?.error || 'Delete failed') }
  }

  if (!recipe) return <div>Loading...</div>

  return (
    <div>
      <div className="mb-4">
        <button onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')} className="px-3 py-1 bg-white border border-primary-deep text-primary-deep rounded">Back</button>
      </div>
      <h2 className="text-3xl font-bold text-primary-deep">{recipe.title}</h2>
      <div className="mt-2 flex items-center gap-3">
        <button onClick={async ()=>{
          try{
            const payload = {}
            if (!isLoggedIn) payload.anonId = getAnonId()
            const res = await api.post(`/api/recipes/${id}/like`, payload)
            // optional refresh
            api.get(`/api/recipes/${id}`).then(r=>setRecipe(r.data))
          }catch(e){ console.error(e) }
        }} className="px-2 py-1 border rounded">♥ {(recipe.likes?recipe.likes.length:0) + (recipe.anonLikes?recipe.anonLikes.length:0)}</button>
        {!isLoggedIn && (
          <button disabled={inPlanner} onClick={(e)=>{ e.preventDefault(); const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]'); const avg = recipe._avg || (recipe.ratings && recipe.ratings.length ? (recipe.ratings.reduce((s,x)=>s+(x.rating||0),0)/recipe.ratings.length) : 0); cur.push({_id: recipe._id, title: recipe.title, images: recipe.images, avg}); localStorage.setItem('mealPlannerTemp', JSON.stringify(cur)); setInPlanner(true); try{ window.dispatchEvent(new Event('mealPlannerUpdated')) }catch(e){}; window.location.href='/mealplanner' }} className={"px-3 py-1 rounded btn-primary " + (inPlanner ? 'opacity-50 cursor-not-allowed' : '')}>Add to meal planner</button>
        )}
        <div>
          <button onClick={()=>{ const url = window.location.href; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(recipe.title)}&url=${encodeURIComponent(url)}`,'_blank') }} className="px-2 py-1 rounded-md bg-primary-soft text-primary-deep border border-primary-deep">Share</button>
        </div>
      </div>
      <p className="text-gray-600">{recipe.description}</p>
      <div className="my-4">
        {recipe.images && recipe.images.map((s,i)=>{
          const src = (s.startsWith && (s.startsWith('http://') || s.startsWith('https://'))) ? s : (`http://localhost:5000${s}`)
          return <img key={i} src={src} alt="" className="max-w-xs mr-2 inline" />
        })}
      </div>
      <VideoEmbed url={recipe.videoUrl} />
      <h3 className="mt-4 font-semibold">Ingredients</h3>
      <ul>{recipe.ingredients && recipe.ingredients.map((ing,i)=>(<li key={i}>{ing.name} {ing.quantity}</li>))}</ul>
      <h3 className="mt-4 font-semibold">Steps</h3>
      <ol className="list-decimal ml-6">{recipe.steps && recipe.steps.map((s,i)=>(<li key={i}>{s}</li>))}</ol>
      <div className="mt-4 flex gap-2">
        {isLoggedIn && <button onClick={toggleFav} className="px-3 py-2 bg-yellow-400 rounded">{favState ? 'Unfavorite' : 'Add to Favorites'}</button>}
        {isOwner && (
          <>
            <a href={`/edit/${id}`} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</a>
            <button onClick={onDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
          </>
        )}
      </div>
      <div className="mt-8">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Reviews</h3>
          <StarRating recipe={recipe} />
        </div>
        <h3 className="font-semibold mb-2">Comments</h3>
        <div className="space-y-3">
          {recipe.comments && recipe.comments.map(c => (
            <div key={c._id} className="p-3 bg-white rounded shadow-sm">
              <div className="text-sm font-semibold">{(c.user && c.user.name) || c.name || 'Anonymous'}</div>
              <div className="text-sm text-gray-700">{c.text}</div>
            </div>
          ))}
        </div>
        <CommentForm recipeId={id} onAdded={(comm)=>{ setRecipe(prev=>({...prev, comments: (prev.comments||[]).concat(comm)})) }} />
      </div>
    </div>
  )
}

function CommentForm({ recipeId, onAdded }){
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const logged = Boolean(localStorage.getItem('token'))
  function getAnonId(){ let id = localStorage.getItem('anonId'); if(!id){ id='anon_'+Math.random().toString(36).slice(2,9); localStorage.setItem('anonId',id)} return id }
  const submit = async (e)=>{
    e && e.preventDefault()
    try{
      const payload = { text }
      if (!logged) { payload.anonId = getAnonId(); if (name) payload.name = name }
      const res = await api.post(`/api/recipes/${recipeId}/comments`, payload)
      setText('')
      setName('')
      if (onAdded) onAdded(res.data)
    }catch(e){ alert('Comment failed') }
  }
  return (
    <form onSubmit={submit} className="mt-4">
      {!logged && <input placeholder="Name (optional)" value={name} onChange={e=>setName(e.target.value)} className="p-2 border rounded w-full mb-2" />}
      <textarea placeholder="Write a comment" value={text} onChange={e=>setText(e.target.value)} className="p-2 border rounded w-full" />
      <div className="mt-2"><button type="submit" className="px-3 py-2 btn-primary">Post comment</button></div>
    </form>
  )
}

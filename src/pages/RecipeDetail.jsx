import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import StarRating from '../components/StarRating'

function VideoEmbed({ url }){
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  const id = match ? match[1] : null
  if (!id) return <a href={url} target="_blank" rel="noreferrer" className="inline-block mt-6 text-primary-deep font-semibold hover:text-accent-gold">Watch recipe video →</a>
  return (
    <section className="mt-8 bg-[#17211d] rounded-2xl p-3 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3 px-2 pb-3">
        <h3 className="text-white text-lg font-semibold">Watch the recipe</h3>
        <span className="text-xs uppercase tracking-[.16em] text-teal-200">Video guide</span>
      </div>
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}?rel=0`} title="Recipe video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    </section>
  )
}

export default function RecipeDetail(){
  const { id } = useParams()
  const location = useLocation()
  const [recipe, setRecipe] = useState(null)
  const [favState, setFavState] = useState(null)
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const navigate = useNavigate()
  const fromPlanner = Boolean(location.state?.fromPlanner)
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(fromPlanner ? '/mealplanner' : (location.state?.fromMyRecipes ? '/my-recipes' : (isLoggedIn ? '/dashboard' : '/')))} className="px-3 py-2 bg-white border border-[#cadbd2] text-primary-deep rounded-lg hover:bg-primary-soft/20">← {fromPlanner ? 'Back to planner' : (location.state?.fromMyRecipes ? 'Back to my recipes' : 'Back to recipes')}</button>
      </div>
      <section className="bg-[#fffefa] rounded-2xl border border-[#e0ebe4] shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8">
          <p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-3">Recipe detail</p>
          <h2 className="text-4xl sm:text-6xl leading-tight font-bold text-primary-deep max-w-3xl">{recipe.title}</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">{recipe.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-primary-deep">
            {recipe.author?.name && <span className="px-3 py-1 rounded-full bg-primary-soft/25">By {recipe.author.name}</span>}
            {recipe.cuisine && <span className="px-3 py-1 rounded-full bg-accent-gold/15">{recipe.cuisine}</span>}
            {recipe.cookTime && <span className="px-3 py-1 rounded-full bg-gray-100">{recipe.cookTime} min</span>}
          </div>
        </div>
        <div className="px-5 pb-5 sm:px-8 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recipe.images && recipe.images.map((s,i)=>{
              const src = (s.startsWith && (s.startsWith('http://') || s.startsWith('https://'))) ? s : (`http://localhost:5000${s}`)
              return <img key={i} src={src} alt={`${recipe.title} ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-xl" />
            })}
          </div>
        </div>
      </section>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button onClick={async ()=>{
          try{
            const payload = {}
            if (!isLoggedIn) payload.anonId = getAnonId()
            const res = await api.post(`/api/recipes/${id}/like`, payload)
            // optional refresh
            api.get(`/api/recipes/${id}`).then(r=>setRecipe(r.data))
          }catch(e){ console.error(e) }
        }} className="px-4 py-2 border border-[#cadbd2] rounded-lg bg-white text-primary-deep">♥ {(recipe.likes?recipe.likes.length:0) + (recipe.anonLikes?recipe.anonLikes.length:0)}</button>
        <button disabled={inPlanner} onClick={(e)=>{ e.preventDefault(); const cur = JSON.parse(localStorage.getItem('mealPlannerTemp')||'[]'); const avg = recipe._avg || (recipe.ratings && recipe.ratings.length ? (recipe.ratings.reduce((s,x)=>s+(x.rating||0),0)/recipe.ratings.length) : 0); cur.push({_id: recipe._id, title: recipe.title, images: recipe.images, avg}); localStorage.setItem('mealPlannerTemp', JSON.stringify(cur)); setInPlanner(true); try{ window.dispatchEvent(new Event('mealPlannerUpdated')) }catch(e){}; window.location.href='/mealplanner' }} className={"px-4 py-2 rounded-lg btn-primary " + (inPlanner ? 'opacity-50 cursor-not-allowed' : '')}>{inPlanner ? 'In meal planner' : 'Add to meal planner'}</button>
        <div>
          <button onClick={()=>{ const url = window.location.href; window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(recipe.title)}&url=${encodeURIComponent(url)}`,'_blank') }} className="px-2 py-1 rounded-md bg-primary-soft text-primary-deep border border-primary-deep">Share</button>
        </div>
      </div>
      <VideoEmbed url={recipe.videoUrl} />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[.8fr_1.2fr] gap-5">
        <section className="bg-white rounded-2xl border border-[#e0ebe4] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold text-primary-deep mb-4">Ingredients</h3>
          <ul className="space-y-3">{recipe.ingredients && recipe.ingredients.map((ing,i)=>(<li key={i} className="flex justify-between gap-4 border-b border-gray-100 pb-2"><span>{ing.name}</span><span className="text-gray-500 text-sm">{ing.quantity}</span></li>))}</ul>
        </section>
        <section className="bg-white rounded-2xl border border-[#e0ebe4] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold text-primary-deep mb-4">Method</h3>
          <ol className="list-decimal ml-5 space-y-3 text-gray-700">{recipe.steps && recipe.steps.map((s,i)=>(<li key={i} className="pl-2">{s}</li>))}</ol>
        </section>
      </div>
      <div className="mt-5 flex gap-2">
        {isLoggedIn && <button onClick={toggleFav} className="px-3 py-2 bg-yellow-400 rounded">{favState ? 'Unfavorite' : 'Add to Favorites'}</button>}
        {isOwner && (
          <>
            <Link to={`/edit/${id}`} state={{ fromMyRecipes: Boolean(location.state?.fromMyRecipes) }} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</Link>
            <button onClick={onDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
          </>
        )}
      </div>
      <section className="mt-8 bg-white rounded-2xl border border-[#e0ebe4] p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-2xl font-semibold text-primary-deep mb-1">Reviews</h3>
          <p className="text-sm text-gray-600">Community comments and ratings</p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-primary-soft/15 border border-primary-soft/40 px-4 py-3">
            <span className="text-sm font-semibold text-primary-deep">Recipe rating</span>
            <StarRating recipe={recipe} readOnly={isLoggedIn} />
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-primary-deep mb-3">Comments</h3>
        <div className="space-y-3">
          {recipe.comments && recipe.comments.map(c => (
            <div key={c._id} className="p-3 bg-white rounded shadow-sm">
              <div className="text-sm font-semibold">{(c.user && c.user.name) || c.name || 'Anonymous'}</div>
              <div className="text-sm text-gray-700">{c.text}</div>
            </div>
          ))}
        </div>
        <CommentForm recipeId={id} onAdded={(comm)=>{ setRecipe(prev=>({...prev, comments: (prev.comments||[]).concat(comm)})) }} />
      </section>
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

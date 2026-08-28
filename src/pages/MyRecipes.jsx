import React, { useEffect, useState } from 'react'
import api, { assetUrl } from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function MyRecipes(){
  const [recipes, setRecipes] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    api.get('/api/users/dashboard/me').then(res=>setRecipes(res.data.recipes || [])).catch(()=>setRecipes([]))
  },[])

  const deleteRecipe = async recipe => {
    if (!window.confirm(`Delete ${recipe.title}?`)) return
    setDeleting(recipe._id)
    try {
      await api.delete(`/api/recipes/${recipe._id}`)
      setRecipes(current => current.filter(item => item._id !== recipe._id))
    } catch (err) {
      window.alert(err.response?.data?.error || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  if (recipes === null) return <div>Loading your recipes...</div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={()=>navigate('/dashboard')} className="px-3 py-2 bg-white border border-[#cadbd2] text-primary-deep rounded-lg hover:bg-primary-soft/20">← Back to dashboard</button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div><p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-2">Recipe library</p><h2 className="text-4xl sm:text-5xl font-bold text-primary-deep">Your recipes</h2><p className="mt-2 text-gray-600">Manage every recipe you have created.</p></div>
        <Link to="/new" state={{ fromMyRecipes: true }} className="btn-primary text-center">+ Create recipe</Link>
      </div>
      <div className="overflow-x-auto bg-white rounded-2xl border border-[#e0ebe4] shadow-sm">
        <table className="w-full min-w-[680px] text-left">
          <thead className="bg-[#f1f7f3] text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-4">Recipe</th><th className="px-5 py-4">Cuisine</th><th className="px-5 py-4">Dietary</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {recipes.map(recipe=><tr key={recipe._id} className="hover:bg-[#f8fbf9]">
              <td className="px-5 py-4"><Link to={`/r/${recipe._id}`} state={{ fromMyRecipes: true }} className="flex items-center gap-3"><span className="w-12 h-12 rounded-lg bg-[#e8f0eb] overflow-hidden flex-shrink-0">{recipe.images?.[0] && <img src={assetUrl(recipe.images[0])} alt="" className="w-full h-full object-cover" />}</span><span className="font-semibold text-primary-deep">{recipe.title}</span></Link></td>
              <td className="px-5 py-4 text-sm text-gray-600">{recipe.cuisine || '—'}</td>
              <td className="px-5 py-4"><div className="flex flex-wrap gap-1">{(recipe.dietary || []).map(type=><span key={type} className="px-2 py-1 rounded-full bg-primary-soft/20 text-xs text-primary-deep">{type}</span>)}</div></td>
              <td className="px-5 py-4"><div className="flex justify-end items-center gap-3"><Link to={`/r/${recipe._id}`} state={{ fromMyRecipes: true }} className="text-sm font-semibold text-primary-deep hover:text-accent-gold">View</Link><Link to={`/edit/${recipe._id}`} state={{ fromMyRecipes: true }} className="text-sm font-semibold text-primary-deep hover:text-accent-gold">Edit</Link><button type="button" onClick={()=>deleteRecipe(recipe)} disabled={deleting === recipe._id} className="text-sm font-semibold text-red-700 hover:text-red-900">{deleting === recipe._id ? 'Deleting...' : 'Delete'}</button></div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {recipes.length === 0 && <p className="text-center text-gray-500 mt-8">You have not created any recipes yet.</p>}
    </div>
  )
}

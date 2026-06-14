import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header(){
  const nav = useNavigate()
  const location = useLocation()
  const logout = ()=>{ localStorage.removeItem('token'); nav('/'); }
  const logged = !!localStorage.getItem('token')

  const [q, setQ] = useState('')
  const [ingredient, setIngredient] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [dietary, setDietary] = useState([])
  const [showDietary, setShowDietary] = useState(false)
  const dietaryRef = useRef(null)

  useEffect(()=>{
    const params = new URLSearchParams(location.search)
    setQ(params.get('q') || '')
    setIngredient(params.get('ingredient') || '')
    setCuisine(params.get('cuisine') || '')
    const d = params.get('dietary')
    setDietary(d ? d.split(',') : [])
  },[location.search])

  // close dietary dropdown when clicking outside
  useEffect(()=>{
    function onDocClick(e){
      if (!showDietary) return
      if (dietaryRef.current && !dietaryRef.current.contains(e.target)) setShowDietary(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return ()=>document.removeEventListener('mousedown', onDocClick)
  },[showDietary])

  const onSearch = e => {
    e && e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (ingredient) params.set('ingredient', ingredient)
    if (cuisine) params.set('cuisine', cuisine)
    if (dietary && dietary.length) params.set('dietary', dietary.join(','))
    const qs = params.toString()
    nav('/' + (qs ? `?${qs}` : ''))
  }

  return (
    <header className="bg-white border-b-2 border-primary-deep shadow-sm">
      <div className="max-w-4xl mx-auto p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold"><Link to="/" className="text-primary-deep">Recipe Share</Link></h1>
          <div>
            {logged ? (
              <>
                <Link to="/dashboard" className="mr-4 text-primary-deep">Dashboard</Link>
                <Link to="/profile" className="mr-4 text-primary-deep">Profile</Link>
                <button onClick={logout} className="text-sm text-primary-deep">Logout</button>
              </>
            ) : (
              <>
                <Link to="/mealplanner" className="mr-4 text-primary-deep">My Planner</Link>
                <Link to="/login" className="mr-2 text-primary-deep">Login</Link>
                <Link to="/register" className="text-primary-deep">Register</Link>
              </>
            )}
          </div>
        </div>

        <form onSubmit={onSearch} className="flex gap-2 items-center">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search recipes or titles" className="flex-1 p-3 h-12 border-2 rounded-lg focus:outline-none focus:ring-3 focus:ring-primary-soft border-primary-deep" />
          <input value={ingredient} onChange={e=>setIngredient(e.target.value)} placeholder="Ingredient" className="p-3 border rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-primary-soft" />
          <input value={cuisine} onChange={e=>setCuisine(e.target.value)} placeholder="Cuisine" className="p-3 border rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-primary-soft" />
          <div className="relative">
            <button type="button" onClick={()=>setShowDietary(s=>!s)} className="px-3 py-2 border rounded-md ml-2 text-sm">Dietary</button>
            {showDietary && (
              <div ref={dietaryRef} className="absolute right-0 mt-2 w-56 bg-white border rounded shadow p-3 z-20">
                <div className="grid grid-cols-1 gap-2">
                  {['Dairy-free','Gluten-free','Vegetarian','Vegan'].map(opt=> (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={dietary.includes(opt)} onChange={()=>{
                        const next = dietary.includes(opt) ? dietary.filter(d=>d!==opt) : dietary.concat(opt)
                        setDietary(next)
                      }} />
                      <span>{opt}</span>
                    </label>
                  ))}
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={()=>setShowDietary(false)} className="px-2 py-1 text-sm">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="px-3 py-2 btn-primary">Filter</button>
          {logged && <Link to="/new" className="ml-2 px-3 py-2 bg-accent-gold text-white rounded-md">New</Link>}
        </form>
      </div>
    </header>
  )
}

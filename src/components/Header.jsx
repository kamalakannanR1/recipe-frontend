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

  const clearSearch = () => {
    setQ('')
    setIngredient('')
    setCuisine('')
    setDietary([])
    setShowDietary(false)
    nav('/')
  }

  const onQueryChange = value => {
    setQ(value)
    if (!value && !ingredient && !cuisine && !dietary.length) nav('/')
  }

  return (
    <header className="bg-[#fffefa]/95 border-b border-[#dce7df] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold"><Link to="/" className="text-primary-deep">Recipe Share<span className="text-accent-gold">.</span></Link></h1>
          <div className="flex items-center gap-3 text-sm sm:text-base">
            {!logged && !['/dashboard', '/profile'].includes(location.pathname) && <Link to="/" className="text-primary-deep hover:text-accent-gold">Home</Link>}
            {logged ? (
              <>
                <Link to="/mealplanner" className="text-primary-deep hover:text-accent-gold">Planner</Link>
                <Link to="/dashboard" className="text-primary-deep hover:text-accent-gold">Dashboard</Link>
                <Link to="/profile" className="text-primary-deep hover:text-accent-gold">Profile</Link>
                <button onClick={logout} className="text-primary-deep hover:text-red-700">Logout</button>
              </>
            ) : (
              <>
                <Link to="/mealplanner" className="hidden sm:inline text-primary-deep hover:text-accent-gold">My Planner</Link>
                <Link to="/login" className="text-primary-deep hover:text-accent-gold">Login</Link>
                <Link to="/register" className="px-3 py-2 rounded-md bg-primary-deep text-white hover:bg-primary-hover">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className={`transition-all duration-200 ease-out ${['/mealplanner', '/login', '/register', '/dashboard', '/profile'].includes(location.pathname) ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[600px] opacity-100 overflow-visible'}`}>
        {!['/mealplanner', '/login', '/register', '/dashboard', '/profile'].includes(location.pathname) && <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-[minmax(260px,2fr)_minmax(150px,1fr)_minmax(130px,.9fr)_auto_auto] gap-2 items-center bg-[#f1f7f3] p-2 rounded-2xl border border-[#dce9e0]">
          <input value={q} onChange={e=>onQueryChange(e.target.value)} placeholder="Search recipes or titles" className="p-3 h-12 border border-[#cadbd2] rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-soft/40" />
          <input value={ingredient} onChange={e=>setIngredient(e.target.value)} placeholder="Ingredient" className="p-3 h-12 border border-[#cadbd2] rounded-xl w-full" />
          <input value={cuisine} onChange={e=>setCuisine(e.target.value)} placeholder="Cuisine" className="p-3 h-12 border border-[#cadbd2] rounded-xl w-full" />
          <div className="relative">
            <button type="button" onClick={()=>setShowDietary(s=>!s)} className="px-3 h-12 border border-[#cadbd2] rounded-xl text-sm w-full bg-white">Dietary</button>
            {showDietary && (
              <div ref={dietaryRef} className="absolute right-0 mt-2 w-56 bg-white border border-[#cadbd2] rounded-xl shadow-xl p-3 z-20">
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
          <div className="flex gap-2">
            <button type="submit" className="px-5 h-12 btn-primary rounded-xl">Search</button>
            <button type="button" onClick={clearSearch} className="px-4 h-12 border border-[#cadbd2] rounded-xl text-primary-deep bg-white hover:bg-primary-soft/20">Clear</button>
          </div>
        </form>}
        </div>
      </div>
    </header>
  )
}

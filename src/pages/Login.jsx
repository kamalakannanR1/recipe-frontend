import React, { useState } from 'react'
import api from '../api'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state && location.state.from) || '/'
  const onSubmit = async e => {
    e.preventDefault()
    try {
      const res = await api.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      nav(from, { replace: true })
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed')
    }
  }
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="card p-6">
        <h2 className="text-2xl mb-4 font-semibold text-primary-deep">Sign in to Recipe Share</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" className="mt-1 block w-full p-3 border rounded border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-soft" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="mt-1 block w-full p-3 border rounded border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-soft" />
          </div>
          <div className="flex items-center justify-between">
            <button className="btn-primary">Login</button>
            <a href="/register" className="text-sm text-primary-deep">Create account</a>
          </div>
        </form>
      </div>
    </div>
  )
}

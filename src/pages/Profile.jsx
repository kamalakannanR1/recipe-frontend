import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(()=>{ api.get('/api/users').then(r=>{ setUser(r.data); setName(r.data.name); setBio(r.data.bio||'') }).catch(()=>{}); },[])

  const save = async e => {
    e.preventDefault()
    await api.put('/api/users', { name, bio })
    const res = await api.get('/api/users')
    setUser(res.data)
    alert('Profile updated')
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return alert('Select a file')
    const fd = new FormData();
    fd.append('avatar', avatarFile)
    const res = await api.post('/api/users/avatar', fd)
    setUser(res.data)
    alert('Avatar uploaded')
  }

  if (!user) return <div>Loading profile...</div>
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl mb-4">Your Profile</h2>
      <div className="mb-4">
        {user.avatarUrl ? <img src={`http://localhost:5000${user.avatarUrl}`} alt="avatar" className="w-24 h-24 rounded-full" /> : <div className="w-24 h-24 bg-gray-200 rounded-full"/>}
      </div>
      <form onSubmit={save} className="space-y-4">
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
        <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full p-2 border rounded" />
        <div className="flex items-center gap-2">
          <input type="file" onChange={e=>setAvatarFile(e.target.files[0])} />
          <button type="button" onClick={uploadAvatar} className="px-3 py-2 bg-blue-600 text-white rounded">Upload Avatar</button>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
      </form>
    </div>
  )
}

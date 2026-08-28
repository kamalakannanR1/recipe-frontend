import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

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

  const resetPassword = async e => {
    e.preventDefault()
    try {
      await api.put('/api/auth/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setPasswordMessage('Password updated successfully')
    } catch (err) { setPasswordMessage(err.response?.data?.error || 'Password update failed') }
  }

  if (!user) return <div>Loading profile...</div>
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={()=>window.location.href='/dashboard'} className="px-3 py-2 bg-white border border-[#cadbd2] text-primary-deep rounded-lg hover:bg-primary-soft/20">← Back to dashboard</button>
      </div>
      <div className="mb-6"><p className="uppercase tracking-[.2em] text-xs font-bold text-accent-gold mb-2">Your account</p><h2 className="text-4xl sm:text-5xl font-bold text-primary-deep">Profile settings</h2><p className="mt-2 text-gray-600">Shape your public profile and keep your account secure.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-[.8fr_1.2fr] gap-5">
      <section className="bg-primary-deep text-white rounded-2xl p-6 shadow-sm">
        {user.avatarUrl ? <img src={`http://localhost:5000${user.avatarUrl}`} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white/30" /> : <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center text-3xl">{user.name?.[0]?.toUpperCase()}</div>}
        <h3 className="text-2xl font-semibold mt-5">{user.name}</h3>
        <p className="text-teal-100 mt-1 break-all">{user.email}</p>
        <div className="mt-6 pt-5 border-t border-white/20 text-sm text-teal-100">Your email is used for account access and cannot be changed here.</div>
      </section>
      <section className="bg-[#fffefa] rounded-2xl border border-[#e0ebe4] shadow-sm p-5 sm:p-8">
      <form onSubmit={save} className="space-y-4">
        <h3 className="text-2xl font-semibold text-primary-deep">Public profile</h3>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
        <textarea value={bio} onChange={e=>setBio(e.target.value)} className="w-full p-2 border rounded" />
        <div className="flex items-center gap-2">
          <input type="file" onChange={e=>setAvatarFile(e.target.files[0])} />
          <button type="button" onClick={uploadAvatar} className="px-3 py-2 bg-primary-deep text-white rounded-lg">Upload avatar</button>
        </div>
        <button className="btn-primary">Save profile</button>
      </form>
      <div className="mt-10 pt-7 border-t border-[#e0ebe4]">
        <h3 className="text-2xl font-semibold text-primary-deep">Reset password</h3>
        <p className="text-sm text-gray-600 mt-1 mb-4">Confirm your current password before choosing a new one.</p>
        <form onSubmit={resetPassword} className="space-y-3">
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} placeholder="Current password" required />
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password (6+ characters)" minLength="6" required />
          <button className="px-4 py-2 border border-primary-deep text-primary-deep rounded-lg hover:bg-primary-soft/20">Update password</button>
          {passwordMessage && <p className="text-sm text-primary-deep">{passwordMessage}</p>}
        </form>
      </div>
      </section>
      </div>
    </div>
  )
}

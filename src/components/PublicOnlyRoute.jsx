import React from 'react'
import { Navigate } from 'react-router-dom'

export default function PublicOnlyRoute({ children }){
  const logged = Boolean(localStorage.getItem('token'))
  if (logged) return <Navigate to="/dashboard" replace />
  return children
}

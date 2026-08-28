import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NewRecipe from './pages/NewRecipe'
import Login from './pages/Login'
import Register from './pages/Register'
import RecipeDetail from './pages/RecipeDetail'
import Search from './pages/Search'
import MealPlanner from './pages/MealPlanner'
import Header from './components/Header'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import EditRecipe from './pages/EditRecipe'
import MyRecipes from './pages/MyRecipes'
import SharedMealPlan from './pages/SharedMealPlan'

export default function App(){
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/new" element={<ProtectedRoute><NewRecipe/></ProtectedRoute>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/r/:id" element={<RecipeDetail/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/mealplanner" element={<MealPlanner/>} />
          <Route path="/mealplans/shared/:id" element={<SharedMealPlan/>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes/></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><EditRecipe/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

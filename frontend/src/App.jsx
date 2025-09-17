import React, {useEffect, useState} from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Students from './pages/Students'
import Programs from './pages/Programs'
import Colleges from './pages/Colleges'

export default function App(){


  return (
    <div className="app">
      <Sidebar />
      <main className="content-wrap">
        <div className="card">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/students" element={<Students/>} />
            <Route path="/programs" element={<Programs/>} />
            <Route path="/colleges" element={<Colleges/>} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

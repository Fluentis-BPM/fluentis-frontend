import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { StrictMode } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode> 
)

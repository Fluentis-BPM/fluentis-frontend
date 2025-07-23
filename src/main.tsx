<<<<<<< HEAD
import React from 'react'
=======

import { StrictMode } from 'react'
>>>>>>> 2371a1cc71030c0836d5bc2b3e11a818e4855219
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

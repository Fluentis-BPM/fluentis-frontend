import type React from "react"
import { AppRouteObject } from '../types/router';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import PruebaPage from '@/pages/private/Prueba';



export const privateRoutes: AppRouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <PruebaPage />
      </PrivateRoute>
    ),
    children: [
        {

        }
    ]
  }
];
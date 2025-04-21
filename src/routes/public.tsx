
import type React from "react"
import LandingPage from '../pages/static/LandingPage';
import { AppRouteObject } from './router';

export const publicRoutes: AppRouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '*',
    element: <LandingPage />, 
  }
];
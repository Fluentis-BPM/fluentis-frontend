
import type React from "react"
import LandingPage from '../pages/static/LandingPage';
import { AppRouteObject } from "@/types/router";


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
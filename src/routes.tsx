import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";



export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/auth/login",
    element: <div>Login</div>,
  },
  {
    path: "/users",
    element: <PrivateRoute element={<div>a</div>} />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
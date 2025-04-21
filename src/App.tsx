import type React from "react"
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './routes/public';


const router = createBrowserRouter([...publicRoutes]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
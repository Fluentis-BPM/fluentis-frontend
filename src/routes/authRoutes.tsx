import { PrivateRoute } from "@/components/auth/PrivateRoute";
import PruebaPage from "@/pages/private/Prueba";


export const authRoutes = [
    { path: '/dashboard', element: <PrivateRoute><PruebaPage/></PrivateRoute> },
];
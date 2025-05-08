import { PrivateRoute } from "@/components/auth/PrivateRoute";
import PruebaPage from "@/pages/private/Prueba";


export const privateRoutes = [
    { path: '/dashboard', element: <PrivateRoute><PruebaPage/></PrivateRoute> },
];
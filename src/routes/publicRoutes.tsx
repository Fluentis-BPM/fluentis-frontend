import LoginPage from "@/pages/auth/LoginPage";
import LandingPage from "@/pages/home/LandingPage";
import UsersPageTest from "@/pages/equipos/UsersPageTest";
import CreateUserPage from "@/pages/equipos/CreateUserPage";


export const publicRoutes = [
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <LoginPage /> },
    // Rutas temporales para pruebas (sin autenticación)
    { path: '/test/usuarios', element: <UsersPageTest /> },
    { path: '/test/usuarios/crear', element: <CreateUserPage /> },
];
import LoginPage from "@/pages/auth/LoginPage";
import LandingPage from "@/pages/home/LandingPage";


export const publicRoutes = [
    { path: '/', element: <LandingPage /> },
    { path: '/login', element: <LoginPage /> },
];
export interface User {
    oid: string;
    email: string;
    nombre: string;
    cargo: string;
    departamento: string;
    rol: "Miembro" | "Administrador" | "Visualizador" | "Visualizadordepartamental";
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}


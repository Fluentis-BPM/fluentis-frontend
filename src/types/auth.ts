export interface User {
    oid: string;
    Email: string;
    Nombre: string;
    Cargo: string;
    Departamento: string;
    Rol: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}


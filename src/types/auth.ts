export interface User {
    oid: string;
    email: string;
    nombre: string;
    cargoNombre: string;
    departamentoNombre: string;
    rolNombre: "Miembro" | "Administrador" | "Visualizador" | "Visualizador Departamental";
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}


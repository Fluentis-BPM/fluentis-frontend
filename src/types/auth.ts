export interface User {
    oid: string | number;
    email: string;
    nombre: string;
    cargoNombre: string;
    departamentoNombre: string;
    rolNombre: "Miembro" | "Administrador" | "Visualizador" | "Visualizador Departamental";
    // Legacy properties for backward compatibility
    departamento?: string;
    rol?: "Miembro" | "Administrador" | "Visualizador" | "Visualizadordepartamental";
    cargo?: string;
    name?: string; // For PrivateLayout compatibility
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    isAuthenticated: boolean;
    token: string | null; // Legacy property for backward compatibility
}


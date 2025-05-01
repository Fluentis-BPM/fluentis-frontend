export interface User {
    name: string;
    email: string;
    jobTitle?: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

export interface FetchUserProfileResponse {
    IdUsuario: number;
    Nombre: string;
    Email: string;
    JobTitle?: string;
    Role: string;
}

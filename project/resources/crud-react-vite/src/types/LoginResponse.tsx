interface LoginResponse {
    token: string;
    user?: { id: number; name: string; email: string };
}
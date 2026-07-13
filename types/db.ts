export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    last_login: string | null;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginCredentials, SignupCredentials, AuthResponse } from '@/types/auth';
const API_BASE_URL = 'https://localhost:3000';
export async function login(credentials: LoginCredentials): Promise<any> {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
}
export async function signup(credentials: SignupCredentials): Promise<any> {
    const response = await fetch('http://localhost:3000/user/register-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for HttpOnly cookies
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
    }

    const data = await response.payload.json();
    console.log('✅ Parsed response data:', data);
    return data;
}

export async function logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }
}

export async function fetchCurrentUser(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to get current user');
    }

    return response.json();
}
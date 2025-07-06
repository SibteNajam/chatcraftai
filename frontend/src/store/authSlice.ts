// frontend/src/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, SignupCredentials, User } from '@/types/auth';
import { login, signup, logout, fetchCurrentUser } from '@/lib/auth';

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await login(credentials);
            console.log(' Login response in slice:', response);

            // Store the token if you need it later
            if (response.payload && response.payload.token) {
                // You might want to store the token in localStorage or handle it differently
                console.log(' Received token:', response.payload.token);
            }

            return response.user; // Return the user object for state
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signup',
    async (credentials: SignupCredentials, { rejectWithValue }) => {
        try {
            const response = await signup(credentials);
            console.log('Signup response in slice:', response);
            if (response.status === 'Success' && response.data && response.data.user) {
                return response.data.user; // Return the user object
            } else {
                // If response structure is different, adapt accordingly
                return response.user || response;
            }
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Signup failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            logout();
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchCurrentUser();
            return response.user;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to get user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Signup
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isLoading = false;
                state.error = null;
            })
            // Get current user
            .addCase(getCurrentUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;
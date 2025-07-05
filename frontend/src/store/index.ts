// frontend/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // write code in reducer after this

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

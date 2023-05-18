// WARNING: This file includes the "@formio/react" package,
// which can only be used in the browser (no SSR support).
import { auth } from "@formio/react";
import { configureStore } from "@reduxjs/toolkit";
import { User } from "./users";

/**
 * Redux state of the authentication module of Formio.
 */
export type AuthState = {
    init: boolean;
    isActive: boolean;
    user: null | User;
    authenticated: boolean;
    submissionAccess: unknown;
    formAccess: unknown;
    projectAccess: unknown;
    roles: {
        [key: string]: {
            _id: string;
            title: string;
            admin: boolean;
            default: boolean;
        };
    };
    is: unknown;
    error: string;
};

/**
 * Redux store of the application.
 */
const store = configureStore({
    reducer: {
        auth: auth({}) as (
            state: AuthState | undefined,
            action: any
        ) => AuthState,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

import { auth } from "$lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { writable } from "svelte/store";

export const authStore = writable({
    user: null,
    loading: true,
    data: {},
    error: null
})

export const authHandles = {
    signup: async (email, password) => {
        try {
            console.log("Signup attempt with email:", email);
            authStore.update(curr => ({ ...curr, loading: true, error: null }));
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Signup successful:", userCredential.user);
            authStore.update(curr => ({ ...curr, user: userCredential.user, loading: false }));
        } catch (error) {
            console.error("Signup error:", error);
            authStore.update(curr => ({ ...curr, error: error.message, loading: false }));
            throw error;
        }
    },
    login: async (email, password) => {
        try {
            console.log("Login attempt with email:", email);
            if (!email) {
                throw new Error("Email is required");
            }
            if (!password) {
                throw new Error("Password is required");
            }
            authStore.update(curr => ({ ...curr, loading: true, error: null }));
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful:", userCredential.user);
            authStore.update(curr => ({ ...curr, user: userCredential.user, loading: false }));
        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = error.message;
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with this email address.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            }
            authStore.update(curr => ({ ...curr, error: errorMessage, loading: false }));
            throw error;
        }
    },
    logout: async () => {
        try {
            await signOut(auth);
            authStore.update(curr => ({ ...curr, user: null, data: {}, loading: false }));
        } catch (error) {
            console.error("Logout error:", error);
            authStore.update(curr => ({ ...curr, error: error.message }));
            throw error;
        }
    }
}
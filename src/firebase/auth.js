import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut 
} from 'firebase/auth';
import { auth } from './firebase';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createOrUpdateUser } from '../services/api';

// Save user data to Firestore
const saveUserToFirestore = async (user) => {
    try {
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving user to Firestore:', error);
    }
};

export const doCreateUserWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(userCredential.user);
        return userCredential.user;
    } catch (error) {
        throw new Error(getErrorMessage(error.code));
    }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
    try {
        console.log('Attempting to sign in with:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Sign in successful:', userCredential.user);
        // Save user data to MongoDB
        await createOrUpdateUser({
            firebaseUid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL
        });
        return userCredential.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw new Error(getErrorMessage(error.code));
    }
};

export const doSignInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        console.log('Sign in successful:', userCredential.user);
        // Save user data to MongoDB
        await createOrUpdateUser({
            firebaseUid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL
        });
        return userCredential.user;
    } catch (error) {
        throw new Error(getErrorMessage(error.code));
    }
};

export const doSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(getErrorMessage(error.code));
    }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please use a different email or try logging in.';
        case 'auth/invalid-email':
            return 'Invalid email address. Please check your email format.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled. Please contact support.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use a stronger password.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
            return 'No account found with this email. Please sign up first.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        default:
            return 'An error occurred. Please try again.';
    }
};
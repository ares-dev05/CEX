import  firebase from 'firebase/app';
import "firebase/auth";
import 'firebase/firestore';

const config = firebase.initializeApp({
    apiKey: "AIzaSyAEXYg2O-UfDGsbbzJZHYrIP8qIjPpi5qo",
    authDomain: "stocksfc-auth.firebaseapp.com",
    databaseURL: "https://stocksfc-auth-default-rtdb.firebaseio.com",
    projectId: "stocksfc-auth",
    storageBucket: "stocksfc-auth.appspot.com",
    messagingSenderId: "701392533362",
    appId: "1:701392533362:web:757c30ef4da94db31a0feb",
    measurementId: "G-QJG2HDSW9X"
});


const db = config.firestore();
export { db };

//
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
export const OAuthProvider = firebase.auth.OAuthProvider;


export const auth = config.auth()
export default config
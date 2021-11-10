import { auth, GoogleAuthProvider, OAuthProvider } from "./firebase"; //importing the previously instatiated object from the firebase.js config file
import { Link } from "react-router-dom";

//## below the authentication functions ##


export const doSignInWithGoogle = () =>
{
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  provider.setCustomParameters({
    'login_hint': 'user@example.com'
  });
  auth.signInWithPopup(provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // ...
    console.log('credential---', credential);
    console.log('token---', token);
    console.log('user---', user);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The AuthCredential type that was used.
    console.log(error);
    // const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}

export const doSignInWithMicrosoft = () =>
{
  const provider = new OAuthProvider('microsoft.com');
  provider.setCustomParameters({
    // Force re-consent.
    prompt: 'consent',
    // Target specific email with login hint.
    login_hint: 'user@firstadd.onmicrosoft.com'
  });
  provider.addScope('mail.read');
  provider.addScope('calendars.read');
  auth.signInWithPopup(provider)
  .then((result) => {
    // User is signed in.
    // IdP data available in result.additionalUserInfo.profile.

    // Get the OAuth access token and ID Token
    const credential = OAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    const idToken = credential.idToken;
  })
  .catch((error) => {
    // Handle error.
  });

}

export const doSignInWithYahoo = () =>
{
  const provider = new OAuthProvider('yahoo.com');
  provider.setCustomParameters({
    // Prompt user to re-authenticate to Yahoo.
    prompt: 'login',
    // Localize to French.
    language: 'fr'
  });  
  // Request access to Yahoo Mail API.
  provider.addScope('mail-r');
  // Request read/write access to user contacts.
  // This must be preconfigured in the app's API permissions.
  provider.addScope('sdct-w');
  auth.signInWithPopup(provider)
  .then((result) => {
    // IdP data available in result.additionalUserInfo.profile
    // ...

    // Yahoo OAuth access token and ID token can be retrieved by calling:
    const credential = OAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;
    const idToken = credential.idToken;
  })
  .catch((error) => {
    // Handle error.
  });

}

//sign up
export const doCreateUserWithEmailAndPassword = (email, password) =>
  auth.createUserWithEmailAndPassword(email, password);

//sign in
export const doSignInWithEmailAndPassword = (email, password) =>
  auth.signInWithEmailAndPassword(email, password);

//sign out
export const doSignOut = () => auth.signOut().then(()=>{
  window.location.reload();
})

//## below are two more functions, for resetting or changing passwords ##

//password reset
export const doPasswordReset = email => auth.sendPasswordResetEmail(email);

//password change
export const doPasswordChange = password =>
  auth.currentUser.updatePassword(password);

//#### for
//     facebook #####
// export const doFacebookSignIn = () => auth.signInWithPopup(facebookProvider);

import React, { useState,useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "./Auth.css";
import { auth, googleProvider } from "../firebase";
import Cookies from "js-cookie"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";



function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(true); 
 
 useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (cookieUser) {
      setUser(JSON.parse(cookieUser));
      onAuthSuccess();
    }
  }, [onAuthSuccess]);


  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
      const userdata=  userCred.user;
      setUser(userdata);
    Cookies.set("user", JSON.stringify( userdata), { expires: 7 });
        setMessage("Signed up successfully!");
        onAuthSuccess();
      })
      .catch((err) => setMessage(err.message));
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
      const userdata=  userCred.user;
      setUser(userdata);
    Cookies.set("user", JSON.stringify( userdata), { expires: 7 });
        setMessage("Signed up successfully!");
        setMessage("Signed in successfully!");
        onAuthSuccess();
      })
      .catch((err) => setMessage(err.message));
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const userdata=  result.user;
      setUser(userdata);
    Cookies.set("user", JSON.stringify( userdata), { expires: 7 });
    setMessage("Signed in with Google successfully!");
        onAuthSuccess();
      })
      .catch((error) => {
        setMessage(error.message);
      });
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
          setUser(null);
      Cookies.remove("user");
      setMessage("Logged out!");
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-heading">Welcome to Hrushi AI✨</h2>

        {!user && (
          <>
            <input
              type="email"
              className="auth-input"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {!user ? (
          <>
            {isSignUp ? (
              <button className="auth-button" onClick={handleSignUp}>
                Sign Up
              </button>
            ) : (
              <button className="auth-button" onClick={handleSignIn}>
                Sign In
              </button>
            )}
            <button className="auth-button google-button" onClick={handleGoogleLogin}>
              Sign in with Google
            </button>
            <p style={{ fontSize: "14px" }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </>
        ) : (
          <button className="auth-button logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}

        <p className="auth-message">{message}</p>
      </div>
    </div>
  );
}

export default Auth;

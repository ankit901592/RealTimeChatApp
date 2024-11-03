// Import the functions you need from the SDKs you need
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  setDoc,
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
} from "firebase/firestore"; // Fix here
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB98yPuOUr6LXeeli1nnL3a2aCpZGmXqBg",
  authDomain: "chatapp-3b4c7.firebaseapp.com",
  projectId: "chatapp-3b4c7",
  storageBucket: "chatapp-3b4c7.appspot.com",
  messagingSenderId: "53422354360",
  appId: "1:53422354360:web:d6e2cf19f8c1406698294d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Fix here

const signup = async (userName, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      userName: userName.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using ChatApp",
      lastSeen: Date.now(),
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
    toast.success("Signup succesFully");
  } catch (err) {
    console.log(err);
    toast.error(err.code.split("/")[1].split("-").join(""));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("login succesFully");
  } catch (err) {
    console.log(err);
    toast.error(err.code.split("/")[1].split("-").join(""));
  }
};

const logout = async () => {
  try {
    toast.success("logout succesFully");
    await signOut(auth);
  } catch (err) {
    console.log(err);
    toast.error(err.code.split("/")[1].split("-").join(""));
  }
};

const forgotPassword = async (email) => {
  if (!email) {
    toast.error("Enter your Email");
    return null;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email sent");
      return true;
    } else {
      toast.error("Email doesn't exist");
      return false;
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to send reset email. Please try again.");
    return false;
  }
};

export { signup, login, logout, auth, db ,forgotPassword};

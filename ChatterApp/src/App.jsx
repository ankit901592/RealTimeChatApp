import React, { useContext, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/login";
import Chats from "./pages/chats/Chats";
import ProfileUpdate from "./pages/ProfileUpdate/profilupdate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";
const App = () => {
  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate("/chat");
        await loadUserData(user.uid);
      } else {
        navigate("/");
      }
    });
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chats />} />
        <Route path="/profile" element={<ProfileUpdate />} />
      </Routes>
    </>
  );
};

export default App;

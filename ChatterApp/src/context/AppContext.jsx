import { useEffect, useState } from "react";
import { createContext } from "react";
import { auth, db } from "../config/firebase";
import { getDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatuser] = useState(null);
  const [chatVisible, setChatVisbile] = useState(false);

  const navigate = useNavigate();

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      setUserData(userData);

      if (userData) {
        if (userData.avatar && userData.name) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }

        // Set lastSeen on user load and periodically if chatUser is active
        await updateDoc(userRef, { lastSeen: Date.now() });
        const intervalId = setInterval(async () => {
          if (auth.chatUser) {
            await updateDoc(userRef, { lastSeen: Date.now() });
          }
        }, 6000);

        // Clear interval when component unmounts
        return () => clearInterval(intervalId);
      }
    } catch (err) {
      console.log("Error loading user data:", err);
    }
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        if (res.exists()) {
          // console.log("Firestore snapshot data:", res.data());
          const chatItem = res.data().chatsData || [];
          // console.log(res.data());

          const tempData = [];

          for (const item of chatItem) {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              tempData.push({ ...item, userData });
            }
          }

          setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
          // console.log("Updated chatData:", tempData);
        } else {
          console.log("No chat data found for user.");
          setChatData([]); // Set an empty array if no data exists
        }
      });

      return () => unSub();
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatuser,
    chatVisible,
    setChatVisbile,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;

import React, { useContext, useEffect, useState } from "react";
import "./leftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase"; // Import Firestore instance
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

// LeftSidebar component for navigation, search, and displaying a list of friends
const LeftSidebar = () => {
  const navigate = useNavigate(); // Hook for navigating to different routes
  const {
    userData,
    chatData,
    chatUser,
    setChatuser,
    messagesId,
    setMessagesId,
    chatVisible,
    setChatVisbile,
  } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Handler function to search for a user based on input
  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim().toLowerCase();
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("userName", "==", input));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          // console.log(querySnap.docs[0].data());
          let userExist = false;
          chatData.map(() => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const addChat = async () => {
    if (!user) return; // Check if user is defined before proceeding

    const messageRef = collection(db, "messages");
    const chatRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messageRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      const chatData = {
        messageId: newMessageRef.id,
        lastMessage: "",
        updatedAt: Date.now(),
        messageSeen: true,
      };

      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({ ...chatData, rId: userData.id }),
      });
      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({ ...chatData, rId: user.id }),
      });

const uSnap=await getDoc(doc(db," users",user.id))
const uData=uSnap.data
setChat({
  messagesId:newMessageRef.id,
  lastMessage:"",
  rId:user.id,
  updatedAt:Date.now(),
  messageSeen:true,
  userData:uData
})
setShowSearch(false)
setChatVisbile(true)

    } catch (err) {
      console.error(err);
      toast.error("Failed to add chat: " + err.message);
    }
  };
  const setChat = async (item) => {
    try {
      console.log(item);
      setMessagesId(item.messageId);
      setChatuser(item);
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapShot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapShot.data();
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });
      setChatVisbile(true);
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(()=>{
    const updateChatUserData=async()=>{
if(chatData){
  const useRef=doc(db,"users",chatUser.userData.id);
  const userSnap=await getDoc(useRef);
  const userData=userSnap.data();
  setChatuser(prev=>({...prev,userData:userData}))
}
    }
    updateChatUserData()

  },[chatData])

  console.log("chatData in LeftSidebar:", chatData);
  return (
    <div className={`ls  ${chatVisible ? "hidden" : " "}`}>
      {/* Top section with logo, menu, and search bar */}
      <div className="ls-top">
        {/* Logo and navigation menu */}
        <div className="ls-nav">
          <img className="logo" src={assets.logo} alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu Icon" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>EditProfile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        {/* Search bar */}
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search Icon" />
          <input
            onChange={inputHandler} // Handle input change for search functionality
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>

      {/* Friends list section */}
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          // Create an array of 12 empty items
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              {" "}
              {/* Display each friend's profile */}
              <img src={item.userData.avatar} alt="Profile" />
              <div>
                <p>{item.userData.name}</p> {/* Example name */}
                <span>{item.lastMessage}</span> {/* Example status/message */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;

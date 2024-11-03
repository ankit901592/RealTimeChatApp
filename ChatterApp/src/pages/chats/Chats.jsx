import React, { useContext, useEffect, useState } from "react";
import "./Chats.css";
import LeftSidebar from "../../components/leftSidebar/LeftSidebar";
import RightSidebar from "../../components/rightSidebar/RightSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import { AppContext } from "../../context/AppContext";
const Chats = () => {
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="chat-container">
          <LeftSidebar />
          <ChatBox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chats;

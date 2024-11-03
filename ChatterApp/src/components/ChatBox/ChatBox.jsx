import React, { useContext, useEffect, useState } from "react";
import "./Chatbox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/Upload";
const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisbile,
  } = useContext(AppContext);

  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        // Add message to messages document
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        // Update each user's chat document with the latest message details
        const userIDs = [chatUser.rId, userData.id];
        await Promise.all(
          userIDs.map(async (id) => {
            const userChatsRef = doc(db, "chats", id);
            const userChatsSnapShot = await getDoc(userChatsRef);

            if (userChatsSnapShot.exists()) {
              const userChatData = userChatsSnapShot.data();
              const chatIndex = userChatData.chatsData.findIndex(
                (c) => c.messageId === messagesId
              );

              if (chatIndex !== -1) {
                const updatedChatData = {
                  ...userChatData.chatsData[chatIndex],
                };
                updatedChatData.lastMessage = input.slice(0, 30);
                updatedChatData.updatedAt = Date.now();
                if (updatedChatData.rId === userData.id) {
                  updatedChatData.messageSeen = false;
                }

                // Update the chatsData array
                userChatData.chatsData[chatIndex] = updatedChatData;
                await updateDoc(userChatsRef, {
                  chatsData: userChatData.chatsData,
                });
              }
            }
          })
        );
      }
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }

    // Clear the input field
    setInput("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };


  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        await Promise.all(
          userIDs.map(async (id) => {
            const userChatsRef = doc(db, "chats", id);
            const userChatsSnapShot = await getDoc(userChatsRef);

            if (userChatsSnapShot.exists()) {
              const userChatData = userChatsSnapShot.data();
              const chatIndex = userChatData.chatsData.findIndex(
                (c) => c.messageId === messagesId
              );

              if (chatIndex !== -1) {
                const updatedChatData = {
                  ...userChatData.chatsData[chatIndex],
                };
                updatedChatData.lastMessage = "Image";
                updatedChatData.updatedAt = Date.now();
                if (updatedChatData.rId === userData.id) {
                  updatedChatData.messageSeen = false;
                }

                // Update the chatsData array
                userChatData.chatsData[chatIndex] = updatedChatData;
                await updateDoc(userChatsRef, {
                  chatsData: userChatData.chatsData,
                });
              }
            }
          })
        );
      }
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  const convertTimeStamp = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + "PM";
    } else {
      return hour + ":" + minute + "AM";
    }
  };

  useEffect(() => {
    if (messagesId) {
      const docRef = doc(db, "messages", messagesId);
      const unSub = onSnapshot(docRef, (res) => {
        setMessages(res.data().messages.reverse());
        // console.log(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);
  console.log(chatVisible);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}
        </p>
        <img src={assets.help_icon} alt="" />
        <img onClick={()=>setChatVisbile(false)} src={assets.arrow_icon} className="arrow" alt="" />
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            {msg["image"] ? (
              <img className="msg-image" src={msg.image} alt="" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Send a Message"
        />
        <input
          onChange={sendImage}
          type="file"
          name=""
          id="image"
          accept="image/png,image/jpg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"} `}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat Any Time Any Where</p>
    </div>
  );
};

export default ChatBox;

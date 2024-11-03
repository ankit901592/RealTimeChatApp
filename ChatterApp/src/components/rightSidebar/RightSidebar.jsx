import React, { useContext, useEffect, useState } from "react";
import "./RightSidebar.css";
import assets from "../../assets/assets";
import { logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    let TempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        TempVar.push(msg.image);
      }
    });

    setMsgImages(TempVar);
  }, [messages]);

  return chatUser ? (
    <div className="rs">
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img src={assets.green_dot} className="dot" alt="" />
          ) : null}
          {chatUser.userData.name}
        </h3>
        <p>{chatUser.userData.bio}</p> 
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, indx) => (
            <img key={indx} src={url} alt="" onClick={() => window.open(url)} />
          ))}
        </div>
        <button onClick={() => logout()}>Logout</button>
      </div>
    </div>
  ) : (
    <div className="rs rs-media">
      <button onClick={() => logout()}>LogOut</button>
    </div>
  );
};

export default RightSidebar;

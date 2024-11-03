import React, { useContext, useEffect, useState } from "react";
import "./Profileupdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/Upload";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState();
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture");
        return;
      }

      const docRef = doc(db, "users", uid);
      let imgUrl = prevImage;

      if (image) {
        imgUrl = await upload(image);
        setPrevImage(imgUrl);
      }

      await updateDoc(docRef, { avatar: imgUrl, bio, name });
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      toast.success("Profile updated successfully!");
      navigate("/chat");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPrevImage(data.avatar || "");
        }
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={updateProfile}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={imagePreviewUrl || prevImage || assets.avatar_icon}
              alt="Profile"
            />
            Upload profile image
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Your Name"
            required
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio"
            required
          ></textarea>
          <button type="submit">Save</button>
        </form>

        <img
          className="profile-pic"
          src={imagePreviewUrl || prevImage || assets.logo_icon}
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;

import React, { useState } from "react";
import assets from "../../assets/assets";
import "./Login.css";
import { signup, login, forgotPassword } from "../../config/firebase";
const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currentState == "Sign Up") {
      signup(username, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <img src={assets.logo_big} alt="" className="logo" />
      <form onSubmit={onSubmitHandler} className="login-form">
        <h2>{currentState}</h2>
        {currentState === "Log in" ? null : (
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="username"
            className="form-input"
            required
          />
        )}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder="email"
          className="form-input"
          required
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="form-input"
          placeholder="password"
          required
        />
        <button type="submit">
          {currentState == "Sign Up" ? "Create Account" : "Log in"}
        </button>
        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the term of use & privacy policy</p>
        </div>
        <div className="login-forgot">
          {currentState == "Log in" ? (
            <p className="login-toggel">
              Create an Account{" "}
              <span onClick={() => setCurrentState("Sign Up")}>click here</span>{" "}
            </p>
          ) : (
            <p className="login-toggel">
              Already have an account{" "}
              <span onClick={() => setCurrentState("Log in")}>click here</span>{" "}
            </p>
          )}

          {currentState == "Log in" ? (
            <p className="login-toggel">
              Forgot Password ?
              <span onClick={() => forgotPassword(email)}>
                {""}
                click to reset
              </span>{" "}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default Login;

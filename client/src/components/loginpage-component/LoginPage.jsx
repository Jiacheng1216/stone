import React, { useState } from "react";
import "./LoginPage.css"; // 設定一些簡單的樣式
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 設定密碼
  const correctPassword = "890401"; // 你可以設定這個密碼

  const handleLogin = () => {
    if (password === correctPassword) {
      // 密碼正確，跳轉到管理頁面
      localStorage.setItem("isAdmin", "true");
      navigate("/admin"); // 未登入則跳轉到登入頁
    } else {
      setError("密碼錯誤，請重試！");
    }
  };

  return (
    <div className="login-container">
      <h2>管理員登入</h2>
      <input
        type="password"
        placeholder="輸入密碼"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />
      <button onClick={handleLogin} className="login-btn">
        登入
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoginPage;

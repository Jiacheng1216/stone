import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const NavbarComponent = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img
            src="/images/shiningstonelogo.png" // 把這裡換成你的 logo 路徑
            alt="商穎石材 logo"
          />
          商穎石材線上展示間
        </Link>
      </div>
      {/* <div className="navbar-links">
        <Link to="/">首頁</Link>
        <Link to="/admin">管理</Link>
      </div> */}
    </nav>
  );
};

export default NavbarComponent;

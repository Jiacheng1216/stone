import React from "react";
import "./home-components.css";

const HomeComponent = () => {
  return (
    <main>
      <div className="body">
        <div className="header">
          <div className="content"></div>
        </div>

        <div className="search">
          <div className="btn-search">進階搜尋 🔍</div>
          <div className="input-search">關鍵字搜尋</div>
        </div>

        <div className="content">
          <div className="btn-color-select"></div>
          <div className="folder-container"></div>
        </div>

        <div className="footer">
          <div className="footer-text">
            <p>Follow us on:</p>
          </div>
          <div className="btn-link-container"></div>
        </div>
      </div>
    </main>
  );
};

export default HomeComponent;

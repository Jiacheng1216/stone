import React from "react";
import "./Footer.css"; // 引入樣式文件

const FooterComponent = () => {
  return (
    <div className="footer">
      <p>© 商穎石材有限公司</p>
      <div className="social-links">
        <a
          href="https://www.facebook.com/shangyingstone"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
      </div>
    </div>
  );
};

export default FooterComponent;

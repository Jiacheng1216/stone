import React, { useEffect, useState } from "react";
import "./home-components.css";
import itemService from "../../services/item.service";
import { Link } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";
import FooterComponent from "../footer-component/FooterComponent";

const HomeComponent = () => {
  const [groupedStones, setGroupedStones] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const response = await itemService.get();
      groupByColor(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  // 顏色分組邏輯
  const groupByColor = (items) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.color]) acc[item.color] = [];
      acc[item.color].push(item);
      return acc;
    }, {});
    setGroupedStones(grouped);
  };

  // 搜尋欄輸入後過濾的邏輯
  const filteredGrouped = Object.entries(groupedStones).filter(([color]) =>
    color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <NavbarComponent />
      <div className="main-container">
        <div className="search-section">
          <p className="intro-text">
            精心挑選採購至廠內，供客戶挑選最高品質。
            <br />
            上百種的天然大理石、花崗石、洞石及玉石等
          </p>

          <input
            type="text"
            placeholder="搜尋顏色..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="folder-list">
          {filteredGrouped.map(([color, stones]) => {
            const paperCount = stones.filter((stone) => stone.isPaper).length; //檢尺單的數量
            const stoneCount = stones.length - paperCount; //石頭總數
            const firstLastNumbers = stones.filter(
              (stone) =>
                stone.firstLastNumbers === "頭號" ||
                stone.firstLastNumbers === "尾號"
            );
            // 最新的圖片（放在預覽用）
            const latestStone = stones
              .filter((stone) => !stone.isPaper) // 過濾掉 isPaper 為 true 的
              .sort((a, b) => new Date(a.date) - new Date(b.date))[0]; // 找最新的

            return (
              <Link
                to={`/folder/${encodeURIComponent(color)}`}
                key={color}
                className="folder-card"
              >
                <div className="folder-image-container">
                  <img
                    src={latestStone?.imagePath}
                    alt={`${color}`}
                    className="preview-img"
                  />
                </div>
                <div className="folder-info">
                  <p className="folder-color">{color}</p>

                  <div className="folder-row">
                    <p className="folder-count">現貨片數: {stoneCount}</p>
                    <p className="folder-firstLastNumbers">
                      {firstLastNumbers[0]?.firstLastNumbers || ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <FooterComponent />
    </main>
  );
};

export default HomeComponent;

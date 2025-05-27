import React, { useEffect, useState } from "react";
import "./home-components.css";
import itemService from "../../services/item.service";
import { Link } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";
import FooterComponent from "../footer-component/FooterComponent";
import { ADVANCED_COLOR_OPTIONS } from "./HomeConfig";

const HomeComponent = () => {
  const [groupedStones, setGroupedStones] = useState({});
  const [search, setSearch] = useState("");

  // 進階搜尋
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);

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

  // 進階搜尋勾選事件
  const toggleColorSelection = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
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

  // 搜尋欄輸入後過濾的邏輯，並照上傳時間排序
  const filteredGrouped = Object.entries(groupedStones)
    .filter(([color]) => {
      if (selectedColors.length > 0) {
        // 有勾選時，用 OR 條件篩選包含任一勾選關鍵字
        return selectedColors.some((selColor) => color.includes(selColor));
      } else {
        // 沒勾選用一般搜尋欄
        return color.toLowerCase().includes(search.toLowerCase());
      }
    })
    .sort(([, stonesA], [, stonesB]) => {
      const latestA = Math.max(
        ...stonesA.map((stone) => new Date(stone.date).getTime())
      );
      const latestB = Math.max(
        ...stonesB.map((stone) => new Date(stone.date).getTime())
      );
      return latestB - latestA; // 最新排最前面
    });

  const filteredColors =
    selectedColors.length > 0 ? selectedColors : search ? [search] : [];

  const filterText =
    filteredColors.length > 0
      ? `篩選出含 ${filteredColors.join("、 ")} 的圖片`
      : "";

  return (
    <main>
      <NavbarComponent />
      <div className="main-container">
        <div className="intro-text-section">
          <p className="intro-text">
            精心挑選採購至廠內，供客戶挑選最高品質。
            <br />
            上百種的天然大理石、花崗石、洞石及玉石等
          </p>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="搜尋顏色..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            disabled={selectedColors.length > 0} // 進階搜尋開啟時鎖定搜尋欄
          />

          <button
            onClick={() => setShowAdvanced(true)}
            className="advanced-search-btn"
          >
            <span className="icon">🔍</span>
            進階搜尋
          </button>
        </div>

        {showAdvanced && (
          <div className="modal-overlay" onClick={() => setShowAdvanced(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>進階搜尋條件</h3>
              <div className="checkbox-list">
                {ADVANCED_COLOR_OPTIONS.map((color) => (
                  <label key={color}>
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={() => toggleColorSelection(color)}
                    />
                    {color}
                  </label>
                ))}
              </div>
              <button onClick={() => setShowAdvanced(false)}>確定</button>
              <button
                onClick={() => {
                  setSelectedColors([]);
                  setShowAdvanced(false);
                }}
              >
                清除
              </button>
            </div>
          </div>
        )}

        {/* 篩選說明 */}
        {filterText && <div className="filter-text">{filterText}</div>}

        <div className="folder-list">
          {filteredGrouped
            .filter(([color, stones]) => stones.some((stone) => stone.isPublic)) // 只留下有公開圖片的色彩群組
            .map(([color, stones]) => {
              const noPublicCount = stones.filter(
                (stone) => !stone.isPublic
              ).length; //未公開圖片的數量
              const paperCount = stones.filter((stone) => stone.isPaper).length; //檢尺單的數量
              const stoneCount = stones.length - paperCount - noPublicCount; //石頭總數
              const firstLastNumbers = stones.filter(
                (stone) =>
                  stone.firstLastNumbers === "頭號" ||
                  stone.firstLastNumbers === "尾號"
              );
              // 最新的圖片（放在預覽用）
              const latestStone = stones
                .filter((stone) => stone.isPublic) // 過濾掉 isPublic 為 false 的
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

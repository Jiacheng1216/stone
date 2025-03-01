import React, { useEffect, useState } from "react";
import "./home-components.css";
import itemService from "../../services/item.service";
import { Link, Navigate } from "react-router-dom";

const HomeComponent = () => {
  const [stones, setStones] = useState([]);

  useEffect(() => {
    fetchItem();
  }, []);

  //查找所有物品
  const fetchItem = async () => {
    try {
      const response = await itemService.get();
      setStones(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  //照顏色分類
  const categorizedStones = stones.reduce((acc, stone) => {
    if (!acc[stone.color]) {
      acc[stone.color] = [];
    }
    acc[stone.color].push(stone);
    return acc;
  }, {});

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
          <div className="folder-container">
            <div>
              <div className="folder-container">
                {Object.keys(categorizedStones).map((color) => {
                  // 取得該顏色的總數量
                  const stoneCount = categorizedStones[color].length;

                  // 取得最新的一張圖片（根據日期排序）
                  const latestStone = categorizedStones[color].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                  )[0];

                  return (
                    <Link
                      to={`/folder/${color}`}
                      key={color}
                      className="folder-item"
                    >
                      <p className="stone-count">現貨片數: {stoneCount}</p>
                      <img
                        src={`http://localhost:8080/images/${latestStone.imagePath}`}
                        alt={`${color} marble`}
                        className="latest-stone-image"
                      />
                      <img
                        src={"images/folder.png"}
                        alt={`${color} folder`}
                        className="folder-image"
                      />
                      <p>{color}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
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

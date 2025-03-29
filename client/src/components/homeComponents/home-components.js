import React, { useEffect, useState } from "react";
import "./home-components.css";
import itemService from "../../services/item.service";
import { Link, Navigate } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";

const HomeComponent = () => {
  const [stones, setStones] = useState([]);
  const [groupedStones, setGroupedStones] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const response = await itemService.get();
      setStones(response.data);
      groupByColor(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const groupByColor = (items) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.color]) acc[item.color] = [];
      acc[item.color].push(item);
      return acc;
    }, {});
    setGroupedStones(grouped);
  };

  const filteredGrouped = Object.entries(groupedStones).filter(([color]) =>
    color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <NavbarComponent />
      <div className="main-container">
        <div className="search-section">
          <h1>大理石分類</h1>
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
            const stoneCount = stones.length;
            const latestStone = stones.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            )[0];

            return (
              <Link to={`/folder/${color}`} key={color} className="folder-card">
                <div className="folder-image-container">
                  <img
                    src={`http://192.168.0.96:8080/images/${latestStone.imagePath}`}
                    alt={`${color} marble`}
                    className="preview-img"
                  />
                </div>
                <div className="folder-info">
                  <p className="folder-color">{color}</p>
                  <p className="folder-count">現貨片數: {stoneCount}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default HomeComponent;

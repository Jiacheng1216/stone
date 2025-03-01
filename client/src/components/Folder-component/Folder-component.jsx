import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ItemService from "../../services/item.service";
import "./Folder-component.css";

const FolderComponent = () => {
  const { color } = useParams(); // 從 URL 取得顏色
  const [stones, setStones] = useState([]);

  useEffect(() => {
    fetchColorItems();
  }, [color]); // 當 color 變化時，重新獲取資料

  const fetchColorItems = async () => {
    try {
      const response = await ItemService.getByColor(color);
      setStones(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <div className="folder-header">
        <div className="folder-header-top"></div>
        <div className="folder-header-bottom"></div>
      </div>
      <div className="folder-content">
        <div className="folder-content-download"></div>
        <div className="folder-content-items">
          <h1>{color} 色的大理石</h1>
          <div className="folder-content">
            {stones.length > 0 ? (
              stones.map((stone) => (
                <div key={stone._id} className="stone-item">
                  <img
                    src={`http://localhost:8080/images/${stone.imagePath}`}
                    alt={stone.color}
                    width="100"
                  />
                  <p>
                    寬度: {stone.width} 高度: {stone.height}
                  </p>
                </div>
              ))
            ) : (
              <p>沒有找到 {color} 色的大理石。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;

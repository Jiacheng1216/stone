import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ItemService from "../../services/item.service";
import "./Folder-component.css";

const FolderComponent = () => {
  const { color } = useParams(); // 從 URL 取得顏色
  const [stones, setStones] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 開啟 Modal 並設定當前圖片
  const openModal = (index) => {
    setCurrentIndex(index);
    setSelectedImage(stones[index].imagePath);
  };

  // 關閉 Modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // 切換上一張圖片
  const prevImage = () => {
    const newIndex = (currentIndex - 1 + stones.length) % stones.length;
    setCurrentIndex(newIndex);
    setSelectedImage(stones[newIndex].imagePath);
  };

  // 切換下一張圖片
  const nextImage = () => {
    const newIndex = (currentIndex + 1) % stones.length;
    setCurrentIndex(newIndex);
    setSelectedImage(stones[newIndex].imagePath);
  };

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
          <div className="folder-stone-container">
            {stones.length > 0 ? (
              stones.map((stone, index) => (
                <div
                  key={stone._id}
                  className="stone-background"
                  onClick={() => openModal(index)}
                >
                  <img
                    className="stone-img"
                    src={`http://192.168.0.96:8080/images/${stone.imagePath}`}
                    alt={stone.color}
                    width="100"
                  />
                  <p className="stone-color">{stone.color}</p>
                </div>
              ))
            ) : (
              <p>沒有找到 {color} 色的大理石。</p>
            )}

            {/* 彈出視窗 (Modal) */}
            {selectedImage !== null && (
              <div className="modal-overlay" onClick={closeModal}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 下載圖片超連結 */}
                  <div className="download-img-text-div">
                    <p className="modal-color">{stones[currentIndex].color}</p>
                    <a
                      href={`http://192.168.0.96:8080/images/${selectedImage}`}
                      download
                      className="download-img-text"
                    >
                      下載圖片
                    </a>
                  </div>
                  <button className="close-btn" onClick={closeModal}>
                    ✖
                  </button>
                  <button className="prev-btn" onClick={prevImage}>
                    ←
                  </button>
                  <img
                    src={`http://192.168.0.96:8080/images/${selectedImage}`}
                    alt="Enlarged stone"
                    className="modal-img"
                  />
                  <button className="next-btn" onClick={nextImage}>
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;

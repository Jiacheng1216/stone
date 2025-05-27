import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ItemService from "../../services/item.service";
import "./Folder-component.css";
import NavbarComponent from "../navbar-component/NavbarComponent";
import FooterComponent from "../footer-component/FooterComponent";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
      const response = await ItemService.getByColor(encodeURIComponent(color));
      const stones = response.data.filter((stone) => stone.isPublic);
      setStones(stones);
    } catch (e) {
      console.log(e);
    }
  };

  // 一鍵下載所有圖片
  const downloadAllImages = async () => {
    const zip = new JSZip();
    const imgFolder = zip.folder("stones");

    // 只下載 isPublic === true 的圖片
    const publicStones = stones.filter((stone) => stone.isPublic);

    for (let i = 0; i < publicStones.length; i++) {
      const stone = publicStones[i];
      try {
        const response = await fetch(stone.imagePath, { mode: "cors" });

        // 檢查是否為圖片類型
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType.startsWith("image/")) {
          console.warn(`跳過非圖片或無效圖片：${stone.imagePath}`);
          continue; // 跳過這張圖
        }

        const blob = await response.blob();

        // 根據 Content-Type 推斷副檔名
        const extension = contentType.split("/")[1].split(";")[0]; // e.g. "jpeg", "png"
        const baseName = stone.fileName?.split(".")[0] || `stone-${i + 1}`;
        const fileName = `${baseName}.${extension}`;

        imgFolder.file(fileName, blob);
      } catch (err) {
        console.error(`下載圖片失敗：${stone.imagePath}`, err);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${color}.zip`);
    });
  };

  return (
    <div>
      <NavbarComponent />
      <p className="folder-color-text">{color}</p>

      <div className="folder-content-download">
        <button className="download-all-btn" onClick={downloadAllImages}>
          下載全部圖片(ZIP)
        </button>
      </div>

      <div className="folder-content">
        <div className="folder-content-items">
          <div className="folder-stone-container">
            {stones.length > 0 ? (
              stones
                .filter((stone) => stone.isPublic) // 過濾掉不公開的
                .map((stone, index) => (
                  <div
                    key={stone._id}
                    className="stone-background"
                    onClick={() => openModal(index)}
                  >
                    <img
                      className="stone-img"
                      src={stone.imagePath}
                      alt={stone.color}
                      width="100"
                    />
                    <p className="stone-fileName">{stone.fileName}</p>
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
                    {/* <a
                      href={selectedImage.imagePath}
                      download
                      className="download-img-text"
                    >
                      下載圖片
                    </a> */}
                  </div>
                  <button className="close-btn" onClick={closeModal}>
                    ✖
                  </button>
                  <button className="prev-btn" onClick={prevImage}>
                    ←
                  </button>
                  <img
                    src={selectedImage}
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
      <FooterComponent />
    </div>
  );
};

export default FolderComponent;

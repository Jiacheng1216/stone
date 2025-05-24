import React, { useState, useEffect } from "react";
import itemService from "../../services/item.service";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";

const AdminComponent = () => {
  const navigate = useNavigate(); // 替代 useHistory
  const [stones, setStones] = useState([]);

  //處理輸入的資料
  const [newStone, setNewStone] = useState({
    color: "",
    width: "",
    height: "",
    image: null,
    isPaper: false, //檢尺單
    firstLastNumbers: "", //頭號或尾號
  });

  //選擇檔案 上傳圖片
  const [selectedFiles, setSelectedFiles] = useState([]); //已選擇的圖片
  const [previewUrls, setPreviewUrls] = useState([]); // 多圖預覽

  //批量刪除圖片 選取
  const [selectedIds, setSelectedIds] = useState([]);

  //進度條
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleUploadProgress, setVisibleUploadProgress] = useState(false); //上傳時顯示
  const [visibleDeleteProgress, setVisibleDeleteProgress] = useState(false); //刪除時顯示

  //搜尋
  const [search, setSearch] = useState("");

  useEffect(() => {
    // 檢查是否已經登入
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login"); // 未登入則跳轉到登入頁
    } else {
      fetchStones();
    }
  }, [navigate]);

  /**
   * 抓取石頭
   */
  const fetchStones = async () => {
    try {
      const response = await itemService.get();
      setStones(response.data);
    } catch (error) {
      console.error("取得石頭資料失敗", error);
    }
  };

  //處理輸入文字
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStone({ ...newStone, [name]: value });
  };

  //處理預覽圖片
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    }
  };

  //處理提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("請選取圖片");
      return;
    }

    try {
      setVisibleUploadProgress(true);
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("photo", file);

        // 圖片上傳
        const photoRes = await itemService.postPhoto(formData);

        const imagePath = photoRes.data.imagePath;
        const imagePublicId = photoRes.data.imagePublicId;
        const fileName = photoRes.data.fileName.replace(/\.[^/.]+$/, "");

        const { color, width, height, isPaper, firstLastNumbers } = newStone;

        // 上傳商品資料
        await itemService.post(
          color,
          height,
          width,
          imagePath,
          imagePublicId,
          isPaper,
          firstLastNumbers,
          fileName
        );

        // 更新總進度（例如3張：33%、66%、100%）
        updateProgress(i, selectedFiles.length);
      }

      // 清空表單並重新抓資料
      setNewStone({
        color: "",
        width: "",
        height: "",
        image: null,
        isPaper: false,
        firstLastNumbers: "",
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setProgress(0);
      setVisibleUploadProgress(false);
      setCurrentIndex(0);
      alert("上傳成功！");
      fetchStones();
    } catch (error) {
      console.error("上傳失敗", error);
      alert("上傳失敗，請稍後再試");
    }
  };

  // //處理刪除
  // const handleDelete = async (id) => {
  //   if (window.confirm("確定要刪除這塊大理石嗎？")) {
  //     try {
  //       await itemService.deleteItem(id);
  //       fetchStones();
  //       alert("刪除成功！");
  //     } catch (error) {
  //       console.error("刪除失敗", error);
  //       alert("刪除失敗，請稍後再試");
  //     }
  //   }
  // };

  //處理選取
  const handleSelect = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  //處理批量刪除邏輯
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("請選取要刪除的圖片");
      return;
    }

    if (window.confirm(`確定要刪除 ${selectedIds.length} 張圖片嗎？`)) {
      try {
        setVisibleDeleteProgress(true);
        for (let j = 0; j < selectedIds.length; j++) {
          await itemService.deleteItem(selectedIds[j]);
          // 更新總進度（例如3張：33%、66%、100%）
          updateProgress(j, selectedIds.length);
        }
        alert("選取的圖片刪除成功！");
        fetchStones();
        setSelectedIds([]);
        setVisibleDeleteProgress(false);
        setProgress(0);
        setCurrentIndex(0);
      } catch (error) {
        console.error("批量刪除失敗", error);
        alert("刪除過程出現問題");
      }
    }
  };

  //更新進度條邏輯
  const updateProgress = (index, total) => {
    const percent = Math.round(((index + 1) / total) * 100);
    setProgress(percent);
    setCurrentIndex(index);
  };

  //移除選取中的圖片（從預覽移除）
  const handleRemovePreview = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  //過濾搜尋欄搜尋的石頭
  const filteredStones = stones.filter((stone) =>
    stone.color.toLowerCase().includes(search.toLowerCase())
  );

  //全部勾選
  const handleSelectAll = () => {
    const allIds = filteredStones.map((stone) => stone._id);
    setSelectedIds(allIds);
  };

  return (
    <div>
      <NavbarComponent />

      <div className="admin-container">
        <h2>上傳新圖片到資料夾</h2>
        <form className="upload-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="color"
            placeholder="資料夾名稱(顏色)(備註:不要打#)"
            value={newStone.color}
            onChange={handleInputChange}
            required
            disabled={visibleUploadProgress}
          />

          <div className="checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={newStone.isPaper}
                onChange={(e) =>
                  setNewStone({ ...newStone, isPaper: e.target.checked })
                }
                disabled={visibleUploadProgress}
              />
              <span>檢尺單</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={newStone.firstLastNumbers === "頭號"}
                onChange={(e) =>
                  setNewStone({
                    ...newStone,
                    firstLastNumbers: e.target.checked ? "頭號" : "",
                  })
                }
                disabled={visibleUploadProgress}
              />
              <span>頭號</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={newStone.firstLastNumbers === "尾號"}
                onChange={(e) =>
                  setNewStone({
                    ...newStone,
                    firstLastNumbers: e.target.checked ? "尾號" : "",
                  })
                }
                disabled={visibleUploadProgress}
              />
              <span>尾號</span>
            </label>
          </div>

          {/* <input
          type="number"
          name="width"
          placeholder="寬度"
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="height"
          placeholder="高度"
          onChange={handleInputChange}
          required
        /> */}
          <label
            htmlFor="upload-input"
            className="custom-upload-button"
            disabled={visibleUploadProgress}
          >
            選擇圖片
          </label>
          <input
            id="upload-input"
            type="file"
            multiple
            onChange={handleFileChange}
            // required
            className="hidden-input"
            disabled={visibleUploadProgress}
          />

          <button type="submit" disabled={visibleUploadProgress}>
            上傳
          </button>

          {visibleUploadProgress && (
            <div className="upload-progress">
              <p>
                上傳第 {currentIndex + 1} 張，共 {selectedFiles.length} 張...
              </p>
              <progress value={progress} max="100" />
              <span>{progress}%</span>
            </div>
          )}

          {visibleDeleteProgress && (
            <div className="upload-progress">
              <p>
                刪除第 {currentIndex + 1} 張，共 {selectedIds.length} 張...
              </p>
              <progress value={progress} max="100" />
              <span>{progress}%</span>
            </div>
          )}

          {previewUrls.length > 0 && (
            <div className="preview-container">
              {selectedFiles.length > 0 && (
                <p className="preview-text">
                  你已選擇 {selectedFiles.length} 張圖片
                </p>
              )}
              <p>圖片預覽：</p>
              {previewUrls.map((url, idx) => (
                <div key={idx} className="preview-wrapper">
                  <img src={url} alt={`預覽${idx}`} className="preview-img" />
                  <button
                    type="button"
                    className="remove-preview-btn"
                    onClick={() => handleRemovePreview(idx)}
                    disabled={visibleUploadProgress}
                  >
                    X
                  </button>
                  <p>{selectedFiles[idx]?.name}</p>
                </div>
              ))}
            </div>
          )}
        </form>

        <h2>現有大理石</h2>

        <button
          className="bulk-delete-btn"
          onClick={handleBulkDelete}
          disabled={visibleDeleteProgress}
        >
          刪除選取的圖片 ({selectedIds.length})
        </button>

        <button
          className="select-all-btn"
          onClick={handleSelectAll}
          disabled={visibleDeleteProgress || filteredStones.length === 0}
        >
          全選所有圖片
        </button>

        {selectedIds.length > 0 && (
          <button
            className="clear-selection-btn"
            onClick={() => setSelectedIds([])}
            disabled={visibleDeleteProgress}
          >
            取消所有勾選
          </button>
        )}

        <input
          type="text"
          placeholder="搜尋顏色..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="stone-list">
          {filteredStones.map((stone) => (
            <div
              key={stone._id}
              className="stone-item"
              onClick={() => handleSelect(stone._id)}
              disabled={visibleDeleteProgress}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(stone._id)}
                onChange={() => handleSelect(stone._id)}
                onClick={(e) => e.stopPropagation()} // 避免點 checkbox 也觸發整個卡片的 onClick
                disabled={visibleDeleteProgress}
              />
              <img src={stone.imagePath} alt={stone.color} />
              <p>{stone.color}</p>
              {/* 寬和高的 */}
              {/* <p>
              {stone.width} × {stone.height}
            </p> */}
              {/* <button onClick={() => handleDelete(stone._id)}>刪除</button> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminComponent;

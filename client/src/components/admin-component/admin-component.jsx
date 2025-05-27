import React, { useState, useEffect } from "react";
import itemService from "../../services/item.service";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";

const AdminComponent = () => {
  const navigate = useNavigate(); // 替代 useHistory
  const [showFolders, setShowFolders] = useState(true); //資料夾模式或圖片模式
  const [groupedStones, setGroupedStones] = useState({});
  const [stones, setStones] = useState([]);

  //處理輸入的資料
  const [newStone, setNewStone] = useState({
    color: "",
    width: "",
    height: "",
    stoneOrigin: "",
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
  const [visibleUploadProgress, setVisibleUploadProgress] = useState(false); //上傳時顯示

  //刪除狀態
  const [deleteState, setDeleteState] = useState(false); //刪除時顯示

  //搜尋
  const [search, setSearch] = useState("");

  useEffect(() => {
    // 檢查是否已經登入
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login"); // 未登入則跳轉到登入頁
    } else {
      fetchStones();
      console.log(filteredStones);
    }
  }, [navigate]);

  /**
   * 抓取石頭
   */
  const fetchStones = async () => {
    try {
      const response = await itemService.get();
      setStones(response.data);
      groupByColor(response.data);
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

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file); // 注意 field name 是 "images"
      });

      formData.append("color", newStone.color);
      formData.append("width", newStone.width);
      formData.append("height", newStone.height);
      formData.append("stoneOrigin", newStone.stoneOrigin);
      formData.append("isPaper", newStone.isPaper);
      formData.append("firstLastNumbers", newStone.firstLastNumbers);

      await itemService.uploadMultiple(formData, (progressEvent) => {
        const percentCompleted = Math.min(
          99,
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
        setProgress(percentCompleted);
      });

      alert("上傳成功！");

      // 清空表單
      setNewStone({
        color: "",
        width: "",
        height: "",
        stoneOrigin: "",
        image: null,
        isPaper: false,
        firstLastNumbers: "",
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setProgress(0);
      setVisibleUploadProgress(false);
      fetchStones();
    } catch (error) {
      console.error("上傳失敗", error);
      alert("上傳失敗，請稍後再試");
    }
  };

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
        setDeleteState(true);
        await itemService.deleteItem(selectedIds);

        alert("選取的圖片刪除成功！");
        fetchStones();
        setSelectedIds([]);
        setDeleteState(false);
      } catch (error) {
        console.error("批量刪除失敗", error);
        alert("刪除過程出現問題");
      }
    }
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
  const filteredStones = stones
    .filter((stone) => stone.color.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  //全部勾選
  const handleSelectAll = () => {
    const allIds = filteredStones.map((stone) => stone._id);
    setSelectedIds(allIds);
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
    .filter(([color]) => color.toLowerCase().includes(search.toLowerCase()))
    .sort(([, stonesA], [, stonesB]) => {
      const latestA = Math.max(
        ...stonesA.map((stone) => new Date(stone.date).getTime())
      );
      const latestB = Math.max(
        ...stonesB.map((stone) => new Date(stone.date).getTime())
      );
      return latestB - latestA; // 最新排最前面
    });

  // 點擊資料夾的邏輯
  const handleFolderClick = (color) => {
    setSearch(color);
    setShowFolders(false);
  };

  // 切換圖片的isPublic狀態
  const togglePublic = async (id, currentStatus) => {
    try {
      await itemService.editItem(id, { isPublic: !currentStatus });
      fetchStones(); // 更新資料
    } catch (error) {
      console.error("更新公開狀態失敗", error);
      alert("變更狀態失敗");
    }
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
            placeholder="資料夾名稱(顏色)"
            value={newStone.color}
            onChange={handleInputChange}
            required
            disabled={visibleUploadProgress}
          />
          <input
            type="text"
            name="stoneOrigin"
            placeholder="產地"
            value={newStone.stoneOrigin}
            onChange={handleInputChange}
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
              <p>上傳照片中，共 {selectedFiles.length} 張...</p>
              <progress value={progress} max="100" />
              <span>{progress}%</span>
            </div>
          )}

          {deleteState && (
            <div className="upload-progress">
              <p>刪除照片中，共 {selectedIds.length} 張...</p>
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

        <h2>現有圖片</h2>

        <button
          className="bulk-delete-btn"
          onClick={handleBulkDelete}
          disabled={deleteState}
        >
          刪除選取的圖片 ({selectedIds.length})
        </button>

        <button
          className="select-all-btn"
          onClick={handleSelectAll}
          disabled={deleteState || filteredStones.length === 0}
        >
          全選所有圖片
        </button>

        {selectedIds.length > 0 && (
          <button
            className="clear-selection-btn"
            onClick={() => setSelectedIds([])}
            disabled={deleteState}
          >
            取消所有勾選
          </button>
        )}

        <input
          type="text"
          placeholder="搜尋顏色..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowFolders(e.target.value === "");
          }}
          className="search-input"
        />

        {showFolders ? (
          // 資料夾模式
          <div className="admin-folder-list">
            {filteredGrouped.map(([color, stones]) => {
              const stoneCount = stones.length; //圖片總數
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
                <div
                  className="folder-card"
                  onClick={() => {
                    handleFolderClick(color);
                  }}
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
                      <p className="folder-count">圖片總數: {stoneCount}</p>
                      <p className="folder-firstLastNumbers">
                        {firstLastNumbers[0]?.firstLastNumbers || ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 圖片模式
          <div>
            <div className="back-folder-and-search-text-container">
              <p
                className="back-folder-btn"
                onClick={(e) => {
                  if (!deleteState) {
                    setSearch("");
                    setShowFolders(true);
                    setSelectedIds([]);
                  }
                }}
                disabled={deleteState}
              >
                ⬑返回資料夾
              </p>
              <p className="admin-search-text">{search}</p>
            </div>
            <div className="stone-list">
              {filteredStones.map((stone) => (
                <div>
                  <p
                    className="ispublic-set"
                    onClick={(e) => {
                      togglePublic(stone._id, stone.isPublic);
                    }}
                  >
                    {stone.isPublic ? "隱藏" : "取消隱藏"}
                  </p>
                  <div
                    key={stone._id}
                    className={`stone-item ${
                      stone.isPublic ? "" : "not-public"
                    }`}
                    onClick={() => handleSelect(stone._id)}
                    disabled={deleteState}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(stone._id)}
                      onChange={() => {
                        if (!deleteState) {
                          handleSelect(stone._id);
                        }
                      }}
                      onClick={(e) => {
                        if (!deleteState) {
                          e.stopPropagation();
                        }
                      }} // 避免點 checkbox 也觸發整個卡片的 onClick
                      disabled={deleteState}
                    />

                    <img src={stone.imagePath} alt={stone.color} />
                    <p>{stone.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComponent;

import React, { useState, useEffect } from "react";
import itemService from "../../services/item.service";
import "./Admin.css";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../navbar-component/NavbarComponent";

const AdminComponent = () => {
  const navigate = useNavigate(); // 替代 useHistory
  const [stones, setStones] = useState([]);
  const [newStone, setNewStone] = useState({
    color: "",
    width: "",
    height: "",
    image: null,
  });
  
  //選擇檔案 上傳圖片
  const [selectedFiles, setSelectedFiles] = useState([]); // 替代原本 selectedFile
  const [previewUrls, setPreviewUrls] = useState([]); // 多圖預覽
  
  //上傳進度條
  const [uploadProgress, setUploadProgress] = useState(0);
  const [visibleProgress, setVisibleProgress] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  //刪除進度條
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [visibleDeleteProgress, setVisibleDeleteProgress] = useState(false);
  const [currentDeleteIndex, setCurrentDeleteIndex] = useState(0);

  //批量刪除圖片 選取
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    // 檢查是否已經登入
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login"); // 未登入則跳轉到登入頁
    } else {
      fetchStones();
    }
  }, [navigate]);

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
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    }
  };

  //處理提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (visibleProgress || visibleDeleteProgress) return; // ⛔ 阻止重複提交

    try {
      setVisibleProgress(true);
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("photo", file);
  
        // 圖片上傳
        const photoRes = await itemService.postPhoto(formData);
  
        const imagePath = photoRes.data.imagePath;
        const imagePublicId = photoRes.data.imagePublicId;
  
        const { color, width, height } = newStone;
  
        // 上傳商品資料
        await itemService.post(color, height, width, imagePath, imagePublicId);
  
        // 更新總進度（例如3張：33%、66%、100%）
        const percentCompleted = Math.round(((i + 1) / selectedFiles.length) * 100);
        setUploadProgress(percentCompleted);
        setCurrentUploadIndex(i);
      }

      // 清空表單並重新抓資料
      setNewStone({ color: "", width: "", height: "", image: null });
      fetchStones();
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      setVisibleProgress(false);
      setCurrentUploadIndex(0);
      alert("上傳成功！");
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
        setVisibleDeleteProgress(true)
        for (let j = 0; j<selectedIds.length;j++) {
          await itemService.deleteItem(selectedIds[j]);
          // 更新總進度（例如3張：33%、66%、100%）
        const percentCompleted = Math.round(((j + 1) / selectedIds.length) * 100);
        setDeleteProgress(percentCompleted);
        setCurrentDeleteIndex(j);
        }
        alert("選取的圖片刪除成功！");
        fetchStones();
        setSelectedIds([]);
        setVisibleDeleteProgress(false);
        setDeleteProgress(0);
        setCurrentDeleteIndex(0);
      } catch (error) {
        console.error("批量刪除失敗", error);
        alert("刪除過程出現問題");
      }
    }
  };

  return (
    <div>
      <NavbarComponent />
    
    <div className="admin-container">
      <h2>上傳新大理石</h2>
      <form className="upload-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="color"
          placeholder="顏色"
          onChange={handleInputChange}
          required
        />
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
        <input type="file" multiple onChange={handleFileChange} required />
        <button type="submit" disabled={visibleProgress || visibleDeleteProgress}>上傳</button>

        {visibleProgress && (
  <div className="upload-progress">
    <p>上傳第 {currentUploadIndex + 1} 張，共 {selectedFiles.length} 張...</p>
    <progress value={uploadProgress} max="100" />
    <span>{uploadProgress}%</span>
  </div>
)}

{visibleDeleteProgress && (
  <div className="upload-progress">
    <p>刪除第 {currentDeleteIndex + 1} 張，共 {selectedIds.length} 張...</p>
    <progress value={deleteProgress} max="100" />
    <span>{deleteProgress}%</span>
  </div>
)}

        {previewUrls.length > 0 && (
  <div className="preview-container">
    <p>圖片預覽：</p>
    {previewUrls.map((url, idx) => (
      <img key={idx} src={url} alt={`預覽${idx}`} className="preview-img" />
    ))}
  </div>
)}
      </form>

      <h2>現有大理石</h2>
      <button className="bulk-delete-btn" onClick={handleBulkDelete}>
    刪除選取的圖片 ({selectedIds.length})
  </button>
  {selectedIds.length > 0 && (
  <button className="clear-selection-btn" onClick={() => setSelectedIds([])}>取消所有勾選</button>
)}
      <div className="stone-list">
        {stones.map((stone) => (
          <div key={stone._id} className="stone-item" onClick={() => handleSelect(stone._id)} >
            <input
        type="checkbox"
        checked={selectedIds.includes(stone._id)}
        onChange={() => handleSelect(stone._id)}
        onClick={(e) => e.stopPropagation()}     // 避免點 checkbox 也觸發整個卡片的 onClick
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

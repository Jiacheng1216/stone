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
  
  //進度條
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStone({ ...newStone, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
      }

      // 清空表單並重新抓資料
      setNewStone({ color: "", width: "", height: "", image: null });
      fetchStones();
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      alert("上傳成功！");
    } catch (error) {
      console.error("上傳失敗", error);
      alert("上傳失敗，請稍後再試");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("確定要刪除這塊大理石嗎？")) {
      try {
        await itemService.deleteItem(id);
        fetchStones();
        alert("刪除成功！");
      } catch (error) {
        console.error("刪除失敗", error);
        alert("刪除失敗，請稍後再試");
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
        <button type="submit">上傳</button>

        {uploadProgress > 0 && uploadProgress < 100 && (
  <div className="upload-progress">
    <p>上傳中...</p>
    <progress value={uploadProgress} max="100" />
    <span>{uploadProgress}%</span>
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
      <div className="stone-list">
        {stones.map((stone) => (
          <div key={stone._id} className="stone-item">
            <img src={stone.imagePath} alt={stone.color} />
            <p>{stone.color}</p>
            {/* 寬和高的 */}
            {/* <p>
              {stone.width} × {stone.height}
            </p> */}
            <button onClick={() => handleDelete(stone._id)}>刪除</button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default AdminComponent;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeComponent from "./components/homeComponents/home-components";
import FolderComponent from "./components/Folder-component/Folder-component";
import Layout from "./components/Layout";
import itemService from "./services/item.service";
import { useState } from "react";
import AdminComponent from "./components/admin-component/admin-component";
import LoginPage from "./components/loginpage-component/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeComponent />} />
          <Route path="/folder/:color" element={<FolderComponent />} />
          <Route path="/admin" element={<AdminComponent />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

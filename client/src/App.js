import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeComponent from "./components/homeComponents/home-components";
import FolderComponent from "./components/folder-components";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeComponent />} />
          <Route path="folder" element={<FolderComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

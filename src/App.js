import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import Body from "./pages/Body";
import WorkspaceDetail from "./pages/WorkspaceDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/workspace" element={<Body/>} />
        <Route path="/workspace/:workspaceId" element={<WorkspaceDetail/>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React, { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import Editor from "./components/articleEditor/ArticleEditor";
import LoginRegister from "./LoginRegister";
import LogoutPage from "./pages/LogoutPage";
import Settings from "./Settings";
import MainLayout from "./layout/MainLayout";
import ArticlesListPage from "./pages/ArticlesListPage";
import ArticlePage from "pages/ArticlePage";
import ProfilePage from "pages/ProfilePage";
import LoginPage from "pages/LoginPage";
import { restoreSession } from "features/auth/authSlice";
import { useAppDispatch } from "store";
import ArticleEditorPage from "pages/ArticleEditorPage";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginRegister />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ArticlesListPage />} />
          <Route path="editor" element={<ArticleEditorPage />} />
          <Route path="editor/:slug" element={<ArticleEditorPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="profile/:username/favorites" element={<ProfilePage />} />
          <Route path="settings" element={<Settings />} />
          <Route path=":slug" element={<ArticlePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;

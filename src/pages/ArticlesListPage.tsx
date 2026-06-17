import { useEffect } from "react";

import ArticleList from "../components/articles/ArticleList";
import { loadArticles } from "../features/articles/articlesSlice";
import { useAppDispatch, useAppSelector } from "../store";

export default function ArticlesListPage() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector((state) => state.articles.list);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    dispatch(loadArticles({ token }));
  }, [dispatch, token]);

  return <ArticleList articles={articles} />;
}

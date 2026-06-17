import ArticleEditor from "components/articleEditor/ArticleEditor";
import { loadArticle } from "features/articles/articlesSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store";

const ArticleEditorPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const article = useAppSelector((state) => state.articles.article);

  useEffect(() => {
    if (slug == null || slug === "") {
      return;
    }
    dispatch(loadArticle({ slug, token }));
  }, [dispatch, slug, token]);
  return (
    <ArticleEditor article={article} />
  );
};

export default ArticleEditorPage;
import Article from "components/article/Article";
import PageWrapper from "components/common/PageWrapper";
import { loadArticle } from "features/articles/articlesSlice";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const article = useAppSelector((state) => state.articles.article);
  const articleLoading = useAppSelector((state) => state.articles.articleLoading);
  const articleError = useAppSelector((state) => state.articles.articleError);
  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (slug == null || slug === "") {
      return;
    }
    dispatch(loadArticle({ slug, token }));
  }, [dispatch, slug, token]);

  const showLoading = articleLoading || (article == null && articleError == null);

  if (showLoading) {
    return (
      <PageWrapper>
        <p>Loading...</p>
      </PageWrapper>
    );
  }

  if (articleError != null && article == null) {
    return (
      <PageWrapper>
        <p>{articleError}</p>
      </PageWrapper>
    );
  }

  if (article != null) {
    const isOwnArticle =
      currentUser != null && currentUser.username === article.author.username;
    return <Article article={article} isOwnArticle={isOwnArticle} />;
  }

  // todo add common loading and error component

  return (
    <PageWrapper>
      <p>Article not found.</p>
    </PageWrapper>
  );
};

export default ArticlePage;

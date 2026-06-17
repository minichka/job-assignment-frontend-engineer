import type { Article } from "api/articles";
import { toggleArticleFavorite } from "features/articles/articlesSlice";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store";

const PLACEHOLDER_AVATAR = "http://i.imgur.com/Qr71crq.jpg";

const ArticleItem = ({
  article,
  onFavoriteUpdated,
}: {
  article: Article;
  /** When set, called after a successful favorite/unfavorite (e.g. profile refetches its own list). */
  onFavoriteUpdated?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const [favoritePending, setFavoritePending] = useState(false);

  const onFavoriteClick = useCallback(async () => {
    if (token == null || token === "") {
      navigate("/login");
      return;
    }
    setFavoritePending(true);
    try {
      await dispatch(
        toggleArticleFavorite({ slug: article.slug, favorited: article.favorited, token })
      ).unwrap();
      onFavoriteUpdated?.();
    } catch {
      // API errors are silent here; list state unchanged on rejection
    } finally {
      setFavoritePending(false);
    }
  }, [article.favorited, article.slug, dispatch, navigate, onFavoriteUpdated, token]);

  return (
    <div className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${encodeURIComponent(article.author.username)}`}>
          <img src={article.author.image || PLACEHOLDER_AVATAR} alt="" />
        </Link>
        <div className="info">
          <Link
            to={`/profile/${encodeURIComponent(article.author.username)}`}
            className="author"
          >
            {article.author.username}
          </Link>
          <span className="date">
            {new Date(article.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <button
          type="button"
          className={`btn btn-sm pull-xs-right ${
            article.favorited ? "btn-primary" : "btn-outline-primary"
          }`}
          disabled={favoritePending}
          onClick={() => {
            void onFavoriteClick();
          }}
        >
          <i className="ion-heart" /> {article.favoritesCount}
        </button>
      </div>
      <Link to={`/${encodeURIComponent(article.slug)}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
      </Link>
    </div>
  );
};

export default ArticleItem;

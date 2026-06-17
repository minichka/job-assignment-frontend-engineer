import { deleteArticle } from "api/articles";
import { ApiError } from "api/client";
import type { Article as ArticleModel } from "features/articles/articlesSlice";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAppSelector } from "store";

const PLACEHOLDER_AVATAR = "http://i.imgur.com/Qr71crq.jpg";

type ArticleProps = {
  article: ArticleModel;
  isOwnArticle: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Article({ article, isOwnArticle }: ArticleProps) {
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { author } = article;
  const avatarSrc = author.image || PLACEHOLDER_AVATAR;

  useEffect(() => {
    setDeleteError(null);
  }, [article.slug]);

  const handleDeleteArticle = useCallback(async () => {
    if (!isOwnArticle || token == null || token === "") {
      return;
    }
    setDeleteError(null);
    setDeleteInProgress(true);
    try {
      await deleteArticle(article.slug, { token });
      navigate("/", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        setDeleteError(e.message);
      } else {
        setDeleteError("Failed to delete article.");
      }
    } finally {
      setDeleteInProgress(false);
    }
  }, [isOwnArticle, article.slug, token, navigate]);

  const metaActions = isOwnArticle ? (
    <>
      <Link
        to={`/editor/${encodeURIComponent(article.slug)}`}
        className="btn btn-sm btn-outline-secondary"
      >
        <i className="ion-edit" />
        &nbsp; Edit Post
      </Link>
      &nbsp;&nbsp;
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        disabled={deleteInProgress}
        onClick={() => {
          void handleDeleteArticle();
        }}
      >
        <i className="ion-trash-a" />
        &nbsp; Delete Post
      </button>
    </>
  ) : (
    <>
      <button type="button" className="btn btn-sm btn-outline-secondary">
        <i className="ion-plus-round" />
        &nbsp; Follow {author.username}{" "}
        <span className="counter">(0)</span>
      </button>
      &nbsp;&nbsp;
      <button type="button" className="btn btn-sm btn-outline-primary">
        <i className="ion-heart" />
        &nbsp; Favorite Post <span className="counter">({article.favoritesCount})</span>
      </button>
    </>
  );

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>

          {isOwnArticle && deleteError != null && deleteError !== "" ? (
            <ul className="error-messages">
              <li>{deleteError}</li>
            </ul>
          ) : null}

          <div className="article-meta">
            <Link to={`/profile/${encodeURIComponent(author.username)}`}>
              <img src={avatarSrc} alt="" />
            </Link>
            <div className="info">
              <Link to={`/profile/${encodeURIComponent(author.username)}`} className="author">
                {author.username}
              </Link>
              <span className="date">{formatDate(article.createdAt)}</span>
            </div>
            {metaActions}
          </div>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12 article-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
          </div>
        </div>

        <hr />

        <div className="article-actions">
          <div className="article-meta">
            <Link to={`/profile/${encodeURIComponent(author.username)}`}>
              <img src={avatarSrc} alt="" />
            </Link>
            <div className="info">
              <Link to={`/profile/${encodeURIComponent(author.username)}`} className="author">
                {author.username}
              </Link>
              <span className="date">{formatDate(article.createdAt)}</span>
            </div>
            {metaActions}
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            <form className="card comment-form">
              <div className="card-block">
                <textarea className="form-control" placeholder="Write a comment..." rows={3} />
              </div>
              <div className="card-footer">
                <img src={avatarSrc} className="comment-author-img" alt="" />
                <button type="button" className="btn btn-sm btn-primary">
                  Post Comment
                </button>
              </div>
            </form>

            <div className="card">
              <div className="card-block">
                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
              </div>
              <div className="card-footer">
                <Link to="/profile/jacobschmidt" className="comment-author">
                  <img src="http://i.imgur.com/Qr71crq.jpg" className="comment-author-img" alt="" />
                </Link>
                &nbsp;
                <Link to="/profile/jacobschmidt" className="comment-author">
                  Jacob Schmidt
                </Link>
                <span className="date-posted">Dec 29th</span>
              </div>
            </div>

            <div className="card">
              <div className="card-block">
                <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
              </div>
              <div className="card-footer">
                <Link to="/profile/jacobschmidt" className="comment-author">
                  <img src="http://i.imgur.com/Qr71crq.jpg" className="comment-author-img" alt="" />
                </Link>
                &nbsp;
                <Link to="/profile/jacobschmidt" className="comment-author">
                  Jacob Schmidt
                </Link>
                <span className="date-posted">Dec 29th</span>
                <span className="mod-options">
                  <i className="ion-edit" />
                  <i className="ion-trash-a" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

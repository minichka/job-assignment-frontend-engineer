import type { Article } from "api/articles";
import type { Profile as ProfileModel } from "api/profiles";
import ArticleItem from "components/articles/ArticleItem";
import { NavLink } from "react-router-dom";

const PLACEHOLDER_AVATAR = "http://i.imgur.com/Qr71crq.jpg";

type ProfileProps = {
  profile: ProfileModel;
  username: string;
  articles: Article[];
  articlesLoading: boolean;
  articlesError: string | null;
  onArticleFavoriteUpdated?: () => void;
};

export default function Profile({
  profile,
  username,
  articles,
  articlesLoading,
  articlesError,
  onArticleFavoriteUpdated,
}: ProfileProps) {
  const avatarSrc = profile.image || PLACEHOLDER_AVATAR;
  const basePath = `/profile/${encodeURIComponent(username)}`;

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={avatarSrc} className="user-img" alt="" />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              <button type="button" className="btn btn-sm btn-outline-secondary action-btn">
                <i className="ion-plus-round" />
                &nbsp; Follow {profile.username}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end to={basePath}>
                    My Articles
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    to={`${basePath}/favorites`}
                  >
                    Favorited Articles
                  </NavLink>
                </li>
              </ul>
            </div>

            {articlesError != null ? (
              <p>{articlesError}</p>
            ) : articlesLoading ? (
              <p>Loading articles...</p>
            ) : articles.length === 0 ? (
              <p>No articles are here... yet.</p>
            ) : (
              articles.map((article) => (
                <ArticleItem
                  key={article.slug}
                  article={article}
                  onFavoriteUpdated={onArticleFavoriteUpdated}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Article } from "api/articles";
import { fetchArticles } from "api/articles";
import Profile from "components/profile/Profile";
import PageWrapper from "components/common/PageWrapper";
import { loadProfile } from "features/profile/profileSlice";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "store";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const profileLoading = useAppSelector((state) => state.profile.loading);
  const profileError = useAppSelector((state) => state.profile.error);
  const token = useAppSelector((state) => state.auth.token);

  const favoritesTab = pathname.endsWith("/favorites");

  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [articlesRefreshKey, setArticlesRefreshKey] = useState(0);

  useEffect(() => {
    if (username == null || username === "") {
      return;
    }
    dispatch(loadProfile({ username, token }));
  }, [dispatch, username, token]);

  useEffect(() => {
    if (username == null || username === "") {
      return;
    }
    let cancelled = false;
    setArticlesLoading(true);
    setArticlesError(null);
    const params = favoritesTab ? { favorited: username } : { author: username };
    fetchArticles(params, token != null ? { token } : undefined)
      .then((res) => {
        if (!cancelled) {
          setArticles(res.articles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticlesError("Failed to load articles");
          setArticles([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setArticlesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username, favoritesTab, token, articlesRefreshKey]);

  const onArticleFavoriteUpdated = useCallback(() => {
    setArticlesRefreshKey((k) => k + 1);
  }, []);

  const showProfileLoading = profileLoading || (profile == null && profileError == null);

  if (showProfileLoading) {
    return (
      <PageWrapper>
        <p>Loading...</p>
      </PageWrapper>
    );
  }

  if (profileError != null && profile == null) {
    return (
      <PageWrapper>
        <p>{profileError}</p>
      </PageWrapper>
    );
  }

  if (profile != null && username != null && username !== "") {
    return (
      <Profile
        profile={profile}
        username={username}
        articles={articles}
        articlesLoading={articlesLoading}
        articlesError={articlesError}
        onArticleFavoriteUpdated={onArticleFavoriteUpdated}
      />
    );
  }

  return (
    <PageWrapper>
      <p>Profile not found.</p>
    </PageWrapper>
  );
};

export default ProfilePage;

import type { Profile } from "./profiles";
import { apiDelete, apiGetJson, apiPostJson } from "./client";
import type { ApiRequestOptions } from "./client";

/** Conduit `Article` as returned by the API (uses `slug`, not numeric `id`). */
export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
};

export type MultipleArticlesResponse = {
  articles: Article[];
  articlesCount: number;
};

export type SingleArticleResponse = {
  article: Article;
};

export type NewArticle = {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
};
export type CreateArticleRequestBody = {
  article: NewArticle;
};

export type FetchArticlesParams = {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
};

function articlesListPath(params?: FetchArticlesParams): string {
  const search = new URLSearchParams();
  if (params?.tag) {
    search.set("tag", params.tag);
  }
  if (params?.author) {
    search.set("author", params.author);
  }
  if (params?.favorited) {
    search.set("favorited", params.favorited);
  }
  if (params?.limit != null) {
    search.set("limit", String(params.limit));
  }
  if (params?.offset != null) {
    search.set("offset", String(params.offset));
  }
  const query = search.toString();
  return query === "" ? "/articles" : `/articles?${query}`;
}

/** `GET /articles` — global list; auth optional (for correct `favorited` / `following`). */
export function fetchArticles(
  params?: FetchArticlesParams,
  options?: ApiRequestOptions
): Promise<MultipleArticlesResponse> {
  return apiGetJson<MultipleArticlesResponse>(articlesListPath(params), options);
}

/** `GET /articles/:slug` */
export function fetchArticleBySlug(
  slug: string,
  options?: ApiRequestOptions
): Promise<SingleArticleResponse> {
  return apiGetJson<SingleArticleResponse>(`/articles/${encodeURIComponent(slug)}`, options);
}

/** `POST /articles` — requires `options.token`. */
export function createArticle(
  article: NewArticle,
  options?: ApiRequestOptions
): Promise<SingleArticleResponse> {
  return apiPostJson<SingleArticleResponse>(`/articles`, { article }, options);
}

/** `DELETE /articles/:slug` — requires auth. */
export function deleteArticle(slug: string, options: ApiRequestOptions): Promise<void> {
  return apiDelete(`/articles/${encodeURIComponent(slug)}`, options);
}

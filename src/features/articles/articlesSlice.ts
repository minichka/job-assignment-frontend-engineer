import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Article, FetchArticlesParams } from "../../api/articles";
import { fetchArticles, fetchArticleBySlug } from "../../api/articles";

export type LoadArticlesArg = {
  params?: FetchArticlesParams;
  /** When set, favorite/follow flags match the logged-in user */
  token?: string | null;
};

export const loadArticles = createAsyncThunk(
  "articles/loadArticles",
  async (arg: LoadArticlesArg | void) => {
    const { params, token } = arg ?? {};
    return fetchArticles(params, token != null ? { token } : undefined);
  }
);

export type LoadArticleArg = {
  slug: string;
  /** When set, `favorited` reflects the logged-in user */
  token?: string | null;
};

export const loadArticle = createAsyncThunk("articles/loadArticle", async (arg: LoadArticleArg) => {
  const { slug, token } = arg;
  return fetchArticleBySlug(slug, token != null ? { token } : undefined);
});

type ArticlesState = {
  list: Article[];
  articlesCount: number;
  loading: boolean;
  /** Detail fetch only — avoids clashing with list `loading` */
  articleLoading: boolean;
  /** Detail fetch errors only — keeps list `error` separate */
  articleError: string | null;
  error: string | null;
  article: Article | null;
};

const initialState: ArticlesState = {
  list: [],
  articlesCount: 0,
  loading: false,
  articleLoading: false,
  articleError: null,
  error: null,
  article: null,
};

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.articles;
        state.articlesCount = action.payload.articlesCount;
      })
      .addCase(loadArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load articles";
      })
      .addCase(loadArticle.pending, (state) => {
        state.articleLoading = true;
        state.article = null;
        state.articleError = null;
      })
      .addCase(loadArticle.fulfilled, (state, action) => {
        state.articleLoading = false;
        state.articleError = null;
        state.article = action.payload.article;
      })
      .addCase(loadArticle.rejected, (state, action) => {
        state.articleLoading = false;
        state.articleError = action.error.message ?? "Failed to load article";
      });
  },
});

export type { Article };
export default articlesSlice.reducer;

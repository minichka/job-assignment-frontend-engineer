import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { fetchArticleBySlug } from "api/articles";
import type { Article } from "api/articles";
import articlesReducer from "features/articles/articlesSlice";
import authReducer from "features/auth/authSlice";
import profileReducer from "features/profile/profileSlice";
import ArticlePage from "pages/ArticlePage";
import { createMockArticle } from "tests/fixtures/article";

jest.mock("api/articles", () => ({
  ...jest.requireActual("api/articles"),
  fetchArticleBySlug: jest.fn(),
}));

jest.mock("react-markdown", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- jest mock factory
  const React = require("react");
  return {
    __esModule: true,
    default: function ReactMarkdown({ children }: { children: string }) {
      return React.createElement("div", { "data-testid": "article-markdown" }, children);
    },
  };
});

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: () => ({}),
}));

const mockedFetchArticleBySlug = fetchArticleBySlug as jest.MockedFunction<typeof fetchArticleBySlug>;

const articlesInitial = {
  list: [] as Article[],
  articlesCount: 0,
  loading: false,
  articleLoading: false,
  articleError: null as string | null,
  error: null as string | null,
  article: null as Article | null,
};

const profileInitial = {
  profile: null,
  loading: false,
  error: null as string | null,
};

function renderArticlePageAtSlug(
  slugPath: string,
  auth: { user: { email: string; token: string; username: string; bio: string; image: string } | null; token: string | null }
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      articles: articlesReducer,
      profile: profileReducer,
    },
    preloadedState: {
      auth: {
        ...auth,
        initialized: true,
      },
      articles: articlesInitial,
      profile: profileInitial,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[slugPath]}>
        <Routes>
          <Route path="/:slug" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("ArticlePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Edit Post and Delete Post when the logged-in user is the article author", async () => {
    const article = createMockArticle({
      slug: "published-slug",
      author: {
        username: "sameuser",
        bio: "",
        image: "",
        following: false,
      },
    });
    mockedFetchArticleBySlug.mockResolvedValue({ article });

    renderArticlePageAtSlug("/published-slug", {
      token: "jwt",
      user: {
        email: "same@example.com",
        token: "jwt",
        username: "sameuser",
        bio: "",
        image: "",
      },
    });

    await waitFor(() => {
      expect(mockedFetchArticleBySlug).toHaveBeenCalledWith("published-slug", { token: "jwt" });
    });

    expect(await screen.findByRole("heading", { name: article.title })).toBeInTheDocument();

    const editLinks = screen.getAllByRole("link", { name: /Edit Post/i });
    expect(editLinks.length).toBeGreaterThanOrEqual(1);
    expect(editLinks[0]).toHaveAttribute("href", "/editor/published-slug");

    expect(screen.getAllByRole("button", { name: /Delete Post/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("shows Follow and Favorite instead of edit/delete when another user is logged in", async () => {
    const article = createMockArticle({
      slug: "other-slug",
      author: { username: "authoruser", bio: "", image: "", following: false },
    });
    mockedFetchArticleBySlug.mockResolvedValue({ article });

    renderArticlePageAtSlug("/other-slug", {
      token: "jwt",
      user: {
        email: "fan@example.com",
        token: "jwt",
        username: "fanuser",
        bio: "",
        image: "",
      },
    });

    expect(await screen.findByRole("heading", { name: article.title })).toBeInTheDocument();

    expect(screen.queryByRole("link", { name: /Edit Post/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete Post/i })).not.toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: /Follow authoruser/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Favorite Post/i })[0]).toBeInTheDocument();
  });
});

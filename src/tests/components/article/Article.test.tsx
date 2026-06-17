import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { deleteArticle } from "api/articles";
import { ApiError } from "api/client";
import type { Article as ArticleModel } from "features/articles/articlesSlice";
import articlesReducer from "features/articles/articlesSlice";
import authReducer from "features/auth/authSlice";
import profileReducer from "features/profile/profileSlice";
import Article from "components/article/Article";
import { createMockArticle, sampleDragonArticle } from "tests/fixtures/article";

// eslint-disable-next-line no-var -- jest.mock is hoisted; binding must exist when the mock factory closes over it
var mockNavigate: jest.Mock;

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("api/articles", () => ({
  ...jest.requireActual("api/articles"),
  deleteArticle: jest.fn(),
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

mockNavigate = jest.fn();

const mockedDeleteArticle = deleteArticle as jest.MockedFunction<typeof deleteArticle>;

function renderArticle(
  article: ArticleModel,
  isOwnArticle: boolean,
  options?: { token?: string | null }
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      articles: articlesReducer,
      profile: profileReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: options?.token ?? null,
        initialized: true,
      },
      articles: {
        list: [],
        articlesCount: 0,
        loading: false,
        articleLoading: false,
        articleError: null,
        error: null,
        article: null,
      },
      profile: {
        profile: null,
        loading: false,
        error: null,
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Article article={article} isOwnArticle={isOwnArticle} />
      </MemoryRouter>
    </Provider>
  );
}

describe("Article", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDeleteArticle.mockResolvedValue(undefined);
  });

  it("renders title, author, formatted body, and favorite count for other users' articles", () => {
    const article = createMockArticle(sampleDragonArticle);
    renderArticle(article, false);

    expect(screen.getAllByRole("heading", { name: article.title })[0]).toBeInTheDocument();
    expect(screen.getAllByText("jake").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("article-markdown")).toHaveTextContent("Dragon tips");
    expect(screen.getByTestId("article-markdown")).toHaveTextContent("Roar carefully.");

    expect(screen.getAllByRole("button", { name: /Follow jake/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Favorite Post/i })[0]).toHaveTextContent("(7)");
  });

  it("shows edit and delete actions for own article", () => {
    const article = createMockArticle(sampleDragonArticle);
    renderArticle(article, true, { token: "sometoken" });

    const editLinks = screen.getAllByRole("link", { name: /Edit Post/i });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute("href", `/editor/${encodeURIComponent(article.slug)}`);

    const deleteButtons = screen.getAllByRole("button", { name: /Delete Post/i });
    expect(deleteButtons).toHaveLength(2);
  });

  it("does not call deleteArticle when delete is clicked without a token", async () => {
    const article = createMockArticle(sampleDragonArticle);
    renderArticle(article, true, { token: null });

    await userEvent.click(screen.getAllByRole("button", { name: /Delete Post/i })[0]);

    expect(mockedDeleteArticle).not.toHaveBeenCalled();
  });

  it("calls deleteArticle and navigates home after successful delete", async () => {
    const article = createMockArticle({ ...sampleDragonArticle, slug: "my-slug" });
    renderArticle(article, true, { token: "secret-token" });

    await userEvent.click(screen.getAllByRole("button", { name: /Delete Post/i })[0]);

    await waitFor(() => {
      expect(mockedDeleteArticle).toHaveBeenCalledWith("my-slug", { token: "secret-token" });
    });
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("shows API error message when delete fails", async () => {
    mockedDeleteArticle.mockRejectedValueOnce(new ApiError(422, { errors: { body: ["nope"] } }));

    const article = createMockArticle(sampleDragonArticle);
    renderArticle(article, true, { token: "secret-token" });

    const banner = screen.getByRole("heading", { name: article.title }).closest(".banner");
    expect(banner).not.toBeNull();
    await userEvent.click(screen.getAllByRole("button", { name: /Delete Post/i })[0]);

    await waitFor(() => {
      expect(within(banner as HTMLElement).getByRole("list")).toBeInTheDocument();
    });
    expect(screen.getByText(/API request failed with status 422/i)).toBeInTheDocument();
  });
});

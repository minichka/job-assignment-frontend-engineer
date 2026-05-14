import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Article } from "api/articles";
import ArticleList from "components/articles/ArticleList";
import { createMockArticle } from "tests/fixtures/article";

function renderArticleList(articles: Article[]) {
  return render(
    <MemoryRouter>
      <ArticleList articles={articles} />
    </MemoryRouter>
  );
}

function ListWithRoutes({ articles }: { articles: Article[] }) {
  return (
    <Routes>
      <Route path="/" element={<ArticleList articles={articles} />} />
      <Route path="/profile/:username" element={<div data-testid="route-profile" />} />
      <Route path="/:slug" element={<div data-testid="route-article" />} />
    </Routes>
  );
}

function renderArticleListWithNav(articles: Article[]) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <ListWithRoutes articles={articles} />
    </MemoryRouter>
  );
}

describe("ArticleList", () => {
  it("renders home banner and feed toggle", () => {
    renderArticleList([]);

    expect(screen.getByRole("heading", { name: /conduit/i })).toBeInTheDocument();
    expect(screen.getByText(/A place to share your knowledge/i)).toBeInTheDocument();
    expect(screen.getByText("Global Feed")).toBeInTheDocument();
    expect(screen.getByText("Your Feed")).toBeInTheDocument();
  });

  it("renders an ArticleItem for each article", () => {
    const articles = [
      createMockArticle({
        slug: "first",
        title: "First post",
        description: "First description",
        author: {
          username: "alice",
          bio: "",
          image: "",
          following: false,
        },
      }),
      createMockArticle({
        slug: "second",
        title: "Second post",
        description: "Second description",
        author: {
          username: "bob",
          bio: "",
          image: "",
          following: false,
        },
      }),
    ];

    const { container } = renderArticleList(articles);

    const previews = container.querySelectorAll(".article-preview");
    expect(previews).toHaveLength(2);

    const first = previews[0] as HTMLElement;
    expect(within(first).getByRole("heading", { name: "First post" })).toBeInTheDocument();
    expect(within(first).getByText("First description")).toBeInTheDocument();
    expect(within(first).getByText("alice")).toBeInTheDocument();

    const second = previews[1] as HTMLElement;
    expect(within(second).getByRole("heading", { name: "Second post" })).toBeInTheDocument();
    expect(within(second).getByText("Second description")).toBeInTheDocument();
    expect(within(second).getByText("bob")).toBeInTheDocument();
  });

  it("navigates to the article page when the user clicks the article title", async () => {
    const articles = [
      createMockArticle({
        slug: "clicked-slug",
        title: "Clickable article title",
        description: "Some description",
        author: {
          username: "author1",
          bio: "",
          image: "",
          following: false,
        },
      }),
    ];

    const { container } = renderArticleListWithNav(articles);

    const preview = container.querySelector(".article-preview") as HTMLElement;
    const titleLink = within(preview).getByRole("link", { name: /Clickable article title/i });
    expect(titleLink).toHaveAttribute("href", "/clicked-slug");

    await userEvent.click(titleLink);

    expect(screen.getByTestId("route-article")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /conduit/i })).not.toBeInTheDocument();
  });

  it("navigates to the author profile when the user clicks the author name", async () => {
    const articles = [
      createMockArticle({
        slug: "any-slug",
        title: "Another title",
        description: "Desc",
        author: {
          username: "profileUser",
          bio: "",
          image: "",
          following: false,
        },
      }),
    ];

    const { container } = renderArticleListWithNav(articles);

    const preview = container.querySelector(".article-preview") as HTMLElement;
    const authorLink = within(preview).getByRole("link", { name: /^profileUser$/ });
    expect(authorLink).toHaveAttribute("href", "/profile/profileUser");

    await userEvent.click(authorLink);

    expect(screen.getByTestId("route-profile")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /conduit/i })).not.toBeInTheDocument();
  });
});

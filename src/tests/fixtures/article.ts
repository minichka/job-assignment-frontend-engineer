import type { Article } from "api/articles";

const baseArticle: Article = {
  slug: "test-article-slug",
  title: "Test article title",
  description: "Test description",
  body: "Test body",
  tagList: [],
  createdAt: "2016-02-18T03:22:56.637Z",
  updatedAt: "2016-02-18T03:22:56.637Z",
  favorited: false,
  favoritesCount: 0,
  author: {
    username: "jake",
    bio: "",
    image: "",
    following: false,
  },
};

/** Builds a valid Conduit `Article` for tests; shallow merge plus merged `author`. */
export function createMockArticle(overrides: Partial<Article> = {}): Article {
  return {
    ...baseArticle,
    ...overrides,
    author: { ...baseArticle.author, ...(overrides.author ?? {}) },
  };
}

/** Demo-shaped fields used by `Article` component tests (markdown body, favorite count). */
export const sampleDragonArticle: Partial<Article> = {
  slug: "how-to-train-your-dragon",
  title: "How to train your dragon",
  description: "Ever wanted to?",
  body: "# Dragon tips\n\nRoar carefully.",
  tagList: ["dragons", "training"],
  favoritesCount: 7,
};

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import articlesReducer from "features/articles/articlesSlice";
import authReducer from "features/auth/authSlice";
import profileReducer from "features/profile/profileSlice";
import Header from "components/common/Header";

const articlesInitial = {
  list: [] as never[],
  articlesCount: 0,
  loading: false,
  articleLoading: false,
  articleError: null as string | null,
  error: null as string | null,
  article: null,
};

const profileInitial = {
  profile: null,
  loading: false,
  error: null as string | null,
};

const loggedInUser = {
  initialized: true,
  token: "jwt-token",
  user: {
    email: "user@example.com",
    token: "jwt-token",
    username: "loggedinuser",
    bio: "",
    image: "",
  },
};

function AppShell() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<div data-testid="route-home" />} />
        <Route path="/editor" element={<div data-testid="route-editor" />} />
        <Route path="/settings" element={<div data-testid="route-settings" />} />
        <Route path="/login" element={<div data-testid="route-login" />} />
        <Route path="/register" element={<div data-testid="route-register" />} />
        <Route path="/profile/:username" element={<div data-testid="route-profile" />} />
        <Route path="/logout" element={<div data-testid="route-logout" />} />
      </Routes>
    </>
  );
}

function renderWithAuthState(
  auth: {
    initialized: boolean;
    user: {
      email: string;
      token: string;
      username: string;
      bio: string;
      image: string;
    } | null;
    token: string | null;
  },
  options?: { initialEntry?: string }
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      articles: articlesReducer,
      profile: profileReducer,
    },
    preloadedState: {
      auth,
      articles: articlesInitial,
      profile: profileInitial,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[options?.initialEntry ?? "/"]}>
        <AppShell />
      </MemoryRouter>
    </Provider>
  );
}

describe("Header", () => {
  it("shows New Article and Settings links when the user is logged in", () => {
    renderWithAuthState(loggedInUser);

    const newArticle = screen.getByRole("link", { name: /New Article/i });
    expect(newArticle).toBeInTheDocument();
    expect(newArticle).toHaveAttribute("href", "/editor");

    const settings = screen.getByRole("link", { name: /Settings/i });
    expect(settings).toBeInTheDocument();
    expect(settings).toHaveAttribute("href", "/settings");

    expect(screen.getByRole("link", { name: "loggedinuser" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign out/i })).toBeInTheDocument();
  });

  it("does not show New Article or Settings when the user is not logged in", () => {
    renderWithAuthState({
      initialized: true,
      user: null,
      token: null,
    });

    expect(screen.queryByRole("link", { name: /New Article/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Settings/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign up/i })).toBeInTheDocument();
  });

  describe("navigation", () => {
    it("navigates to login and register when logged out", async () => {
      renderWithAuthState({
        initialized: true,
        user: null,
        token: null,
      });

      expect(screen.getByTestId("route-home")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /Sign in/i }));
      expect(screen.getByTestId("route-login")).toBeInTheDocument();
      expect(screen.queryByTestId("route-home")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /Sign up/i }));
      expect(screen.getByTestId("route-register")).toBeInTheDocument();
    });

    it("navigates home from the brand link and the Home nav link", async () => {
      renderWithAuthState(
        {
          initialized: true,
          user: null,
          token: null,
        },
        { initialEntry: "/login" }
      );

      expect(screen.getByTestId("route-login")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /conduit/i }));
      expect(screen.getByTestId("route-home")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /^Home$/i }));
      expect(screen.getByTestId("route-home")).toBeInTheDocument();
    });

    it("navigates to editor, settings, profile, and logout when logged in", async () => {
      renderWithAuthState(loggedInUser);

      expect(screen.getByTestId("route-home")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /New Article/i }));
      expect(screen.getByTestId("route-editor")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /Settings/i }));
      expect(screen.getByTestId("route-settings")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: "loggedinuser" }));
      expect(screen.getByTestId("route-profile")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /Sign out/i }));
      expect(screen.getByTestId("route-logout")).toBeInTheDocument();
    });

    it("navigates home from Home link and brand when starting on a nested route", async () => {
      renderWithAuthState(loggedInUser, { initialEntry: "/editor" });

      expect(screen.getByTestId("route-editor")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /^Home$/i }));
      expect(screen.getByTestId("route-home")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /New Article/i }));
      expect(screen.getByTestId("route-editor")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: /conduit/i }));
      expect(screen.getByTestId("route-home")).toBeInTheDocument();
    });
  });
});

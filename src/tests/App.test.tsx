import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";

import App from "App";
import { store } from "store";

jest.mock("react-markdown", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- jest factory runs outside TS import graph
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

test("renders conduit link", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const linkElement = screen.getAllByText(/conduit/i)[0];
  expect(linkElement).toBeInTheDocument();
});

import React from "react";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";

import App from "./App";
import { store } from "./store";

test("renders conduit link", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const linkElement = screen.getAllByText(/conduit/i)[0];
  expect(linkElement).toBeInTheDocument();
});

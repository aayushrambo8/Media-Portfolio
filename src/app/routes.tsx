import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Gallery } from "./components/Gallery";
import { About } from "./components/About";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "gallery", Component: Gallery },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);
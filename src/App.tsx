import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import BlogPostPage from "./components/BlogPostPage";
import ProjectPage from "./components/ProjectPage";
import Studio from "./pages/Studio";

// Data router (not <BrowserRouter>): the Studio's unsaved-changes guard
// relies on useBlocker, which requires the data-router context and throws
// — blanking the page — without it.
const router = createBrowserRouter([
  // Main single-page landing dashboard
  { path: "/", element: <Home /> },

  // Dynamic routing matching individual markdown logs
  { path: "/blogs/:slug", element: <BlogPostPage /> },
  { path: "/projects/:slug", element: <ProjectPage /> },
  { path: "/studio", element: <Studio /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

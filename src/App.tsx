import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BlogPostPage from "./components/BlogPostPage";
import ProjectPage from "./components/ProjectPage";
import Studio from "./pages/Studio";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main single-page landing dashboard */}
        <Route path="/" element={<Home />} />

        {/* Dynamic routing matching individual markdown logs */}
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </BrowserRouter>
  );
}

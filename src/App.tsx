// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BlogPostPage from "./components/BlogPostPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main single-page landing dashboard */}
        <Route path="/" element={<Home />} />

        {/* Dynamic routing matching individual markdown logs */}
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  );
}

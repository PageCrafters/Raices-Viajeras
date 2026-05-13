import { BrowserRouter, Routes, Route } from "react-router-dom";
import BlogPages from "./pages/BlogPage";
import ArticuloPages from "./pages/ArticulPage";
import ConocenosPages from "./pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Header />   {/* ← aquí, fuera de Routes */}
      <Routes>
        <Route path="/conocenos" element={<ConocenosPages />} />
        <Route path="/" element={<BlogPages />} />
        <Route path="/blog" element={<BlogPages />} />
        <Route path="/articulo" element={<ArticuloPages />} />
        <Route path="*" element={<BlogPages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
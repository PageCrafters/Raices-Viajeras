import { BrowserRouter, Routes, Route } from "react-router-dom";
import BlogPages from "./pages/BlogPage";
import ArticuloPages from "./pages/ArticulPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogPages />} />          {/* ← ruta raíz */}
        <Route path="/blog" element={<BlogPages />} />
        <Route path="/articulo" element={<ArticuloPages />} />
        <Route path="*" element={<BlogPages />} />          {/* ← comodín */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
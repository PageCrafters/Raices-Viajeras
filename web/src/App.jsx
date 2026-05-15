import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CartPage } from './components/CartPage'
import AboutPage from './pages/AboutPage'
import ArticulPage from './pages/ArticulPage'
import BlogPage from './pages/BlogPage'
import AdminPanel from './pages/AdminPanel'
import HomePage from './pages/HomePage'
import { DestinosView } from './views/DestinosView'
import { InfoAventuraView } from './views/InfoAventuraView'
import { ProvinciasView } from './views/ProvinciasView'

function AppRoutes({ shell }) {
  const { search } = useLocation()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/conocenos" element={<AboutPage />} />
      <Route path="/articulo" element={<ArticulPage />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/provincias" element={<ProvinciasView />} />
      <Route
        path="/destinos"
        element={<DestinosView search={search} onAddToCart={shell.handleAddItem} />}
      />
      <Route
        path="/info-aventura"
        element={<InfoAventuraView search={search} onAddToCart={shell.handleAddItem} />}
      />
      <Route
        path="/paga"
        element={
          <CartPage
            summary={shell.summary}
            isLoading={shell.isLoading}
            error={shell.pageError}
            onRetry={shell.handleRetryPage}
            onRemoveItem={shell.handleRemoveItem}
            isRemovingItem={shell.isRemovingItem}
            onCheckout={shell.handleCheckout}
            isCheckoutLoading={shell.isCheckoutLoading}
          />
        }
      />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/html/blog.html" element={<Navigate to="/blog" replace />} />
      <Route path="/html/conocenos.html" element={<Navigate to="/conocenos" replace />} />
      <Route path="/html/articulo.html" element={<Navigate to="/articulo" replace />} />
      <Route path="/html/admin.html" element={<Navigate to="/admin" replace />} />
      <Route path="/html/provincias.html" element={<Navigate to="/provincias" replace />} />
      <Route path="/html/destinos.html" element={<Navigate to="/destinos" replace />} />
      <Route path="/html/infoAventura.html" element={<Navigate to="/info-aventura" replace />} />
      <Route path="/html/paga.html" element={<Navigate to="/paga" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AppShell>
      {(shell) => {
        // Un solo shell global para que header, footer, toasts y cesta no se repitan en cada ruta.
        return <AppRoutes shell={shell} />
      }}
    </AppShell>
  )
}

export default App
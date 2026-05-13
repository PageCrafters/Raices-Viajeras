import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { CartPage } from './components/CartPage'
import { resolveRoute } from './lib/routes'
import { DestinosView } from './views/DestinosView'
import { HomeView } from './views/HomeView'
import { InfoAventuraView } from './views/InfoAventuraView'
import { ProvinciasView } from './views/ProvinciasView'

function App() {
  const [locationState, setLocationState] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }))

  const currentRoute = useMemo(() => resolveRoute(locationState.pathname), [locationState.pathname])

  useEffect(() => {
    const handlePopState = () => {
      setLocationState({
        pathname: window.location.pathname,
        search: window.location.search,
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <AppShell>
      {({
        summary,
        isLoading,
        pageError,
        handleRetryPage,
        handleRemoveItem,
        isRemovingItem,
        handleAddItem,
      }) => {
        if (currentRoute === 'home') {
          return <HomeView />
        }

        if (currentRoute === 'provincias') {
          return <ProvinciasView />
        }

        if (currentRoute === 'destinos') {
          return <DestinosView search={locationState.search} onAddToCart={handleAddItem} />
        }

        if (currentRoute === 'infoAventura') {
          return <InfoAventuraView search={locationState.search} onAddToCart={handleAddItem} />
        }

        return (
          <CartPage
            summary={summary}
            isLoading={isLoading}
            error={pageError}
            onRetry={handleRetryPage}
            onRemoveItem={handleRemoveItem}
            isRemovingItem={isRemovingItem}
          />
        )
      }}
    </AppShell>
  )
}

export default App

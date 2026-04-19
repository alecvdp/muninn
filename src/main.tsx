/* eslint-disable react-refresh/only-export-components */
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import App from './App'
import NotFoundPage from './pages/NotFoundPage'
import './index.css'

const BoardPage = lazy(() => import('./pages/BoardPage'))
const ToolsPage = lazy(() => import('./pages/ToolsPage'))
const AgentsPage = lazy(() => import('./pages/AgentsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Suspense><BoardPage /></Suspense>} />
            <Route path="tools" element={<Suspense><ToolsPage /></Suspense>} />
            <Route path="agents" element={<Suspense><AgentsPage /></Suspense>} />
            <Route path="settings" element={<Suspense><SettingsPage /></Suspense>} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

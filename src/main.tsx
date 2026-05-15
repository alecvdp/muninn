/* eslint-disable react-refresh/only-export-components */
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import App from './App'
import NotFoundPage from './pages/NotFoundPage'
import './index.css'

const OverviewPage = lazy(() => import('./pages/OverviewPage'))
const MemoriesPage = lazy(() => import('./pages/MemoriesPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
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
            <Route index element={<Suspense><OverviewPage /></Suspense>} />
            <Route path="memories" element={<Suspense><MemoriesPage /></Suspense>} />
            <Route path="sessions" element={<Suspense><AgentsPage /></Suspense>} />
            <Route path="projects" element={<Suspense><BoardPage /></Suspense>} />
            <Route path="insights" element={<Suspense><InsightsPage /></Suspense>} />
            <Route path="tools" element={<Suspense><ToolsPage /></Suspense>} />
            <Route path="settings" element={<Suspense><SettingsPage /></Suspense>} />
            {/* Back-compat redirects from previous routes */}
            <Route path="agents" element={<Navigate to="/sessions" replace />} />
            <Route path="board" element={<Navigate to="/projects" replace />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

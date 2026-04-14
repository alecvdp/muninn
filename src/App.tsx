import { Outlet } from 'react-router'
import { AppBar } from './components/layout/AppBar'
import { Navbar } from './components/layout/Navbar'
import { DetailPanel } from './components/layout/DetailPanel'
import { ToolDetail } from './components/detail/ToolDetail'
import { ProjectDetail } from './components/detail/ProjectDetail'
import { CreateProjectDetail } from './components/detail/CreateProjectDetail'
import { ErrorToast } from './components/ui/ErrorToast'
import { useToolsStore } from './store/tools'
import { useProjectsStore } from './store/projects'

function App() {
  const selectedToolId = useToolsStore((s) => s.selectedToolId)
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId)

  const renderDetailContent = () => {
    if (selectedToolId) return <ToolDetail key={selectedToolId} />
    if (selectedProjectId === 'new') return <CreateProjectDetail />
    if (selectedProjectId) return <ProjectDetail key={selectedProjectId} />
    return null
  }

  return (
    <div className="flex h-screen bg-surface text-normal">
      <AppBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <DetailPanel>
            {renderDetailContent()}
          </DetailPanel>
        </div>
      </div>
      <ErrorToast />
    </div>
  )
}

export default App

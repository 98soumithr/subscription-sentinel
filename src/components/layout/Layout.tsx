import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>
      <Sidebar />
      <main className="flex-1 ml-[240px] overflow-auto min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

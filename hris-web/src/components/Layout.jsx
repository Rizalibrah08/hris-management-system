import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="content">
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
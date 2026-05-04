import { useLocation } from 'react-router-dom'
import { menus } from '../utils/constants'

export default function TopBar() {
  const location = useLocation()
  const currentPath = location.pathname.replace('/', '') || 'dashboard'
  const currentMenu = menus.find((menu) => menu.key === currentPath)

  return (
    <header className="topbar">
      <div>
        <p className="section-label">{currentMenu?.label || 'Dashboard'}</p>
        <h2>Human Resource Information System (HRIS) Terpadu Berbasis Cloud</h2>
      </div>
      <input placeholder="Cari karyawan, payroll, atau approval..." />
    </header>
  )
}
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { menus, canRunPayroll } from '../utils/constants'

export default function Sidebar() {
  const { role, logout } = useAuth()

  const visibleMenus = menus.filter((menu) => {
    if (menu.key === 'payroll' && !canRunPayroll(role)) return false
    return true
  })

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>Cloud HRIS</h1>
        <p>Workspace Console</p>
      </div>
      <nav className="menu">
        {visibleMenus.map((menu) => (
          <NavLink
            key={menu.key}
            to={`/${menu.key}`}
            className={({ isActive }) =>
              `menu-item${isActive ? ' active' : ''}`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>
      <div className="user-card">
        <strong>Rani Amelia</strong>
        <p>{role || 'HR Administrator'}</p>
        <button type="button" className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
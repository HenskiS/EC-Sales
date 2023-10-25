import { Navigate, Outlet } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'

const AdminRoute = () => {
    const tokenString = sessionStorage.getItem('UserInfo');
    let user = (tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    let admin = false
    if (user) {
        admin = (user.roles.includes("Admin"))
    }
    console.log("admin: " + admin)
    return (
        admin ? <AdminDashboard /> : <Navigate to='/order'/>
    )
}
export default AdminRoute
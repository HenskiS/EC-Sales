import { Navigate, Outlet } from 'react-router-dom'
const PrivateRoutes = () => {
    const tokenString = sessionStorage.getItem('token');
    const token = (tokenString !== 'undefined') ? tokenString : null;

    return (
        token ? <Outlet/> : <Navigate to='/auth'/>
    )
}
export default PrivateRoutes
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import axios, {config} from '../api/axios';
import {useEffect} from 'react'

const PrivateRoutes = () => {
    const tokenString = sessionStorage.getItem('token');
    const token = (tokenString !== 'undefined') ? tokenString : null;

    // if offline, navigate to /offline
    const getOnLineStatus = () =>
        typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
            ? navigator.onLine
            : true;
    const online = getOnLineStatus()
    if (!online) {
        console.log("offline")
        return <Navigate to='offline'/>
    }

    // if token, and not localstorage stuff, get and store cigars, clients, CATax
    if (token) {
        const getTax = async () => {
            try {
                const response = await axios.get("/api/orders/catax/", config());
                console.log("cached CA tax info");
                // localstore the response.data
                localStorage.setItem("catax", response.data)
                //setTaxCents(response.data);
            } catch (err) { console.error(err); }
        }
        const getCigars = async (isIntl) => {
            let endpoint = "/api/cigars/"
            if (isIntl) endpoint += "intl"
            try {
                const response = await axios.get(endpoint, config());
                console.log("cached cigars");
                localStorage.setItem(isIntl? "intlCigars" : "cigars", JSON.stringify(response.data))
            } catch (err) { console.error(err); }
        }
        const getClients = async () => {
            try {
                const response = await axios.get("/api/clients/", config());
                console.log("cached clients");
                let clients = response.data.sort((a,b)=>{
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) < (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return -1;
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) > (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return 1;
                    return 0;
                }).filter(n => (" " + n.company?.toLowerCase() + n.name?.toLowerCase()).length > 1 && (n.hasOwnProperty("company") || (n.hasOwnProperty("name") && n.name !== " ")))
                localStorage.setItem("clients", JSON.stringify(clients));
            } catch (err) { console.error(err); }
        }

        if (!localStorage.getItem("catax")) {
            getTax()
        }
        if (!localStorage.getItem("clients")) {
            getClients()
        }
        if (!localStorage.getItem("cigars")) {
            getCigars(true)
            getCigars(false)
        }
    }

    // if online and no token, navigate to /auth
    return (
        token ? <Outlet/> : <Navigate to='/auth'/>
    )

}
export default PrivateRoutes
import { Fragment, useEffect, useState } from "react";
import axios from "../api/axios.js";
import {config} from "../api/axios.js";
import RepInfo from "../components/RepInfo.js";
import UserList from "../components/UserList.js";
import Orders from "../components/Orders.js";
import Tax from "../components/Tax.js";
import Emails from "../components/Emails.js";
import CigarsController from "../components/CigarsController.js";

const AdminDashboard = () => {

    const [totals, setTotals] = useState([])
    

    const getSalesmanTotal = async (id) => {
        console.log("getSalesmanTotal")
        let total = 0
        try {
            const response = await axios.post("/api/orders/salesmantotal", {id}, config());
            console.log("got salesman total");
            console.log(response);
            total = response.data;
            //setEditClient(response.data);
        } catch (err) { console.error(err); }
        return total
    }

    return (
        <div className="admin content">
            <h1>Admin Dashboard</h1>

            <UserList />
            <Tax />
            <Emails />
            <Orders />
            <CigarsController />
            
        </div>
    );
}

export default AdminDashboard
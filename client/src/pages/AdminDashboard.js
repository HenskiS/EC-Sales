import { Fragment, useEffect, useState } from "react";
import axios from "../api/axios.js";

const AdminDashboard = () => {

    const [users, setUsers] = useState([])

    useEffect(() => {
        const getUsers = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("/users/", config);
                console.log("got users info");
                console.log(response);
                setUsers(response.data);
                //setEditClient(response.data);
            } catch (err) { console.error(err); }
        }
        getUsers();
    } ,[])


    return (
        <div className="admin content">
            <h1>Admin Dashboard</h1>
            {users.map((user, index) => (
                <Fragment key={index}>
                    <p>{user.name}</p>
                </Fragment>
            ))}
        </div>
    );
}

export default AdminDashboard
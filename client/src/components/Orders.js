import { Fragment, useEffect, useState } from "react";
import axios from "../api/axios";

const Orders = () => {

    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [totals, setTotals] = useState([])

    const getSalesmanTotal = async (id) => {
        console.log("getSalesmanTotal")
        let total = 0
        try {
            const token = JSON.parse(sessionStorage.getItem('token'));
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.post("/orders/salesmantotal", {id}, config);
            console.log("got salesman total");
            console.log(response);
            total = response.data;
            //setEditClient(response.data);
        } catch (err) { console.error(err); }
        return total
    }
    useEffect(() => {
        const getUsers = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("/users/", config);
                //console.log("got users info");
                //console.log(response);
                setUsers(response.data);
                let temp = []
                for (let i=0; i<response.data.length; i++) {
                    let t = await getSalesmanTotal(response.data[i]._id)
                    temp.push(t)
                }
                setTotals(temp)
                //console.log("temp:")
                //console.log(temp)
            } catch (err) { console.error(err); }
        }
        getUsers();
    }, [])
    useEffect(() => {
        const getOrders = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("/orders/ordersminuscigars/", config);
                console.log("got orders info");
                console.log(response);
                setOrders(response.data.reverse());
            } catch (err) { console.error(err); }
        }
        getOrders();
    }, [])


    return (
        <Fragment>
            <br />
            <h3>Sales Totals</h3>
            <hr />
            {totals.map((total, index) => (
                <p key={index}>{users[index].name}: ${total}</p>
            ))}
            <br />
            <h3>Orders</h3>
            <hr />
            {!orders.length? <></> : orders.map((order, index) => (
                <Fragment key={index}>
                    <p>{new Date(order.date).toLocaleDateString()} - ${order.cigars.total}, {order.salesman.name} to {order.client.name}</p>
                    
                </Fragment>
            ))}
        </Fragment>
    )

}

export default Orders
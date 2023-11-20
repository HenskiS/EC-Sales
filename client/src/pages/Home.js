import { useState, useEffect, Fragment, useRef } from 'react';
import { useSearchParams } from "react-router-dom"
import CigarList from '../components/CigarList';
import CigarOrderList from '../components/CigarOrderList';
import useFetch from '../hooks/useFetch';
import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router';
import axios from 'axios';
import ClientSelect from '../components/ClientSelect';


const cigarsToString = (cigars) => {
    const notHiddenCigars = cigars.filter(function (cigar) {
        return !cigar.hidden;
    });
    return notHiddenCigars.map((cigar) => {
        let s = cigar.brand;
        s += " " + cigar.name;
        s += cigar.blend !== "" ? " " + cigar.blend : "";
        s += " " + cigar.size;
        s += ", Qty: " + cigar.qty;
        s += cigar.discount === "" ? "" : cigar.discount === "100" ? " Discount: Box" : " Discount: " + cigar.discount + "%";
        return s;
    })
}
const submitOrder = async (cigars, orderSubtotal, orderTotal, client, salesman) => {
    if (client.name === "") {
        alert("No client selected!");
        return;}
    if (cigars.length === 0) {
        alert("No cigars added!");
        return;}
    
    const token = JSON.parse(sessionStorage.getItem('token'));
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.post("http://192.168.1.102:3001/orders/add", 
        {client, salesman, cigars: {cigars: cigarsToString(cigars),
                                    subtotal:orderSubtotal,
                                    total:orderTotal}}, config);
    console.log("Order submission response:");
    console.log(response);
    if ("success" in response.data) {
        alert("Order Submission Successful!") 
        window.location.reload()
    }
}

const Home = (props) => {

    const previousCigars= [];
    const [cigars, setCigars] = useState([]);
    const [orderSubtotal, setOrderSubtotal] = useState();
    const [orderTotal, setOrderTotal] = useState();
    
    const [queryParameters] = useSearchParams();
    const [clientName, setClientName] = useState(queryParameters.get("name"));
    const [clientID, setClientID] = useState(queryParameters.get("id"));
    //console.log("Client ID: " + clientID);

    
    const [client, setClient] = useState({
        _id: "",
        name: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: ""
    });
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const getClient = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.post("http://192.168.1.102:3001/clients/getclientbyid", {id: clientID}, config);
                console.log("got client info");
                //console.log(response);
                setClient(response.data);
                const response2 = await axios.post("http://192.168.1.102:3001/orders/getordersbyclientid", {id: clientID}, config);
                setOrders(response2.data);
            } catch (err) { console.error(err); }
        }
        if (clientID) {
            getClient()
            .catch(console.error);
        }
        //console.log("client");
        //console.log(client);
        //else setIsEditing(true);
    }, [clientID]);

    const setOrderPrice = (subtotal, total) => {
        setOrderSubtotal(subtotal);
        setOrderTotal(total);
    }

    const uinfo = sessionStorage.getItem('UserInfo')
    const UserInfo = uinfo ? JSON.parse(uinfo) : {name: "", userID: ""}


    return ( 
        <div className='home content'>
            <h1>Client Order Form</h1>
            {/* Client and Salesman Info */}
            <div className="client-and-salesrep">
                <div className="client">
                    {/*<input type='text' className='cust-input' placeholder="" value={client.name}></input>*/}
                    {/*<p>949-555-0179 <br /> 124 Conch St. <br /> San Clemente <br /> CA 92673</p>*/}
                    <div className="client-info-home">
                        <ClientSelect setClientID={setClientID} />
                        {/*<p className="client-name">{client.name}</p>*/}
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address1}</p>
                        <p className="client-address">{client.address2}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
                    </div>
                </div>
                <div className="salesrep">
                    <p>Esteban Carreras </p> 
                    <p>915 Calle Amanecer </p> 
                    <p>San Clemente </p> 
                    <p>CA 92673 </p> 
                    <p>{UserInfo.name} </p> 
                    {/*<p>joe@estebancarreras.com</p>*/}
                </div>
            </div>
            <h3>Cigars</h3>
            {cigars && <CigarOrderList cigars={cigars} setOrderPrice={setOrderPrice} displayButton />}
            <hr />
            
            <div className="submit-order">
                <button className='submit-button' onClick={() => {
                    console.log(orderSubtotal+", "+orderTotal);
                    console.log(cigarsToString(cigars));
                    submitOrder(cigars, orderSubtotal, orderTotal, client, {_id: UserInfo.userID, name: UserInfo.name});
                }}>Submit Order</button>
            </div>
            <hr />
            {/*console.log(orders)*/}
            {!orders.length? <></> : <h3>Previously Ordered Cigars</h3>}
            {!orders.length? <></> : orders.map((order, index) => (
                <Fragment key={index}>
                    <h4>{new Date(order.date).toLocaleDateString()} - ${order.cigars.total}</h4>
                    <ul>
                    {order.cigars.cigars.map((cigar, index) => (
                        <li key={index}>{cigar}</li>
                    ))}
                    </ul>
                </Fragment>
            ))}
        </div>
    );
}

export default Home;

import { useState, useEffect, Fragment, useRef } from 'react';
import { useSearchParams } from "react-router-dom"
import CigarList from '../components/CigarList';
import CigarOrderList2 from '../components/CigarOrderList2';
import useFetch from '../hooks/useFetch';
import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router';
import axios from '../api/axios';
import {config} from "../api/axios.js";
import ClientSelect from '../components/ClientSelect';
import { ReactMultiEmail, isEmail } from 'react-multi-email'
import 'react-multi-email/dist/style.css';


const cigarsToString = (cigars) => {
    const notZeroCigars = cigars.filter(function (cigar) {
        return cigar.qty > 0;
    });
    return notZeroCigars.map((cigar) => {
        let s = "";//cigar.brand;
        s += cigar.brandAndName; //" " + cigar.name;
        if (cigar.hasOwnProperty("blend")) {
            if (cigar.blend !== "") s += " " + cigar.blend
        }
        s += " " + cigar.sizeName;
        s += ", Qty: " + cigar.qty;
        if (cigar.hasOwnProperty("discount")) {
            if (cigar.discount !== "") s += ", Discount: " + cigar.discount + "%"
        }
        return s;
    });
}
const updateClient = async (client) => {
    try {
        const response = await axios.post("/api/clients/updateclientbyid", {editClient: client}, config());
        console.log("updated client info");
        console.log(response);
    } catch (err) { console.error(err); }
}
const submitOrder = async (cigars, orderSubtotal, orderTotal, client, salesman, emails) => {
    if (client.name === "") {
        alert("No client selected!");
        return;}
    if (cigars.length === 0) {
        alert("No cigars added!");
        return;}
    
    const response = await axios.post("/api/orders/add", 
        {client, salesman,  cigars: {cigars: cigarsToString(cigars),
                                    subtotal:orderSubtotal,
                                    tax:orderTotal.tax,
                                    total:orderTotal.total,
                                    discount:orderTotal.tax + orderSubtotal - orderTotal.total},
                            cigarData: cigars.filter(function (cigar) {
                                return cigar.qty > 0;
                            }),
                            emails: emails}, config());
    console.log("Order submission response:");
    console.log(response);
    updateClient(client)
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
    const [emails, setEmails] = useState([]);

    
    const [client, setClient] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        corediscount: ""
    });
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.post("/api/clients/getclientbyid", {id: clientID}, config());
                console.log("got client info");
                console.log(response);
                setClient(response.data);
                if (response.data.hasOwnProperty("corediscount")) {
                    setClient(response.data)
                } else setClient({...response.data, corediscount: ""})
                const response2 = await axios.post("/api/orders/getordersbyclientid", {id: clientID}, config());
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
                        { <ClientSelect setClientID={setClientID} /> }
                        {!clientID? <></> :
                        <>
                        {/* client.company? <p className="client-name">{client.company}</p> : <p className="client-name">{client.name}</p> */}
                        <p className="client-phone">{client.email}</p>
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address1}</p>
                        <p className="client-address">{client.address2}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
                        {client._id !== "" && <span className="ca-tax-span">
                            <label htmlFor="tax-input">Core Line Discount:</label>
                            <input type="number" className="ca-tax-input" id="tax-input" value={client.corediscount} onChange={(e) => setClient({...client, corediscount: e.target.value})} />
                        </span>}
                        </>
                        }
                    </div>
                </div>
                <div className="salesrep">
                    <p>Esteban Carreras Cigar Co.</p> 
                    <p>6505 Ladera Brisa </p> 
                    <p>San Clemente </p> 
                    <p>CA 92673 </p> 
                    <p>{UserInfo.name} </p> 
                    {/*<p>joe@estebancarreras.com</p>*/}
                </div>
            </div>
            <h3>Cigars</h3>
            {clientID && cigars && <CigarOrderList2 client={client} setClient={setClient} cigars={cigars} setOrderPrice={setOrderPrice} taxes={client.state.toUpperCase().startsWith("CA")} corediscount={client.hasOwnProperty("corediscount")? client.corediscount : ""} />}
            <hr />
            
            <div className="cc-emails">
                <label>CC Order Summary (optional):</label>
                <ReactMultiEmail 
                    placeholder='Input email address(es)'
                    emails={emails}
                    onChange={(emails) => {setEmails(emails)}}
                    getLabel={(email, index, removeEmail) => (
                        <div data-tag key={index}>
                        <div data-tag-item>{email}</div>
                        <span data-tag-handle onClick={() => removeEmail(index)}>×</span>
                        </div>
                    )}/>
            </div>

            <div className="submit-order">
                <button className='submit-button' onClick={() => {
                    console.log(orderSubtotal+", "+orderTotal);
                    console.log(cigarsToString(cigars));
                    submitOrder(cigars, orderSubtotal, orderTotal, client, {_id: UserInfo.userID, name: UserInfo.name, email: UserInfo.email}, emails);
                }}>Submit Order</button>
            </div>
            <hr />
            
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

import { Fragment, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { IoIosClose, IoMdCreate, IoMdPaper, IoMdTrash } from "react-icons/io"
import axios from '../api/axios';
import {config} from "../api/axios.js";

const ClientInfo = ({ id, close, addNameToList }) => {

    const tokenString = sessionStorage.getItem('UserInfo');
    let user = (tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    let isIntlUser = false
    if (user) {
        isIntlUser = user.roles.includes("International")
    }

    const [client, setClient] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        ext: "",
        mobile: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        corediscount: "",
        company: "",
        contact: "",
        website: "",
        title: "",
        country: "",
        isInternational: false,
    });
    const [editClient, setEditClient] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        ext: "",
        mobile: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        corediscount: "",
        company: "",
        contact: "",
        website: "",
        title: "",
        country: isIntlUser?"":"United States",
        isInternational: isIntlUser?true:false,
    });

    const [isEditing, setIsEditing] = useState(false);

    const updateClient = async () => {
        console.log("update client");
        if (editClient.company === "") {
            alert("Client must have a company");
            return;
        }
        if (client !== editClient) {
            console.log("there's been a change here...");
            try {
                const response = await axios.post("/api/clients/updateclientbyid", {editClient}, config());
                console.log("updated client info");
                console.log(response);
                setClient(editClient);
            } catch (err) { console.error(err); }
        }
        setIsEditing(false);
    }

    const addClient = async () => {
        if (editClient.company === "") {
            alert("Client must have a company");
            return;
        }
        if (editClient.address1 === "") {
            alert("Client must have an address");
            return;
        }
        console.log("add client");
        try {
            const response = await axios.post("/api/clients/add", {editClient}, config());
            if ("exists" in response.data) {alert("A client with this name already exists.");}
            else {
                console.log("added client:");
                console.log(response);
                setClient(editClient);
                setIsEditing(false);
                addNameToList(editClient.name);
                close();
            }
        } catch (err) { 
            console.error(err); 
        }
    }
    const deleteClient = async (id) => {
        if (window.confirm("Are you sure you want to delete " + client.name + "?")) {
            console.log("deleting client...")
            try {
                const response = await axios.post("/api/clients/delete", {id}, config());
                console.log("response:")
                console.log(response.data)
                close()
                window.location.reload()
            } catch (err) { 
                console.error(err); 
            }
        }
        else {
            console.log("not deleting " + client.name)
        }
    }

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.post("/api/clients/getclientbyid", {id}, config());
                console.log("got client info");
                console.log(response);
                setClient(response.data);
                setEditClient(response.data);
            } catch (err) { console.error(err); }
        }
        if (id !== "") {
            getClient()
            .catch(console.error);
        }
        else setIsEditing(true);
    }, []);
    

    return (
        !isEditing ?
        <div className="ClientInfo">
            <div className="clientinfo-header">
                {/*<h5>Info for Client {id}</h5>*/}
                <h2 className="client-name">{ client.hasOwnProperty("company") ? client.company : client.name }</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info">
                {/*<h4 className="client-name">{client.name}</h4>*/}
                { client.company? <p className="client-phone">Name: {client.name}</p> : <></> }
                { client.contact? <p className="client-phone">Contact: {client.contact}</p> : <></> }
                { client.title?   <p className="client-phone">Title: {client.title}</p> : <></> }
                <p className="client-phone">Email: {client.email}</p>
                <p className="client-phone">Phone: {client.phone} {client.ext ? "Ext: " + client.ext : ""}</p>
                <p className="client-address">Address 1: {client.address1}</p>
                { client.address2? <p className="client-address">Address 2: {client.address2}</p> : <></> }
                { client.mobile? <p className="client-address">Mobile: {client.mobile}</p> : <></> }
                <p className="client-city">City: {client.city}</p>
                <p className="client-state-and-zip">State: {client.state + " " + client.zip}</p>
                <p className="client-city">Country: {client.country}</p>
                { client.website? <p className="client-state-and-zip">Website: {client.website}</p> : <></> }
                { client.corediscount? <p className="client-state-and-zip">{client.corediscount + "% off core line cigars"}</p> : <></> }
            </div>
            <div className="clientinfo-footer">
                <IoMdCreate onClick={() => setIsEditing(true)} />
                <IoMdTrash onClick={() => deleteClient(id)} className="trashicon" />
                <div className="spacer"></div>
                <button className="client-button">
                    <Link to={"/order/?name="+(client.company? client.company : client.name)+"&id="+client._id}>
                        <IoMdPaper className="client-order-icon" />
                        Start Order
                    </Link>
                </button>
            </div>
        </div>
        :
        <div className="ClientInfo">
            <div className="clientinfo-header">
                {/*<h5>Info for Client {id}</h5>*/}
                <h2 className="client-name">{id === "" ? "New Client" : "Edit Client"}</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info">
                {/*<h4 className="client-name">{client.name}</h4>*/}
                {isIntlUser?<span>
                    <input type="checkbox" className="client-name" id="isInternational" checked={editClient.isInternational} onChange={e => setEditClient({...editClient, isInternational: e.target.checked})}/>
                    <label htmlFor="isInternational">International</label>
                </span> :null}
                <span>
                    <label htmlFor="company">Company</label>
                    <input type="text" className="client-name" id="company" defaultValue={editClient.company} onChange={e => setEditClient({...editClient, company: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="name">Name</label>
                    <input type="text" className="client-name" id="name" defaultValue={editClient.name} onChange={e => setEditClient({...editClient, name: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="contact">Contact</label>
                    <input type="text" className="client-name" id="contact" defaultValue={editClient.contact} onChange={e => setEditClient({...editClient, contact: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="title">Title</label>
                    <input type="text" className="client-name" id="title" defaultValue={editClient.title} onChange={e => setEditClient({...editClient, title: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="email">Email</label>
                    <input type="text" className="client-phone" id="email" defaultValue={editClient.email} onChange={e => setEditClient({...editClient, email: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="phone">Phone</label>
                    <input type="text" className="client-phone" id="phone" defaultValue={editClient.phone} onChange={e => setEditClient({...editClient, phone: e.target.value})}/>
                    <label id="client-ext-label" htmlFor="ext">Ext</label>
                    <input type="text" className="client-ext" id="ext" defaultValue={editClient.ext} onChange={e => setEditClient({...editClient, ext: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="mobile">Mobile</label>
                    <input type="text" className="client-address" id="mobile" defaultValue={editClient.mobile} onChange={e => setEditClient({...editClient, mobile: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="add1">Address 1</label>
                    <input type="text" className="client-address" id="add1"defaultValue={editClient.address1} onChange={e => setEditClient({...editClient, address1: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="add2">Address 2</label>
                    <input type="text" className="client-address" id="add2" defaultValue={editClient.address2} onChange={e => setEditClient({...editClient, address2: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="city">City</label>
                    <input type="text" className="client-city" id="city" defaultValue={editClient.city} onChange={e => setEditClient({...editClient, city: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="state">State</label>
                    <input type="text" className="client-state-and-zip" id="state" defaultValue={editClient.state} onChange={e => setEditClient({...editClient, state: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="zip">Zip</label>
                    <input type="text" className="client-state-and-zip" id="zip" defaultValue={editClient.zip} onChange={e => setEditClient({...editClient, zip: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="country">Country</label>
                    <input type="text" className="client-state-and-zip" id="country" defaultValue={editClient.country} onChange={e => setEditClient({...editClient, country: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="website">Website</label>
                    <input type="text" className="client-state-and-zip" id="website" defaultValue={editClient.website} onChange={e => setEditClient({...editClient, website: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="zip">Core Line Discount</label>
                    <input type="text" className="client-state-and-zip" id="zip" defaultValue={editClient.corediscount} onChange={e => setEditClient({...editClient, corediscount: e.target.value})}/>
                </span>
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <button onClick={() => {id === "" ? addClient() : updateClient();}}>Done</button>
            </div>
        </div>
    );
}
 
export default ClientInfo;

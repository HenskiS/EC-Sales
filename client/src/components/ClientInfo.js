import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { IoIosClose, IoMdCreate, IoMdPaper } from "react-icons/io"
import axios from "axios";

const ClientInfo = ({ id, close, addName }) => {
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
    const [editClient, setEditClient] = useState({
        _id: "",
        name: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: ""
    });

    const [isEditing, setIsEditing] = useState(false);

    const updateClient = async () => {
        console.log("update client");
        if (client !== editClient) {
            console.log("there's been a change here...");
            try {
                const response = await axios.post("http://192.168.1.133:3001/clients/updateclientbyid", {editClient});
                console.log("updated client info");
                console.log(response);
                setClient(editClient);
            } catch (err) { console.error(err); }
        }
        setIsEditing(false);
    }

    const addClient = async () => {
        if (editClient.name === "") {
            alert("Client must have a name");
            return;
        }
        console.log("add client");
        try {
            const response = await axios.post("http://192.168.1.133:3001/clients/add", {editClient});
            if ("exists" in response.data) {alert("A client with this name already exists.");}
            else {
                console.log("added client:");
                console.log(response);
                setClient(editClient);
                setIsEditing(false);
                addName(editClient.name);
                close();
            }
        } catch (err) { console.error(err); }
    }

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.post("http://192.168.1.133:3001/clients/getclientbyid", {id});
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
                <h2 className="client-name">{client.name}</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info">
                {/*<h4 className="client-name">{client.name}</h4>*/}
                <p className="client-phone">{client.phone}</p>
                <p className="client-address">{client.address1}</p>
                <p className="client-address">{client.address2}</p>
                <p className="client-city">{client.city}</p>
                <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <IoMdCreate onClick={() => setIsEditing(true)} />
                <button className="client-button">
                    <Link to={"/?name="+client.name+"&id="+client._id}>
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
                <span>
                    <label htmlFor="name">Name</label>
                    <input type="text" className="client-name" id="phone" defaultValue={editClient.name} onChange={e => setEditClient({...editClient, name: e.target.value})}/>
                </span>
                <span>
                    <label htmlFor="phone">Phone</label>
                    <input type="text" className="client-phone" id="phone" defaultValue={editClient.phone} onChange={e => setEditClient({...editClient, phone: e.target.value})}/>
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
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <button onClick={() => {id === "" ? addClient() : updateClient();}}>Done</button>
            </div>
        </div>
    );
}
 
export default ClientInfo;

import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { IoIosClose, IoMdCreate, IoMdPaper } from "react-icons/io"
import axios from "axios";

const RepInfo = ({ rep, close, addNameToList }) => {
    let id = 4;
    const [user, setUser] = useState(rep);
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

    const updateUser = async () => {
        
    }

    const addUser = async () => {
        
    }

    useEffect(() => {
        
    }, []);
    

    return (
        !isEditing ?
        <div className="ClientInfo">
            <div className="clientinfo-header">
                {/*<h5>Info for Client {id}</h5>*/}
                <h2 className="client-name">{user.name}</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info">
                {/*<h4 className="client-name">{client.name}</h4>*/}
                <p className="client-phone">Username: {user.username}</p>
                <p className="client-phone">Roles: {user.roles.join(", ")}</p>
                <p className="client-phone">Active: {user.active?"True":"False"}</p>
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <IoMdCreate onClick={() => setIsEditing(true)} />
                <button className="client-button">
                    <Link to={"/order/?name="+client.name+"&id="+client._id}>
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
                <h2 className="client-name">{id === "" ? "New User" : "Edit User"}</h2>
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
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <button onClick={() => {id === "" ? close() : close()/*addUser() : updateUser()*/;}}>Done</button>
            </div>
        </div>
    );
}
 
export default RepInfo;

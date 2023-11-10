import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { IoIosClose, IoMdCreate, IoMdPaper } from "react-icons/io"
import axios from "../api/axios";

const RepInfo = ({ rep, close, addNameToList }) => {
    let id = 4;
    const [user, setUser] = useState(rep?rep:{
        name: "",
        username: "",
        password: "",
        roles: [],
        active: true
    });
    const [editUser, setEditUser] = useState(rep?rep:{
        name: "",
        username: "",
        password: "",
        roles: []
    });

    const [isEmployee, setIsEmployee] = useState(rep? rep.roles.includes("Employee"):true)
    const [isAdmin, setIsAdmin] = useState(rep? rep.roles.includes("Admin"):false)
    const [isActive, setIsActive] = useState(rep?rep.active:true)
    const updateRoles = () => {
        let r = []
        if (isEmployee) r.push("Employee")
        if (isAdmin) r.push("Admin")
        setEditUser({...editUser, roles: r})//, active: isActive})
        if (rep) console.log(rep.roles)
        console.log(r)
    }

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [client, setClient] = useState({
        _id: "",
        name: "",
        username: "",
        roles: "",
        active: "",
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

    const [isEditing, setIsEditing] = useState(!rep);

    const updateUser = async () => {
        close()
    }

    const addUser = async () => {
        if (editUser.name === "") {
            alert("User must have a name");
            return;
        }
        if (!editUser.roles) {
            alert("User must have one or more roles");
            return;
        }
        if (password === "") {
            alert("Password cannot be blank")
            return
        }
        if (password!==confirmPassword) {
            alert("Passwords do not match")
            return
        }
        console.log("add user");
        try {
            const token = JSON.parse(sessionStorage.getItem('token'));
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            setEditUser({...editUser, password: password})
            console.log(editUser)
            const response = await axios.post("/users/", editUser, config);
            
                console.log("added client:");
                console.log(response);
                setUser(editUser);
                setIsEditing(false);
                addNameToList(editUser.name);
                close();
            
        } catch (err) { 
            console.error(err); 
            if (!err?.response) {
                alert("No server response");
            } else if (err.response?.status === 400) {
                alert("Name, Username, and Password are required");
            } else if (err.response?.status === 409) {
                alert("Username already taken")
            }
        }
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
                <h2 className="client-name">{rep? "Edit User" : "New User"}</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info-parent">
                <div className="client-info cileft">
                    {/*<h4 className="client-name">{client.name}</h4>*/}
                    <span>
                        <label htmlFor="name">Name</label>
                        <input type="text" className="client-name" id="name" defaultValue={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})}/>
                    </span>
                    <span>
                        <label htmlFor="username">Username</label>
                        <input type="text" className="client-phone" id="username" defaultValue={editUser.username} onChange={e => setEditUser({...editUser, username: e.target.value})}/>
                    </span>
                    <span>
                        <input type="checkbox" className="client-address checkbox" id="employee" checked={isEmployee} onChange={() => {setIsEmployee(!isEmployee); console.log(isEmployee); updateRoles()}}/>
                        <label htmlFor="employee"> Employee</label>
                        <input type="checkbox" className="client-address checkbox" id="admin" checked={isAdmin} onChange={() => {setIsAdmin(!isAdmin); console.log(isAdmin); updateRoles()}}/>
                        <label htmlFor="admin">Admin</label>
                    </span>
                    <span>
                        <input type="checkbox" id="active" className="checkbox" checked={isActive} onChange={()=>{setIsActive(!isActive); updateRoles()}}/>
                        <label htmlFor="active">Active</label>
                    </span>
                </div>
                {rep?<></>:<div className="client-info ciright">
                    <span>
                        <label htmlFor="pwd">Password</label>
                        <input type="password" className="client-phone" id="pwd" placeholder="" defaultValue={password} onChange={e => setPassword(e.target.value)}/>
                    </span>
                    <span>
                        <label htmlFor="cpwd">Confirm Password</label>
                        <input type="password" className="client-phone" id="cpwd" placeholder="" defaultValue={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}/>
                    </span>
                </div>}
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <button onClick={() => {rep ? updateUser() : addUser();}}>Done</button>
            </div>
        </div>
    );
}
 
export default RepInfo;

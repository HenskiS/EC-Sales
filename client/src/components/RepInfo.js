import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { IoIosClose, IoMdCreate, IoMdPaper } from "react-icons/io"
import axios from "../api/axios";
import {config} from "../api/axios.js";

const RepInfo = ({ rep, close, addNameToList }) => {

    const [user, setUser] = useState(rep?rep:{
        name: "",
        email: "",
        username: "",
        password: "",
        roles: []
    });
    const [editUser, setEditUser] = useState(rep?rep:{
        name: "",
        email: "",
        username: "",
        password: "",
        roles: []
    });

    const [isEmployee, setIsEmployee] = useState(rep? rep.roles.includes("Employee"):true)
    const [isAdmin, setIsAdmin] = useState(rep? rep.roles.includes("Admin"):false)
    const [isActive, setIsActive] = useState(rep?rep.active:true)
    useEffect(() => {
        let r = []
        if (isEmployee) r.push("Employee")
        if (isAdmin) r.push("Admin")
        setEditUser({...editUser, roles: r, active: isActive})
    }, [isEmployee, isAdmin, isActive])

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    
    const [isChangePassword, setIsChangePassword] = useState(rep? false : true) // true if new user

    const [isEditing, setIsEditing] = useState(!rep);

    const updateUser = async () => {
        if (editUser.name === rep.name &&
            editUser.username === rep.username &&
            editUser.email === rep.email &&
            editUser.roles.toString() === rep.roles.toString() &&
            editUser.active === rep.active &&
            !isChangePassword) {
            setIsEditing(false)
            return
        }
        if (editUser.name === "") {
            alert("User must have a name");
            return;
        }
        if (editUser.roles.length === 0) {
            alert("User must have one or more roles");
            return;
        }
        if (isChangePassword && password === "") {
            alert("Password cannot be blank")
            return
        }
        if (isChangePassword && password!==confirmPassword) {
            alert("Passwords do not match")
            return
        }
        console.log("update user");
        console.log(editUser)
        try {
            const response = await axios.patch("/api/users/", editUser, config());
            console.log(response.data.message);
            setUser(editUser);
            setIsEditing(false);
            addNameToList(editUser.name);
        } catch (err) { 
            console.error(err); 
            if (!err?.response) {
                alert("No server response");
            } else {
                alert(err.response.data.message)
            }
        }
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
        /*if (password === "") {
            alert("Password cannot be blank")
            return
        }*/
        if (password!==confirmPassword) {
            alert("Passwords do not match")
            return
        }
        console.log("add user");
        try {
            const response = await axios.post("/api/users/", editUser, config());
                console.log(response.data.message);
                setUser(editUser);
                setIsEditing(false);
                addNameToList(editUser.name);
                close();
            
        } catch (err) { 
            console.error(err); 
            if (!err?.response) {
                alert("No server response");
            } else {
                alert(err.response.data.message)
            }/*if (err.response?.status === 400) {
                alert("Name, Username, and Password are required");
            } else if (err.response?.status === 409) {
                alert("Username already taken")
            }*/
        }
    }


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
                <p className="client-phone">Email: {user.email}</p>
                <p className="client-phone">Roles: {user.roles.join(", ")}</p>
                <p className="client-phone">Active: {user.active?"True":"False"}</p>
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <IoMdCreate onClick={() => setIsEditing(true)} />
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
                        <label htmlFor="email">Email</label>
                        <input type="text" className="client-phone" id="email" defaultValue={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})}/>
                    </span>
                    <span>
                        <input type="checkbox" className="client-address checkbox" id="employee" checked={isEmployee} onChange={() => setIsEmployee(!isEmployee)}/>
                        <label htmlFor="employee"> Employee</label>
                        <input type="checkbox" className="client-address checkbox" id="admin" checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)}/>
                        <label htmlFor="admin">Admin</label>
                    </span>
                    <span>
                        <input type="checkbox" id="active" className="checkbox" checked={isActive} onChange={()=>{setIsActive(!isActive);}}/>
                        <label htmlFor="active">Active</label>
                    </span>
                </div>
                
                <div className="client-info ciright">
                    {!rep? <></> : <span>
                        <input type="checkbox" id="changepass" className="checkbox" checked={isChangePassword} onChange={()=>{setIsChangePassword(!isChangePassword);}}/>
                        <label htmlFor="changepass" className="changePassword">Change Password</label>
                    </span>}
                    <span>
                        <label htmlFor="pwd">Password</label>
                        <input disabled={!isChangePassword} type="password" className="client-phone" id="pwd" onChange={e => {setPassword(e.target.value); setEditUser({...editUser, password: e.target.value})}}/>
                    </span>
                    <span>
                        <label htmlFor="cpwd">Confirm Password</label>
                        <input disabled={!isChangePassword} type="password" className="client-phone" id="cpwd" onChange={e => setConfirmPassword(e.target.value)}/>
                    </span>
                </div>
            </div>
            <div className="clientinfo-footer">
                {/*<h5>Info for Client {id}</h5>*/}
                <button onClick={() => {rep ? updateUser() : addUser();}}>Done</button>
            </div>
        </div>
    );
}
 
export default RepInfo;

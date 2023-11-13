import { Fragment, useEffect, useState } from "react";
import axios from "../api/axios.js";
import RepInfo from "../components/RepInfo.js";

const UserList = () => {
    const [users, setUsers] = useState([])
    const [totals, setTotals] = useState([])
    const [repListCounter, setRepListCounter] = useState(0);

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
            } catch (err) { console.error(err); }
        }
        getUsers();
    }, [repListCounter])

    const [repInfo, setRepInfo] = useState(false);
    const [repInfoSrc, setRepInfoSrc] = useState();

    const getRepInfo = (infoSrc) => {
        setRepInfoSrc(users[infoSrc]);
        setRepInfo(true);
    }
    const addName = () => {
        console.log("adding name...")
        setRepListCounter(repListCounter+1)
    }

    return ( 
        <Fragment>
            {repInfo? <RepInfo rep={repInfoSrc} close={() => setRepInfo(false)} addNameToList={addName}/> : <></>}

            <h3>Users</h3>
            <div className="clientnames-list">
                <div className="cigar add-cigar">
                    <button onClick={() => getRepInfo("")}>Add User</button>
                </div>
                <hr />
                {users.map((user, index) => (
                    <Fragment key={index}>
                    <button className="clientnames" onClick={() => {
                        //alert(clientNames[index]);
                        getRepInfo(index);
                        }} >
                        {user.name}
                    </button>
                    <hr />
                    </Fragment>
                ))}
            </div>
            {/*users.map((user, index) => (
                <Fragment key={index}>
                    <p>{user.name}</p>
                </Fragment>
                
            ))*/}
        </Fragment>
    );
}
 
export default UserList;
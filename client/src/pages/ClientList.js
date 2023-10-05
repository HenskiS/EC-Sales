import { IoMdPaper } from "react-icons/io";
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useEffect, useState, Fragment } from "react";
import useToken from '../hooks/useToken';
import axios from 'axios';
import ClientInfo from "../components/ClientInfo";

const ClientList = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        const token = (tokenString !== 'undefined') ? tokenString : null;
        if (!token) {
            navigate("/auth");
        }
    });

    const [clientNames, setClientNames] = useState(["loading..."]);
    const [filteredClientNames, setFilteredClientNames] = useState(clientNames);
    const [listCounter, setListCounter] = useState(0);
    useEffect(() => {
        const getClients = async () => {
            try {
                const response = await axios.get("http://192.168.1.133:3001/clients/clientnames");
                //const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                console.log("got clients");
                console.log(response);
                setClientNames(response.data);
                setFilteredClientNames(response.data);
            } catch (err) { console.error(err); }
        }
        getClients()
        .catch(console.error);
    }, [listCounter]);

    const addName = (name) => {
        console.log("add name to list");
        setListCounter(listCounter+1);
    }

    const filter = (e) => {
        setFilteredClientNames(clientNames.filter(n => n.name.toLowerCase().includes(e.target.value.toLowerCase())))
    }

    const [info, setInfo] = useState(false);
    const [infoSrc, setInfoSrc] = useState();

    const getInfo = (infoSrc) => {
        setInfoSrc(infoSrc);
        setInfo(true);
    }

    return ( 
        <div className="clientlist">
            <h2>Client List</h2>

            {info? <ClientInfo id={infoSrc} close={() => setInfo(false)} addName={addName}/> : <></>}


            <input type="search" className="client-search" placeholder="Search clients..." onChange={filter}/>

            <div className="clientnames-list">
                <div className="cigar add-cigar">
                    <button onClick={() => getInfo("")}>Add client</button>
                </div>
                <hr />
                {filteredClientNames.map((client, index) => (
                    <Fragment key={index}>
                    <button className="clientnames" onClick={() => {
                        //alert(clientNames[index]);
                        getInfo(client._id);}} >
                        {client.name}
                    </button>
                    <hr />
                    </Fragment>
                ))}
            </div>
            {/*clients.map((client) => (
                <div className="client-list" key={client.name}>
                    <div className="client-info">
                        <h4 className="client-name">{client.name}</h4>
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
                    </div>
                    <div className="client-buttons">
                        <button className="client-button">
                            <Link to="/">
                                <IoMdPaper className="client-order-icon" />
                                Start Order
                            </Link>
                        </button>
                    </div>
                </div>
            ))*/}
        </div>
    );
}
 
export default ClientList;
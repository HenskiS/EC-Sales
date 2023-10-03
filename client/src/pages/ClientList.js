import { IoMdPaper } from "react-icons/io";
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
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

    let clients = [
        {
            name: 'John Smoker', phone: '949-555-0179', address: '124 Conch St.', city: 'San Clemente', state: 'CA', zip: '92675'
        },
        {
            name: 'Albert Mulvaney', phone: '302-555-0124', address: '32 Apple Orchard Lane', city: 'Wilmington', state: 'DE', zip: '19884'
        }
    ]

    const [clientNames, setClientNames] = useState(["loading..."]);
    useEffect(() => {
        const getClients = async () => {
            try {
                const response = await axios.get("http://192.168.1.133:3001/clients/clientnames");
                console.log("got clients");
                console.log(response);
                setClientNames(response.data);
            } catch (err) { console.error(err); }
        }
        getClients()
        .catch(console.error);
    }, []);

    const [info, setInfo] = useState(false);
    const [infoSrc, setInfoSrc] = useState();

    const getInfo = (infoSrc) => {
        setInfoSrc(infoSrc);
        setInfo(true);
    }

    return ( 
        <div className="clientlist">
            <h2>Client List</h2>

            {info? <ClientInfo id={infoSrc} close={() => setInfo(false)} /> : <></>}


            <input type="search" className="client-search" placeholder="Search clients..."/>

            <div className="clientnames-list">
                {clientNames.map((client, index) => (
                    <>
                    <button className="clientnames" onClick={() => {
                        //alert(clientNames[index]);
                        getInfo(client._id);}} >
                        {client.name}
                    </button>
                    <hr />
                    </>
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
import * as IoIcons from "react-icons/io";
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useEffect } from "react";
import useToken from '../hooks/useToken';

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

    return ( 
        <div className="clientlist">
            <h2>Client List</h2>
            <input type="search" className="client-search" placeholder="Search clients..."/>
            {clients.map((client) => (
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
                                <IoIcons.IoMdPaper className="client-order-icon" />
                                Start Order
                            </Link>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
 
export default ClientList;
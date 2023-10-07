import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom"
import CigarList from '../components/CigarList';
import CigarOrderList from '../components/CigarOrderList';
import useFetch from '../hooks/useFetch';
import useToken from '../hooks/useToken';
import { useNavigate } from 'react-router';
import axios from 'axios';

const Home = (props) => {

    const navigate = useNavigate();
    useEffect(() => {
        const tokenString = localStorage.getItem('token');
        const token = (tokenString !== 'undefined') ? tokenString : null;
        if (!token) {
            navigate("/auth");
        }
    }, []);

    const previousCigars= [];
    const [cigars, setCigars] = useState([]);
    
    const [queryParameters] = useSearchParams();
    const [clientName, setClientName] = useState(queryParameters.get("name"));
    const [clientID, setClientID] = useState(queryParameters.get("id"));
    console.log("Client ID: " + clientID);

    

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

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.post("http://192.168.1.133:3001/clients/getclientbyid", {id: clientID});
                console.log("got client info");
                console.log(response);
                setClient(response.data);
            } catch (err) { console.error(err); }
        }
        if (clientID) {
            getClient()
            .catch(console.error);
        }
        //console.log("client");
        //console.log(client);
        //else setIsEditing(true);
    }, []);


    return ( 
        <div className='home'>
            <h1>Client Order Form</h1>
            {/* Client and Salesman Info */}
            <div className="client-and-salesrep">
                <div className="client">
                    {/*<input type='text' className='cust-input' placeholder="" value={client.name}></input>*/}
                    {/*<p>949-555-0179 <br /> 124 Conch St. <br /> San Clemente <br /> CA 92673</p>*/}
                    <div className="client-info-home">
                        {clientID ? <></> : <p>Select a client from Client List...</p>}
                        <p className="client-name">{client.name}</p>
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address1}</p>
                        <p className="client-address">{client.address2}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
                    </div>
                </div>
                <div className="salesrep">
                    <p>Esteban Carreras </p> 
                    <p>915 Calle Amanecer </p> 
                    <p>San Clemente </p> 
                    <p>CA 92673 </p> 
                    <p>{JSON.parse(localStorage.getItem('userName'))} </p> 
                    {/*<p>joe@estebancarreras.com</p>*/}
                </div>
            </div>
            <h4>Cigars</h4>
            {/*{error && <div>{error}</div>}*/}
            {/*isPending && <div>Loading...</div>*/}
            {cigars && <CigarOrderList cigars={cigars} displayButton />}
            <hr />
            {/*<div className="subtotal">
                <h5>Subtotal</h5>
                <p>$560.57{}</p>
                <h4>Total (with taxes and discount)</h4>
                <p className='total'>$542.46</p>
            </div>*/}
            
            <div className="submit-order">
                <button className='submit-button'>Submit Order</button>
            </div>
            <hr />
            <h4>Previously Ordered Cigars</h4>
            {/*previousCigars && <CigarList cigars={previousCigars} />*/}
        </div>
    );
}

export default Home;

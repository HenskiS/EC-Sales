import { IoMdPaper } from "react-icons/io";
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useEffect, useState, Fragment } from "react";
import useToken from '../hooks/useToken';
import axios from '../api/axios';
import ClientInfo from "../components/ClientInfo";

const ClientList = () => {

    const [clientNames, setClientNames] = useState(["loading..."]);
    const [filteredClientNames, setFilteredClientNames] = useState(["loading..."]);
    const [listCounter, setListCounter] = useState(0);
    useEffect(() => {
        const getClients = async () => {
            try {
                const response = await axios.get("/clients/clientnames");
                //const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                console.log("got clients");
                console.log(response);
                let names = response.data.sort((a,b)=>{
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) < (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return -1;
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) > (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return 1;
                    return 0;
                }).filter(n => (" " + n.company?.toLowerCase() + n.name?.toLowerCase()).length > 1 && (n.hasOwnProperty("company") || (n.hasOwnProperty("name") && n.name !== " ")))
                setClientNames(names);
                setFilteredClientNames(names);
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
        setFilteredClientNames(clientNames.filter(n => ("" + (n.company ? n.company : n.name) + (n.city ? ", " + n.city : "") + (n.state? " " + n.state : "")).toLowerCase().includes(e.target.value.toLowerCase())))
    }

    const [info, setInfo] = useState(false);
    const [infoSrc, setInfoSrc] = useState();

    const getInfo = (infoSrc) => {
        setInfoSrc(infoSrc);
        setInfo(true);
    }

    return ( 
        <div className="clientlist content">
            <h2>Client List</h2>

            {info? <ClientInfo id={infoSrc} close={() => setInfo(false)} addNameToList={addName}/> : <></>}


            <input type="search" className="client-search" placeholder="Search clients..." onChange={filter}/>

            <div className="clientnames-list">
                <div className="cigar add-cigar">
                    <button onClick={() => getInfo("")}>Add client</button>
                </div>
                <hr />
                {filteredClientNames[0]==="loading..."? <h5>loading...</h5> :
                filteredClientNames.map((client, index) => (
                    <Fragment key={index}>
                    <button className="clientnames" onClick={() => {
                        //alert(clientNames[index]);
                        getInfo(client._id);}} >
                        { (client.company ? client.company : client.name) + (client.city ? ", " + client.city : "") + (client.state? " " + client.state : "") }
                    </button>
                    <hr />
                    </Fragment>
                ))}
            </div>
        </div>
    );
}
 
export default ClientList;
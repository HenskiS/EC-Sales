import Select from 'react-select'
import axios from '../api/axios'
import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom"

const ClientSelect = ({ setClientID }) => {
    const [clientNames, setClientNames] = useState(["loading..."]);
    const [limitTenNames, setLimitTenNames] = useState(["loading..."]);
    const [queryParameters] = useSearchParams();
    const [clientName, setClientName] = useState(queryParameters.get("name"));

    // get data
    useEffect(() => {
        const getClients = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("http://192.168.1.102:3001/clients/clientnames", config);
                //const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                console.log("got clients");
                console.log(response);
                const names = response.data.sort((a,b)=>{
                    if ( a.name.split(" ").slice(-1) < b.name.split(" ").slice(-1) ) return -1;
                    if ( a.name.split(" ").slice(-1) > b.name.split(" ").slice(-1) ) return 1;
                    return 0;
                })
                const reformattedData = names.map((data) => {
                    return {
                      label: data.name,
                      value: data._id
                    };
                })
                setClientNames(reformattedData);
                //setFilteredClientNames(names);
            } catch (err) { console.error(err); }
        }
        getClients()
        .catch(console.error);
    }, []);


    return (
        <Select options={clientNames} placeholder="Select a client..."
        defaultInputValue={clientName? clientName : ""}
        onChange={e=>{console.log(e); setClientID(e.value); setClientName(e.value)}} />
    )
}

export default ClientSelect
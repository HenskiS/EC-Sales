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
                const response = await axios.get("/clients/clientnames");
                //const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                console.log("got clients");
                console.log(response);
                const names = response.data.sort((a,b)=>{
                    if ( a.name.split(" ").slice(-1) < b.name.split(" ").slice(-1) ) return -1;
                    if ( a.name.split(" ").slice(-1) > b.name.split(" ").slice(-1) ) return 1;
                    return 0;
                })
                let names2 = response.data.sort((a,b)=>{
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) < (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return -1;
                    if ( (a.company?.toLowerCase() + a.name?.toLowerCase()) > (b.company?.toLowerCase() + b.name?.toLowerCase()) ) return 1;
                    return 0;
                }).filter(n => (" " + n.company?.toLowerCase() + n.name?.toLowerCase()).length > 1 && (n.hasOwnProperty("company") || (n.hasOwnProperty("name") && n.name !== " ")))
                const reformattedData = names2.map((data) => {
                    return {
                      label: data.company? data.company : data.name,
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
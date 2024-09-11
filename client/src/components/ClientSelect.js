import Select from 'react-select'
import axios from '../api/axios'
import {config} from "../api/axios.js";
import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from "react-router-dom"
import OrderContext from '../context/OrderContext.js';
import Toggle from 'react-toggle'
import "react-toggle/style.css"

const ClientSelect = ({ setClientID }) => {

    const tokenString = sessionStorage.getItem('UserInfo');
    let user = (tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    let isIntlUser = false
    if (user) {
        isIntlUser = (user.roles.includes("International"))
    }

    const [clientNames, setClientNames] = useState(["loading..."]);
    const [limitTenNames, setLimitTenNames] = useState(["loading..."]);
    const [isDisabled, setIsDisabled] = useState(true);
    const [queryParameters] = useSearchParams();
    const [clientName, setClientName] = useState(queryParameters.get("name"));
    const [isIntlClient, setIsIntlClient] = useState(isIntlUser)
    
    // get data
    useEffect(() => {
        const getClients = async () => {
            try {
                let endpoint = "/api/clients/clientnames"
                if (isIntlClient) endpoint += "/intl"
                const response = await axios.get(endpoint, config());
                //const response = await axios.get("/apihttps://jsonplaceholder.typicode.com/users");
                console.log("got clients");
                console.log(response);
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
                setIsDisabled(false)
                //setFilteredClientNames(names);
            } catch (err) { console.error(err); }
        }
        getClients()
        .catch(console.error);
    }, [isIntlClient]);

    const { client } = useContext(OrderContext)


    return (
        <>
            {isIntlUser ? <div className="intl">
                <div className='intl-client-toggle'>
                    <p>Domestic</p>
                    <Toggle checked={isIntlClient} icons={{
                        checked: null,
                        unchecked: null,
                        }} 
                        onChange={(e) => setIsIntlClient(e.target.checked) }
                    />
                    <p>International</p>
                </div>
            </div> : null}
            <Select  options={clientNames} placeholder="Select a client..."
            defaultInputValue={clientName ?? client.company ? client.company : client.name? client.name : ""}
            onChange={e=>{console.log(e); setClientID(e.value); setClientName(e.value)}}
            isDisabled={isDisabled} />
            
        </>
    )
}

export default ClientSelect

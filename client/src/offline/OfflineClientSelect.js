import Select from 'react-select'
import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from "react-router-dom"
import OfflineContext from './OfflineContext.js';

const OfflineClientSelect = ({ setClientID }) => {
    const [clientNames, setClientNames] = useState([{label: "New Client", value: "newclient"}]);
    const [clientName, setClientName] = useState();

    // get data
    useEffect(() => {
        if (clientNames.length === 1) {
            const names = JSON.parse(localStorage.getItem("clients")).map((c) => {
                return {
                    label: c.company? c.company : c.name,
                    value: c._id
                };
            })
            setClientNames(clientNames => [...clientNames, ...names])
        }
    }, []);

    const { client } = useContext(OfflineContext)


    return (
        <Select options={clientNames} placeholder="Select a client..."
        value={clientName}
        onChange={e=>{console.log(e); setClientID(e.value); setClientName(e)}}
        />
    )
}

export default OfflineClientSelect

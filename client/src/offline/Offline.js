import React, { useContext, useState, useEffect } from 'react'
import OfflineOrderList from './OfflineOrderList'
import './offline.css'
import OfflineContext from './OfflineContext'
import OfflineClientSelect from './OfflineClientSelect'

const Offline = () => {

    const [clientID, setClientID] = useState()
    const { cigars, client, setClient, submitOrder, notes, setNotes } = useContext(OfflineContext)

    useEffect(() => {
        const clients = JSON.parse(localStorage.getItem("clients"))
        const client = clients.find(c => {
            return c._id === clientID
        })
        if (client) setClient(client)
    }, [clientID]);

    return (
        <div className='offline'>
        <h3>You are offline.
            You can fill out orders, 
            and submit them when you have internet.
        </h3>
        <div className="client-and-salesrep">
            <div className="client">
                {/*<input type='text' className='cust-input' placeholder="" value={client.name}></input>*/}
                {/*<p>949-555-0179 <br /> 124 Conch St. <br /> San Clemente <br /> CA 92673</p>*/}
                <div className="client-info-home">
                    { <OfflineClientSelect setClientID={setClientID} /> }
                    {clientID === "newclient" ? <p>Enter client info in Notes at the bottom</p> : null}
                    {!client? <></> :
                    <>
                        <p className="client-phone">{client.email}</p>
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address1}</p>
                        <p className="client-address">{client.address2}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + (client.zip??"")}</p>
                    </>
                    }
                </div>
            </div>
            <div className="salesrep">
                <p>Esteban Carreras Cigar Co.</p> 
                <p>6505 Ladera Brisa </p> 
                <p>San Clemente </p> 
                <p>CA 92673 </p>
                {/*<p>joe@estebancarreras.com</p>*/}
            </div>
        </div>
        { client && <OfflineOrderList /> }
        <label>Notes (optional):</label>
            <textarea className="order-notes-input" value={notes} onChange={e => setNotes(e.target.value)}/>
        <div className="submit-order">
            <button className='submit-button' onClick={async ()=>{
                await submitOrder();
                window.location.reload()
            }}>
                Submit Order
            </button>
        </div>
        <hr />
        </div>
    )
}

export default Offline
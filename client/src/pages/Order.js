import { useState, useEffect, Fragment, useRef, useContext } from 'react';
import axios from '../api/axios';
import {config} from "../api/axios.js";
import {useParams} from "react-router-dom"


const Order = (props) => {

    const {id: paramId} = useParams()
    console.log(paramId)

    const [order, setOrder] = useState();
    const [client, setClient] = useState([]);
    const [cigars, setCigars] = useState([]);
    const [salesman, setSalesman] = useState();
    const [subtotal, setSubtotal] = useState();
    const [total, setTotal] = useState();
    const [discount, setDiscount] = useState();
    const [boxesOff, setBoxesOff] = useState();
    const [tax, setTax] = useState();
    const [filename, setFilename] = useState();
    const [date, setDate] = useState()
    const [notes, setNotes] = useState()
    

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.get(`/api/orders/orderbyid/${paramId}`, config());
                console.log("got order info");
                console.log(response);
                setOrder(response.data)
                setClient(response.data.client);
                setSalesman(response.data.salesman)
                setCigars(response.data.cigarData)
                setSubtotal(response.data.cigars.subtotal)
                setTotal(response.data.cigars.total)
                setTax(response.data.cigars.tax)
                setBoxesOff(response.data.cigars.boxesOff)
                setDiscount(response.data.cigars.discount)
                setFilename(response.data.filename)
                setDate(new Date(response.data.date))
                setNotes(response.data.notes)
            } catch (err) { console.error(err); }
        }
        getClient()
            .catch(console.error);
    }, []);

    if (!order) return <h3>Order Not Found</h3>
    else return ( 
        <div className='home content'>
            <h1 className='order-pdf-header'>ESTEBAN CARRERAS CIGARS</h1>
            <br />
            {/* Client and Salesman Info */}
            <div className="order-pdf-header-titles">
                <h3>Client</h3>
                <p>{date?.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}</p>
                <h3>Seller</h3>
            </div>
            <hr />
            <div className="client-and-salesrep order-pdf-info">
                <div className="client">
                    <div className="client-info-home">
                        <p className="client-phone">{client.company ? client.company : client.name}</p>
                        <p className="client-phone">{client.email}</p>
                        <p className="client-phone">{client.phone}</p>
                        <p className="client-address">{client.address1}</p>
                        <p className="client-address">{client.address2}</p>
                        <p className="client-city">{client.city}</p>
                        <p className="client-state-and-zip">{client.state + " " + (client.zip??"")}</p>
                        <p className="client-state-and-zip">{client.country}</p>
                    </div>
                </div>
                <div className="salesrep">
                    <p>Esteban Carreras Cigar Co.</p> 
                    <p>6505 Ladera Brisa </p> 
                    <p>San Clemente </p> 
                    <p>CA 92673 </p> 
                    <p>{salesman?.name} </p> 
                    {/*<p>joe@estebancarreras.com</p>*/}
                </div>
            </div>

            <h3 className='order-cigars'>Cigars</h3>
            <hr />
            <div className="order-cigar-list">
            <table className="order-cigarlist-table">
                <thead>
                    <tr>
                    <td>Qty</td>
                    <td>Name</td>
                    <td>Blend</td>
                    <td>Size Name</td>
                    <td>Size</td>
                    <td>Box Price</td>
                    {discount > 0 ? <td>{boxesOff ? "Free" : "Discount"}</td> : null}
                    </tr>
                </thead>
                <tbody>
                    {cigars && cigars.map((cigar, index) => (
                        <tr key={index}>
                            <td>{cigar.qty}</td>
                            <td>{cigar.brandAndName}</td>
                            <td>{cigar.blend}</td>
                            <td>{cigar.sizeName}</td>
                            <td>{cigar.size}</td>
                            <td>${cigar.priceBox.toFixed(2)}</td>
                            {discount > 0? <td>{boxesOff ? cigar.boxesOff ?? "" : cigar.discount? cigar.discount+"%" : "" }</td> :null}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <br />
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${ subtotal?.toFixed(2) }</p>
                <h5>CA Taxes</h5>
                <p>${ tax > 0 ? (Math.ceil(tax)/100).toFixed(2) : "0.00" }</p>
                <h5>{boxesOff? boxesOff + "-Box " : ""}Discount</h5>
                <p>${ discount > 0 ? discount?.toFixed(2) : "0.00" }</p>
                <h4>Total</h4>
                <p className='total'>${ total?.toFixed(2) }</p>
            </div>
            <div className="print-order-notes">
                <h3>Notes</h3>
                <hr />
                {notes.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
            
        </div>
    );
}

export default Order;

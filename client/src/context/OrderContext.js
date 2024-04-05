import { createContext, useEffect, useState } from "react";
import axios, { config } from "../api/axios";

const OrderContext = createContext({});

function price(item){
    return item.priceBox * 100 * item.quantity;
}
function tax(item, taxCents) {
    console.log("taxCents:" + taxCents)
    return item.quantityBox * parseFloat(taxCents) * item.quantity
}
function priceWithDiscount(item){
    return {price: item.priceBox * 100 * (item.discount ? 100 - parseFloat(item.discount) : 100)/100, qty: item.qty};
}
function sum(prev, next){
    return prev + next;
}

export const OrderProvider = ({ children }) => {
    const [cigars, setCigars] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [taxCents, setTaxCents] = useState()
    const [taxAmount, setTaxAmount] = useState()
    const [client, setClient] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        corediscount: ""
    })

    useEffect(() => {
        // get CA tax amount
        const getTax = async () => {
            try {
                const response = await axios.get("/api/orders/catax/", config()); 
                console.log("got CA tax info");
                console.log(response);
                setTaxCents(response.data);
            } catch (err) { console.error(err); }
        }
        getTax();
    }, [])

    useEffect(() => {
        if (!cigars.length) {
            setSubtotal(0)
            setTaxAmount(0)
        }
        else {
            // subtotal
            let prices = cigars.map(price)
            let sub = Math.ceil(prices.reduce(sum))/100;
            setSubtotal(sub)
            // ca taxes
            if (client && client.hasOwnProperty('state') && client.state.toUpperCase().startsWith("CA")) {
                const t = cigars.map(c => tax(c, taxCents)).reduce(sum)
                setTaxAmount(t)
            } else setTaxAmount(0)
        }
    } , [cigars, client])

    const removeCigar = (id) => {
        setCigars(cigars.filter(cigar => cigar._id !== id))
    }
    const addCigar = (newCigar) => {
        setCigars([...cigars, newCigar]);
    }
    const updateQuantity = (cigar, newQuantity) => {
        if (newQuantity === "" || newQuantity === 0 || !newQuantity || !parseInt(newQuantity)) removeCigar(cigar._id)
        else {
            if (cigars.find(oldCigar => oldCigar._id === cigar._id)) {
                const updatedCigars = cigars.map(oldCigar =>
                    oldCigar._id === cigar._id ? { ...cigar, quantity: parseInt(newQuantity) } : oldCigar
                );
                setCigars(updatedCigars);
            }
            else addCigar({ ...cigar, quantity: parseInt(newQuantity) })
        }
    };
    const updateDiscount = (id, newDiscount) => {
        const updatedCigars = cigars.map(cigar =>
            cigar._id === id ? { ...cigar, discount: newDiscount } : cigar
        );
        setCigars(updatedCigars);
    }

    return (
        <OrderContext.Provider value={{ client, setClient, 
                                        cigars, setCigars, addCigar, updateQuantity, updateDiscount, removeCigar, 
                                        subtotal, total, taxAmount }}>
            {children}
        </OrderContext.Provider>
    )
}

export default OrderContext;
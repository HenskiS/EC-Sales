import { createContext, useEffect, useState } from "react";
import axios, { config } from "../api/axios";

const OrderContext = createContext({});

function price(item){
    return item.priceBox * 100 * item.qty;
}
function tax(item, taxCents) {
    return item.quantityBox * parseFloat(taxCents) * item.qty
}
function priceWithBoxDiscount(item){
    //console.log(item)
    let price
    if (item.hasOwnProperty("boxesOff")) {
        price = item.priceBox * 100 * (item.qty - item.boxesOff)
    } else {
        price = item.priceBox * 100 * item.qty
    }
    //console.log(price)
    return price
    //return {price: item.priceBox * 100 * (item.discount ? 100 - parseFloat(item.discount) : 100)/100, qty: item.qty};
}
function priceWithDiscount(item){
    let price
    if (item.hasOwnProperty("discount") && item.discount) {
        price = item.priceBox * item.qty * (100-parseFloat(item.discount))
    } else {
        price = item.priceBox * 100 * item.qty
    }
    //console.log(price)
    return price
}
function sum(prev, next){
    return prev + next;
}
const updateClient = async (client) => {
    try {
        const response = await axios.post("/api/clients/updateclientbyid", {editClient: client}, config());
        console.log("updated client info");
        console.log(response);
    } catch (err) { console.error(err); }
}
function cigarsToString(cigars) {
    return cigars.map((cigar) => {
        let s = "";
        s += cigar.brandAndName;
        if (cigar.hasOwnProperty("blend")) {
            if (cigar.blend) s += " " + cigar.blend
        }
        if (cigar.hasOwnProperty("sizeName")) {
            if (cigar.sizeName) s += " " + cigar.sizeName
        }
        s += ", Qty: " + cigar.qty;
        if (cigar.hasOwnProperty("discount")) {
            if (cigar.discount) s += ", Discount: " + cigar.discount + "%"
        }
        return s;
    });
}

export const OrderProvider = ({ children }) => {
    const [cigars, setCigars] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [coreDiscount, setCoreDiscount] = useState(0);
    const [taxCents, setTaxCents] = useState()
    const [taxAmount, setTaxAmount] = useState()
    const [isBoxDiscount, setIsBoxDiscount] = useState(true)
    const [boxesOff, setBoxesOff] = useState()
    const [boxesUsed, setBoxesUsed] = useState(0)
    const [notes, setNotes] = useState("")
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
            setDiscount(0)
            setTaxAmount(0)
            setBoxesOff(0)
            setBoxesUsed(0)
            setTotal(0)
            setCoreDiscount(client?.corediscount ?? 0)
        }
        else {
            // subtotal
            let prices = cigars.map(price)
            let sub = Math.ceil(prices.reduce(sum))/100;
            setSubtotal(sub)
            // ca taxes
            let caTax = 0
            if (client && client.hasOwnProperty('state') && client.state.toUpperCase().startsWith("CA")) {
                caTax = cigars.map(c => tax(c, taxCents)).reduce(sum)
            }
            setTaxAmount(caTax) // in Cents!
            // boxes off
            if (isBoxDiscount) {
                // boxesOff no longer in use, keeping just in case. boxesUsed is the important info.
                let totalquantity = cigars.map((cigar) => cigar.qty)
                let boxes = Math.floor(totalquantity.reduce(sum)/8)
                if (boxes > 3) boxes = 3
                setBoxesOff(boxes)
                // boxes used
                let totalused = cigars.map((cigar) => cigar.boxesOff ?? 0)
                let used = totalused.reduce(sum)
                setBoxesUsed(used)
            } else setBoxesOff(0)
            // total
            let discountedPrices
            if (isBoxDiscount) {
                discountedPrices = cigars.map(priceWithBoxDiscount)
            } else {
                discountedPrices = cigars.map(priceWithDiscount)
            }
            let tot = discountedPrices.reduce(sum)
            tot += caTax
            tot = Math.ceil(tot)/100
            setTotal(tot)
            // discount
            let dis = sub + caTax/100 - tot
            setDiscount(dis)
            console.log(cigars)
        }
    } , [cigars, client, isBoxDiscount, taxCents])
    useEffect(()=>{
        client.corediscount = coreDiscount
        const newCigars = cigars.map(cigar => {
            if (cigar.coreline) {
                return {...cigar, discount: coreDiscount}
            } else return cigar
        })
        setCigars(newCigars)
    }, [coreDiscount, cigars.length])

    const removeCigar = (id) => {
        setCigars(cigars.filter(cigar => cigar._id !== id))
    }
    const addCigar = (newCigar) => {
        setCigars([...cigars, newCigar]);
    }
    const updateMiscCigar = (cigar) => {
        if (cigar.qty === "" || cigar.qty === 0 || !cigar.qty || !parseInt(cigar.qty)) removeCigar(cigar._id)
        else {
            if (cigars.find(oldCigar => oldCigar._id === cigar._id)) {
                const updatedCigars = cigars.map(oldCigar =>
                    oldCigar._id === cigar._id ? cigar : oldCigar
                );
                setCigars(updatedCigars);
            }
            else addCigar(cigar)
        }
    }
    const updateQuantity = (cigar, newQuantity) => {
        if (newQuantity === "" || newQuantity === 0 || !newQuantity || !parseInt(newQuantity)) removeCigar(cigar._id)
        else {
            if (cigars.find(oldCigar => oldCigar._id === cigar._id)) {
                const updatedCigars = cigars.map(oldCigar =>
                    oldCigar._id === cigar._id ? { ...cigar, qty: parseInt(newQuantity) } : oldCigar
                );
                setCigars(updatedCigars);
            }
            else addCigar({ ...cigar, qty: parseInt(newQuantity) })
        }
    };
    const updateDiscount = (id, newDiscount) => {
        const updatedCigars = cigars.map(cigar =>
            cigar._id === id ? { ...cigar, discount: newDiscount } : cigar
        );
        setCigars(updatedCigars);
    }
    const updateBoxesOff = (id, newBoxesOff) => {
        let newBoxes = newBoxesOff === "" ? 0 : parseInt(newBoxesOff)
        console.log("New boxes off: "+newBoxes)
        const updatedCigars = cigars.map(cigar => {
            if (cigar._id === id) {
                console.log(cigar)
                let oldBoxesOff = cigar.hasOwnProperty('boxesOff') ? cigar.boxesOff : 0
                console.log("oldBoxesOff: " + oldBoxesOff)
                let change = newBoxes - oldBoxesOff
                console.log("boxes off change: " + change)
                setBoxesUsed(boxesUsed+(newBoxes-oldBoxesOff))
                return { ...cigar, boxesOff: newBoxes }
            }
            else return cigar
            }
        );
        console.log(updatedCigars)
        setCigars(updatedCigars);
    }
    const submitOrder = async (salesman, emails) => {
        if (client.company === "") {
            alert("No client selected!");
            return;}
        if (cigars.length === 0) {
            alert("No cigars added!");
            return;}
        
        const response = await axios.post("/api/orders/add", 
            {client, salesman,  cigars: {cigars: cigarsToString(cigars),
                                        subtotal,
                                        tax: taxAmount,
                                        total,
                                        discount: discount,
                                        boxesOff: boxesUsed},
                                cigarData: cigars,
                                emails: emails,
                                notes}, config());
        console.log("Order submission response:");
        console.log(response);
        updateClient(client)
        if ("success" in response.data) {
            alert("Order Submission Successful!") 
            window.location.reload()
        }
    }

    return (
        <OrderContext.Provider value={{ client, setClient, coreDiscount, setCoreDiscount,
                                        cigars, setCigars, addCigar, updateQuantity, updateDiscount, removeCigar, updateMiscCigar,
                                        isBoxDiscount, setIsBoxDiscount, discount, boxesOff, boxesUsed, updateBoxesOff,
                                        subtotal, total, taxAmount, setTaxCents, notes, setNotes, submitOrder }}>
            {children}
        </OrderContext.Provider>
    )
}

export default OrderContext;
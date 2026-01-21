import { createContext, useEffect, useState } from "react";
import axios, { config } from "../api/axios";
import { useOfflineOrders } from '../hooks/useOfflineOrders';


const OrderContext = createContext({});

const DiscountTypes = {
    BOX: 'box',
    PERCENT: 'percent',
    CUSTOM: 'custom'
};

function price(item){
    return item.priceBox * 100 * item.qty;
}
function tax(item) {
    if (item.caTaxCents && item.caTaxCents > 0) {
        return item.caTaxCents * item.qty;
    } else return 0;
}
function priceWithDiscount(item) {
    let price = item.priceBox * 100 * item.qty;
    
    switch (item.discountType) {
        case DiscountTypes.BOX:
            price = item.priceBox * 100 * (item.qty - (item.boxesOff || 0));
            break;
        case DiscountTypes.PERCENT:
            if (item.percentOff) {
                price = item.priceBox * item.qty * (100 - parseFloat(item.percentOff));
            }
            break;
        case DiscountTypes.CUSTOM:
            if (item.customPrice) {
                price = item.customPrice * 100 * item.qty;
            }
            break;
        default:
            break;
    }
    
    return price;
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
    const [notes, setNotes] = useState("")
    const [isEstimate, setIsEstimate] = useState(false);
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
    const { saveOfflineOrder } = useOfflineOrders();

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
                caTax = cigars.map(c => tax(c)).reduce(sum)
            }
            setTaxAmount(caTax) // in Cents!
            // total
            const discountedPrices = cigars.map(priceWithDiscount)
            let tot = discountedPrices.reduce(sum)
            tot += caTax
            tot = Math.ceil(tot)/100
            setTotal(tot)
            // discount
            let dis = sub + caTax/100 - tot
            setDiscount(dis)
            console.log(cigars)
        }
    } , [cigars, client, taxCents])
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
    const updatePrice = (id, newPrice) => {
        const updatedCigars = cigars.map(cigar =>
            cigar._id === id ? { ...cigar, customPrice: parseFloat(newPrice) } : cigar
        );
        setCigars(updatedCigars);
    };
    const updateDiscountType = (id, discountType) => {
        const updatedCigars = cigars.map(cigar =>
          cigar._id === id ? { 
            ...cigar, 
            discountType,
            // Reset other discount values when changing type
            boxesOff: discountType === DiscountTypes.BOX ? (cigar.boxesOff || 0) : undefined,
            // If switching to percent discount and it's a core line cigar, use the existing discount
            percentOff: discountType === DiscountTypes.PERCENT ? 
              (cigar.coreline ? cigar.discount : (cigar.percentOff || '')) : undefined,
            customPrice: discountType === DiscountTypes.CUSTOM ? (cigar.customPrice || '') : undefined
          } : cigar
        );
        setCigars(updatedCigars);
      };
    const updateDiscountValue = (id, value) => {
        const updatedCigars = cigars.map(cigar => {
            if (cigar._id === id) {
            switch (cigar.discountType) {
                case DiscountTypes.BOX:
                return { ...cigar, boxesOff: parseInt(value) || 0 };
                case DiscountTypes.PERCENT:
                return { ...cigar, percentOff: parseFloat(value) || 0 };
                case DiscountTypes.CUSTOM:
                return { ...cigar, customPrice: parseFloat(value) || 0 };
                default:
                return cigar;
            }
            }
            return cigar;
        });
        setCigars(updatedCigars);
    };
    const saveOrder = async () => {
        const orderData = {client, salesman: {},  cigars: {cigars: cigarsToString(cigars),
                                subtotal,
                                tax: taxAmount,
                                total,
                                discount: discount},
                        cigarData: cigars,
                        emails: [],
                        notes}
        const order = await saveOfflineOrder(orderData)
        if (order) {
            window.location.reload()
        }
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
                                        discount: discount},
                                cigarData: cigars,
                                emails: emails,
                                notes,
                                isEstimate}, config());
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
                                        cigars, setCigars, addCigar, updateQuantity, updatePrice, 
                                        isEstimate, setIsEstimate,
                                        updateDiscountValue, updateDiscountType,
                                        removeCigar, updateMiscCigar,
                                        discount, subtotal, total, taxAmount, setTaxCents, notes, setNotes, submitOrder, saveOrder }}>
            {children}
        </OrderContext.Provider>
    )
}

export default OrderContext;
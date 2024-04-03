import { createContext, useEffect, useState } from "react";

const CigarContext = createContext({});

function price(item){
    return item.priceBox * 100 * item.quantity;
}
function priceWithDiscount(item){
    return {price: item.priceBox * 100 * (item.discount ? 100 - parseFloat(item.discount) : 100)/100, qty: item.qty};
}
function sum(prev, next){
    return prev + next;
}

export const CigarProvider = ({ children }) => {
    const [cigars, setCigars] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        if (!cigars.length) setSubtotal(0)
        else {
            let prices = cigars.map(price)
            let sub = Math.ceil(prices.reduce(sum))/100;
            setSubtotal(sub)
        }
    } , [cigars])

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
        <CigarContext.Provider value={{ cigars, addCigar, updateQuantity, updateDiscount, removeCigar, subtotal }}>
            {children}
        </CigarContext.Provider>
    )
}

export default CigarContext;
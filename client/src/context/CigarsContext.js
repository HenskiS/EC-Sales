import { createContext, useState } from "react";

const CigarContext = createContext({});

export const CigarProvider = ({ children }) => {
    const [cigars, setCigars] = useState([]);
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
    };
    

    return (
        <CigarContext.Provider value={{ cigars, addCigar, updateQuantity, updateDiscount, removeCigar }}>
            {children}
        </CigarContext.Provider>
    )
}

export default CigarContext;
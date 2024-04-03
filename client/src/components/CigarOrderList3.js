import { useEffect, useState, useContext } from "react"
import axios, { config } from "../api/axios"
import CigarContext from "../context/CigarsContext"


const CigarOrderList3 = () => {
    const { cigars: cart, 
        addCigar, 
        updateQuantity, 
        updateDiscount, 
        removeCigar 
    } = useContext(CigarContext)
    const [cigars, setCigars] = useState()
    const [taxCents, setTaxCents] = useState()

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
        const getCigars = async () => {
            try {
                const response = await axios.get("/api/cigars/", config());
                console.log("got cigars");
                console.log(response);
                setCigars(response.data)
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, [])

    return (
        <div className="cigar-list">
            <table>
                <thead>
                    <tr>
                    <td>Name</td>
                    <td>Blend</td>
                    <td>Size Name</td>
                    <td>Size</td>
                    <td>Box Price</td>
                    <td>Qty</td>
                    </tr>
                </thead>
                <tbody>
                    {cigars && cigars.map((cigar, index) => (
                        <tr key={index} className={ cart.find(oldCigar => oldCigar._id === cigar._id) ? "row-selected" : ""}>
                            <td>{cigar.brandAndName}</td>
                            <td>{cigar.blend}</td>
                            <td>{cigar.sizeName}</td>
                            <td>{cigar.size}</td>
                            <td>${cigar.priceBox.toFixed(2)}</td>
                            {/* Quantity */}
                            <td>
                                <input className='cigar-qty cigar-col' type="number" defaultValue="" min={1} placeholder='Qty' 
                                    onChange={ (e) => { updateQuantity(cigar, e.target.value);  } } 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <h3>Summary</h3>
            <hr />
            {cart.map((cigar, index) => {
                let s = ""
                s += cigar.brandAndName
                if (cigar.hasOwnProperty("blend")) {
                    if (cigar.blend !== "") s += " " + cigar.blend
                }
                if (cigar.hasOwnProperty("sizeName")) {
                    if (cigar.sizeName !== "") s += " " + cigar.sizeName
                }
                s += ", Qty: " + cigar.quantity;
                return (
                    <p key={index}>{s}</p>
                )
            })}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${/*cigars.length > 0 && subtotal && subtotal.toFixed(2)*/}</p>
                <h5>CA Taxes</h5>
                <p>${/*taxAmount && taxAmount > 0 && taxAmount.toFixed(2)*/}</p>
                <h5>{/*boxesOff < 0 ? "Per-cigar " : boxesOff > 0 ? boxesOff + "-box ":""*/} Discount</h5>
                <p>${/*total&&(subtotal+taxAmount-total).toFixed(2)*/}</p>
                <h4>Total</h4>
                <p className='total'>${/*cigars.length > 0 && total && total.toFixed(2)*/}</p>
            </div>
        </div>
    )
}

export default CigarOrderList3
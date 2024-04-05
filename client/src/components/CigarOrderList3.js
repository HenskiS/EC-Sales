import { useEffect, useState, useContext } from "react"
import axios, { config } from "../api/axios"
import OrderContext from "../context/OrderContext"
import { useNavigate } from "react-router"


const CigarOrderList3 = () => {
    
    const navigate = useNavigate()

    const { cigars: cart, 
        setCigars: setCart,
        client,
        addCigar,
        updateQuantity,
        updateDiscount,
        removeCigar,
        subtotal,
        total,
        taxAmount
    } = useContext(OrderContext)
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
                                <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === cigar._id)?.quantity ?? "" } min={1} placeholder='Qty' 
                                    onChange={ (e) => { updateQuantity(cigar, e.target.value);  } } 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <button onClick={() => {setCart([]); 
                navigate("/order/?name="+(client.company? client.company : client.name)+"&id="+client._id); 
                window.location.reload() }}>
                    Reset Order
            </button>
            <br />
            <h3>Summary</h3>
            <hr />
            {cart.map((cigar, index) => {
                console.log(cigar)
                let s = ""
                s += cigar.brandAndName
                if (cigar.hasOwnProperty("blend")) {
                    if (cigar.blend) s += " " + cigar.blend
                }
                if (cigar.hasOwnProperty("sizeName")) {
                    if (cigar.sizeName) s += " " + cigar.sizeName
                }
                s += ", Qty: " + cigar.quantity;
                return (
                    <p key={index}>{s}</p>
                )
            })}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${subtotal && subtotal.toFixed(2)}</p>
                <h5>CA Taxes</h5>
                <p>${Math.ceil(taxAmount/100).toFixed(2)/*taxAmount && taxAmount > 0 && taxAmount.toFixed(2)*/}</p>
                <h5>{/*boxesOff < 0 ? "Per-cigar " : boxesOff > 0 ? boxesOff + "-box ":""*/} Discount</h5>
                <p>${/*total&&(subtotal+taxAmount-total).toFixed(2)*/}</p>
                <h4>Total</h4>
                <p className='total'>${total/*cigars.length > 0 && total && total.toFixed(2)*/}</p>
            </div>
        </div>
    )
}

export default CigarOrderList3
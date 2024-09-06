import { useEffect, useState, useContext } from "react"
import axios, { config } from "../api/axios"
import OfflineContext from "./OfflineContext"
import { useNavigate } from "react-router"
import Toggle from 'react-toggle'
import "react-toggle/style.css"
import MiscCigars from "./OfflineMiscCigars"

const OfflineOrderList = () => {
    
    let isIntlUser = true

    const { cigars: cart, 
        setCigars: setCart,
        client, coreDiscount, setCoreDiscount,
        addCigar,
        isBoxDiscount, setIsBoxDiscount, discount, boxesOff, boxesUsed, updateBoxesOff,
        updateQuantity,
        updateDiscount,
        removeCigar,
        subtotal,
        total,
        taxAmount,
        setTaxCents
    } = useContext(OfflineContext)
    const [cigars, setCigars] = useState()
    const [isIntl, setIsIntl] = useState(false)

    useEffect(() => {
        setTaxCents(parseInt(localStorage.getItem("catax")));
    }, [])
    useEffect(() => {
        setCigars(JSON.parse(localStorage.getItem(isIntl?"intlCigars":"cigars")))
    }, [isIntl])

    return (
        <div>
            {isIntlUser ? <div className="intl">
                <span>
                    <input type="radio" name="Domestic" id="dom" checked={!isIntl} onChange={()=>setIsIntl(!isIntl)}/>
                    <label htmlFor="dom">Domestic</label>
                    <input type="radio" name="International" id="intl" checked={isIntl} onChange={()=>setIsIntl(!isIntl)} />
                    <label htmlFor="intl">International</label>
                </span>
            </div> : null}
            <div className="cigar-list">
            <table className="cigarlist-table">
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
                                <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === cigar._id)?.qty ?? "" } min={1} placeholder='Qty' 
                                    onChange={ (e) => { updateQuantity(cigar, e.target.value);  } } 
                                />
                            </td>
                        </tr>
                    ))}
                    <MiscCigars />
                </tbody>
            </table>
            </div>
            
            <div className="reset-order">
                <button onClick={() => {
                    setCart([]);
                    window.location.reload() }}>
                        Reset Order
                </button>
            </div>
            <br />
            <h3>Summary</h3>
            <hr />
            <div className="discount-toggle">
                <p>% Discount</p>
                <Toggle checked={isBoxDiscount} icons={{
                    checked: null,
                    unchecked: null,
                    }} 
                    onChange={(e) => setIsBoxDiscount(e.target.checked) }
                />
                <p>Box Discount</p>
                {/*isBoxDiscount? <p className="boxes-available"><b>{ boxesOff-boxesUsed } available</b></p> : <></>*/}
                {isBoxDiscount? <p className="boxes-available"><b>{ boxesUsed } used</b></p> : <></>}
            </div>
            
            <div className="summary-list">
                {!isBoxDiscount ? 
                <span>
                    <label htmlFor="corediscount">Core Line Discount</label>
                    <input type="number" className="corediscount-input" id="corediscount" value={coreDiscount} 
                                    onChange={e => setCoreDiscount(e.target.value)} />
                </span>
                : null}
                <table className="summary-table">
                <thead>
                    <tr>
                    <td>Discount</td>
                    <td>Name</td>
                    <td>Blend</td>
                    <td>Size Name</td>
                    <td>Box Price</td>
                    <td>Qty</td>
                    </tr>
                </thead>
                <tbody>
                {cart.map((cigar, index) => {
                    let s = ""
                    s += cigar.brandAndName
                    if (cigar.hasOwnProperty("blend")) {
                        if (cigar.blend) s += " " + cigar.blend
                    }
                    if (cigar.hasOwnProperty("sizeName")) {
                        if (cigar.sizeName) s += " " + cigar.sizeName
                    }
                    s += ", Qty: " + cigar.qty;
                    return (
                        //<div className="summary" key={index}>
                            <tr key={index}>
                                <td>
                                    { isBoxDiscount?
                                    // box discount
                                    <div className="box-buttons">
                                        <button className="minus" onClick={(e) => updateBoxesOff(cigar._id, cigar.boxesOff ? cigar.boxesOff-1 : 0)}
                                        disabled={!cigar.boxesOff}>
                                        -</button>
                                            <p>{cigar.boxesOff? cigar.boxesOff:0}</p>
                                        <button className="plus" onClick={(e) => updateBoxesOff(cigar._id, cigar.boxesOff ? cigar.boxesOff+1 : 1)}
                                        disabled={cigar?.boxesOff === cigar.qty}>
                                        +</button>
                                    </div>
                                    : // percent discount
                                    <input className="percent-off" type="number" placeholder="% off" 
                                    value={cigar.discount??""}
                                    disabled={cigar.coreline}
                                    onChange={e => updateDiscount(cigar._id, e.target.value)}/>}
                                </td>
        
                                <td>{cigar.brandAndName}</td>
                                <td>{cigar.blend}</td>
                                <td>{cigar.sizeName}</td>
                                <td>${cigar.priceBox}</td>
                                <td>{cigar.qty}</td>
                            </tr>
                        //</div>
                    )
                })}
                </tbody>
                </table>
            </div>
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${subtotal?.toFixed(2)}</p>
                <h5>CA Taxes</h5>
                <p>${(Math.ceil(taxAmount)/100).toFixed(2)/* taxAmount is in cents, so round up to nearest cent and divide by 100 for $ amount */}</p>
                <h5>{boxesUsed? boxesUsed+"-Box ":""}Discount</h5>
                <p>${discount?.toFixed(2)}</p>
                <h4>Total</h4>
                <p className='total'>${total?.toFixed(2)/*cigars.length > 0 && total && total.toFixed(2)*/}</p>
            </div>
        </div>
    )
}

export default OfflineOrderList
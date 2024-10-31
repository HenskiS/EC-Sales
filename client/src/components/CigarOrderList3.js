import { useEffect, useState, useContext, useRef, createRef } from "react"
import axios, { config } from "../api/axios"
import OrderContext from "../context/OrderContext"
import { useNavigate } from "react-router"
import Toggle from 'react-toggle'
import "react-toggle/style.css"
import MiscCigars from "./MiscCigars"
import CigarSearch from "./CigarSearch"

const DiscountTypes = {
    BOX: 'box',
    PERCENT: 'percent',
    CUSTOM: 'custom'
};

const CigarOrderList3 = () => {
    
    const navigate = useNavigate()

    const summaryRef = useRef(null);
    const rowRefs = useRef({});
    const [searchTerm, setSearchTerm] = useState('');

    const tokenString = sessionStorage.getItem('UserInfo');
    let user = (tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    let isIntlUser = false
    if (user) {
        isIntlUser = (user.roles.includes("International"))
    }

    const { cigars: cart, 
        setCigars: setCart,
        client, coreDiscount, setCoreDiscount,
        addCigar,
        updateDiscountValue, updateDiscountType,
        discount,
        updateQuantity, updatePrice,
        updateDiscount,
        removeCigar,
        subtotal,
        total,
        taxAmount,
        setTaxCents
    } = useContext(OrderContext)
    const [cigars, setCigars] = useState()
    const [isIntl, setIsIntl] = useState(isIntlUser)

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
            let endpoint = "/api/cigars/"
            if (isIntl) endpoint += "intl"
            try {
                const response = await axios.get(endpoint, config());
                console.log("got cigars");
                console.log(response);
                setCigars(response.data)
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, [isIntl])

    useEffect(() => {
        // Initialize refs for each row
        cigars?.forEach((_, index) => {
          rowRefs.current[index] = createRef();
        });
      }, [cigars]);

      const handleSearch = (e) => {
        e.preventDefault();
        const searchLower = searchTerm.toLowerCase();
        const cigarIndex = cigars.findIndex(cigar => 
          cigar.brandAndName.toLowerCase().startsWith(searchLower)
        );
    
        if (cigarIndex !== -1 && rowRefs.current[cigarIndex]) {
          const row = rowRefs.current[cigarIndex].current;
          if (row) {
            const rect = row.getBoundingClientRect();
            const scrollPosition = window.pageYOffset + rect.top - 30; // 30px offset for better visibility
            
            window.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        } else {
          //alert("No cigar found starting with that name.");
        }
    };
    const handleTotalClick = () => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const handleSelect = (e, cigarId) => {
        const discountType = e.target.value;
        updateDiscountType(cigarId, discountType);
    };

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

            <CigarSearch    handleSearch={handleSearch} 
                            searchTerm={searchTerm} 
                            setSearchTerm={setSearchTerm}
                            handleTotalClick={handleTotalClick} />

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
                        <tr key={index} ref={rowRefs.current[index]} className={ cart.find(oldCigar => oldCigar._id === cigar._id) ? "row-selected" : ""}>
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
                <button onClick={() => {setCart([]); 
                    navigate("/order/?name="+(client.company? client.company : client.name)+"&id="+client._id); 
                    window.location.reload() }}>
                        Reset Order
                </button>
            </div>
            <br />
            <h3 ref={summaryRef}>Summary</h3>
            <hr />
            
            <div className="summary-list">
                <span>
                    <label htmlFor="corediscount">Core Line Discount</label>
                    <input type="number" className="corediscount-input" id="corediscount" value={coreDiscount} 
                                    onChange={e => setCoreDiscount(e.target.value)} />
                </span>
                <table className="summary-table">
                <thead>
                    <tr>
                    <td>Discount Type</td>
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
                    return (
                        //<div className="summary" key={index}>
                            <tr key={index}>
                                <td>
                                    <select value={cigar.discountType || '---'} 
                                            onChange={(e) => handleSelect(e, cigar._id)}>
                                        <option value="---">---</option>
                                        <option value="box">Box</option>
                                        <option value="percent">Percent</option>
                                        <option value="custom">Custom Price</option>
                                    </select>
                                </td>
                                <td>
                                {cigar.discountType === DiscountTypes.BOX && (
                                    <div className="box-buttons">
                                    <button 
                                        className="minus" 
                                        onClick={() => updateDiscountValue(cigar._id, (cigar.boxesOff || 0) - 1)}
                                        disabled={!cigar.boxesOff}
                                    >
                                        -
                                    </button>
                                    <p>{cigar.boxesOff || 0}</p>
                                    <button 
                                        className="plus" 
                                        onClick={() => updateDiscountValue(cigar._id, (cigar.boxesOff || 0) + 1)}
                                        disabled={cigar.boxesOff === cigar.qty}
                                    >
                                        +
                                    </button>
                                    </div>
                                )}
                                {cigar.discountType === DiscountTypes.PERCENT && (
                                    <input 
                                    className="percent-off" 
                                    type="number" 
                                    placeholder="% off"
                                    value={cigar.percentOff || ''}
                                    //disabled={cigar.coreline}
                                    onChange={(e) => updateDiscountValue(cigar._id, e.target.value)}
                                    />
                                )}
                                {cigar.discountType === DiscountTypes.CUSTOM && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        $<input
                                        type="number"
                                        step="0.01"
                                        className="price-input"
                                        value={+cigar.customPrice || ''}
                                        onChange={(e) => updateDiscountValue(cigar._id, e.target.value)}
                                        style={{
                                            maxWidth: '70px',
                                            border: 'none',
                                            borderBottom: '1px solid #ccc',
                                            padding: '2px 4px'
                                        }}
                                        />
                                    </span>
                                )}
                                </td>
        
                                <td>{cigar.brandAndName}</td>
                                <td>{cigar.blend}</td>
                                <td>{cigar.sizeName}</td>
                                <td>${cigar.priceBox.toFixed(2)}</td>
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
                <h5>{/*boxesUsed? boxesUsed+"-Box ":""*/}Discount</h5>
                <p>${discount?.toFixed(2)}</p>
                <h4>Total</h4>
                <p className='total'>${total?.toFixed(2)/*cigars.length > 0 && total && total.toFixed(2)*/}</p>
            </div>
        </div>
    )
}

export default CigarOrderList3
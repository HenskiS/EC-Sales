import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from 'axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';
import Total from './Total';


function tax(item, taxCents) {

    if (item.hidden) return 0
    else {
        console.log("taxCents:"+taxCents)
        return item.quantityBox * parseFloat(taxCents) * item.qty
    }
}
function price(item){
    if (item.hidden) return 0;
    return item.priceBox * 100 * item.qty;
}
function priceWithDiscount(item){
    if (item.hidden) return {price:0, qty:0};
    //console.log("priceBox: " + item.priceBox + "discount: " + item.discount)
    //console.log({price: item.priceBox * 100 * (item.discount ? 100 - parseFloat(item.discount) : 100)/100, qty: item.qty})
    return {price: item.priceBox * 100 * (item.discount ? 100 - parseFloat(item.discount) : 100)/100, qty: item.qty};
}
function sum(prev, next){
    return prev + next;
}
function getSubtotal(cigars, setIsBox) {
    //check if box discount or manual
    const box = cigars.map(c => {if (!c.hidden) return c.discount}).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value > 0;
    });

    let prices = cigars.map(price).filter(function (value) {
        return !Number.isNaN(value) && value !== "";
    });
    
    //return cigars.map(price).reduce(sum)/100;
    if (prices.length > 0) {
        //return prices.reduce((a, b) => a.price + b.price)/100;
        return Math.ceil(prices.reduce(sum))/100;
    }
    else return 0;
}
function getTotal(cigars, setIsBox, setBoxesOff, taxes, taxCents) {
    //check if box discount or manual
    let nonZeroCigars = cigars.filter(function (c) {
        return c.qty > 0
    })
    const discounts = nonZeroCigars.map(c => c.discount).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value > 0;
    });

    let isBox = !(discounts.length > 0);
    setIsBox( isBox );
    
    let prices = nonZeroCigars.map(priceWithDiscount).filter(function (value) {
        return  !Number.isNaN(value.priceBox) && value.priceBox !== "" && 
                !Number.isNaN(value.qty) && value.qty !== "";
    });

    if (isBox) {      // if using box discounts
        if (prices.length > 0) {
            let totalQty = 0;
            for (let i = 0; i<prices.length; i++) {
                totalQty += prices[i].qty;
            }
            if (totalQty >= 8) { // remove cheapest box
                                    // remove 1 if >= 8, 2 if >= 16, 3 if >= 24
                prices = prices.sort((a,b) => a.priceBox - b.priceBox);
                while (prices[0].qty === 0) prices = prices.slice(1);
                for (let i=0; i<Math.floor(totalQty/8) && i<3; i++) {
                    setBoxesOff(i+1);
                    prices[0].qty -= 1;
                    if (prices[0].qty == 0) prices = prices.slice(1);
                }
            } else setBoxesOff(0)
        }
    } else setBoxesOff(-1)
    prices = prices.map((i) => i.price * i.qty);
    //return cigars.map(price).reduce(sum)/100;
    if (prices.length > 0) {
        //return prices.reduce((a, b) => a.price + b.price)/100;
        let taxAmount = taxes ? nonZeroCigars.map(n => tax(n, taxCents)).reduce(sum) : 0
        return {total: Math.ceil(prices.reduce(sum) + taxAmount)/100,
                tax: taxAmount/100};
    }
    else return 0;
}

const CigarOrderList2 = ({client, setClient, cigars, setOrderPrice, taxes}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'
    const [key, setKey] = useState(5);
    const [subtotal, setSubtotal] = useState();
    const [taxAmount, setTaxAmount] = useState();
    const [total, setTotal] = useState();
    const [isBox, setIsBox] = useState(true);
    const [boxesOff, setBoxesOff] = useState("");
    const [allCigars, setAllCigars] = useState([]);
    const [coreLineDiscount, setCoreLineDiscount] = useState(client.coreLineDiscount)
    const [summary, setSummary] = useState([])
    const [taxCents, setTaxCents] = useState()

    useEffect(() => {
        // get CA tax amount
        const getTax = async () => {
            try {
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("http://192.168.1.102:3001/orders/catax/", config);
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
                const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                const response = await axios.get("http://192.168.1.102:3001/cigars/", config);
                console.log("got all cigars");
                console.log(response);
                setAllCigars(response.data)
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, [])

    useEffect(() => {
        setCoreLineDiscount(client.corediscount)
    }, [client])

    useEffect(() => {
        //console.log("coreLineDiscount: " + coreLineDiscount)
        for (let i = 0; i < cigars.length; i++) {
            if (cigars[i].brandAndName.includes("Esteban Carreras")) {
                cigars[i].discount = coreLineDiscount
            }
        }
    }, [coreLineDiscount, cigs])


    const onCigarChange = (cid, field, value) => {
        //console.log("id: " + cid);
        setCigs(cigs+1)
        //setCoreLineDiscount(client.hasOwnProperty("corediscount")?client.corediscount:"")
        let index = cigars.findIndex(c => c.id === cid);
        if (index === -1) {
            cigars.push({...allCigars[cid], id: cid})
        }
        index = cigars.findIndex(c => c.id === cid);
        if (cigars[index].brandAndName.includes("Esteban Carreras")) {
            cigars[index].discount = coreLineDiscount
        }
        if (cigars[index][field] === value) return;
        else {
            //console.log("id: " + cid + ", field: " + field + ", value: " + value);
            cigars[index][field] = value;
            //console.log(cigars);
            setKey(key*-1);
            let s = getSubtotal(cigars, setIsBox);
            let t = getTotal(cigars, setIsBox, setBoxesOff, taxes, taxCents);
            setSubtotal(s);
            setTotal(t.total);
            setTaxAmount(t.tax);
            setOrderPrice(s, t);
        }
        console.log(cigars)
    }
    useEffect(() => {
        const notZeroCigars = cigars.filter(function (cigar) {
            return cigar.qty > 0;
        });
        setSummary(notZeroCigars.map((cigar) => {
            let s = "";//cigar.brand;
            s += cigar.brandAndName; //" " + cigar.name;
            //s += cigar.blend !== "" ? " " + cigar.blend : "";
            if (cigar.hasOwnProperty("blend")) {
                if (cigar.blend !== "") s += " " + cigar.blend
            }
            s += " " + cigar.sizeName;
            s += ", Qty: " + cigar.qty;
            if (cigar.hasOwnProperty("discount")) {
                if (cigar.discount !== "") s += ", Discount: " + cigar.discount + "%"
            }
            return s;
        }))
    }, [cigs])

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
                    <td>Discount</td>
                    </tr>
                </thead>
                <tbody>
            
            {allCigars.map((cigar, index) => (
                <tr key={index+.01} className={cigar.hasOwnProperty('set') && cigar.set ? "row-selected" : ""}>
                    <td key={index+.1}>{cigar.brandAndName}</td>
                    <td key={index+.2}>{cigar.blend}</td>
                    <td key={index+.3}>{cigar.sizeName}</td>
                    <td key={index+.4}>{cigar.size}</td>
                    <td key={index+.5}>${cigar.priceBox}</td>
                    <td><input className='cigar-qty cigar-col' type="number" defaultValue="" min={1} placeholder='Qty' 
                    onChange={(e) => {
                        onCigarChange(index, 'qty', e.target.value === "" ? 0 : parseInt(e.target.value));
                        //if (cigar.brandAndName.includes("Esteban Carreras")) onCigarChange(index, 'discount', coreLineDiscount);
                        if (e.target.value === "" || e.target.value === 0) cigar.set = false
                        else cigar.set = true
                    }} /></td>
                    {cigar.brandAndName.includes("Esteban Carreras")?
                        <td><input className='cigar-qty cigar-col' type="number" value={client.corediscount === 0? "":client.corediscount} min={0} placeholder='% off' 
                        onChange={(e) => {  onCigarChange(index, 'discount', e.target.value);
                                            //setCoreLineDiscount(e.target.value);
                                            setClient({...client, corediscount: e.target.value})}} />
                        </td>
                    :
                        <td><input className='cigar-qty cigar-col' type="number" defaultValue="" min={0} placeholder='% off' 
                            onChange={(e) => {  onCigarChange(index, 'discount', e.target.value);}} />
                        </td>
                    }
                </tr>
            ))}
            </tbody>
            </table>

            {/*cigars.map((cigar, index) => (
                <Cigar 
                    key={index}
                    onCigarChange={(cid, field, value) => {onCigarChange(cid, field, value)}}
                    cid={cigar.id}
                />
            ))*/}

            {/* If displayButton param is passed, allow user to add cigars (Photos does not pass param) */}
            {/*displayButton ? <div className='cigar add-cigar'>
                <button onClick={() => {
                    console.log('click! adding cigar...');
                    let id = cigs ? cigars[cigs - 1].id + 1 : 1;
                    cigars.push({name: "", blend: "", size: "", qty: '', discount: '', price:"", hidden: false, boxQty:0, id: id});
                    setCigs(cigs + 1); // literally just a counter but it forces the cigar list to update when the button is pressed
                }}>Add cigar</button>
            </div> : <div></div>*/}
            <br />
            <h3>Summary</h3>
            <hr />
            {summary.map((cigar, index) => (
                <p key={index}>{cigar}</p>
            ))}

            {/*<Total key={key} cigars={cigars} />*/}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${cigars.length > 0 && subtotal && subtotal.toFixed(2)}</p>
                <h5>CA Taxes</h5>
                <p>${taxAmount && taxAmount > 0 && taxAmount.toFixed(2)}</p>
                <h5>{boxesOff < 0 ? "Per-cigar " : boxesOff > 0 ? boxesOff + "-box ":""} Discount</h5>
                <p>${total&&(subtotal+taxAmount-total).toFixed(2)}</p>
                <h4>Total</h4>
                <p className='total'>${cigars.length > 0 && total && total.toFixed(2)}</p>
            </div>

        </div>
    );
}
 
export default CigarOrderList2;

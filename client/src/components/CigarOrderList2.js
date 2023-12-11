import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from 'axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';
import Total from './Total';

function tax(item){
    if (item.hidden) return 0
    else if (item.quantityBox === 4) return 232 * item.qty
    else if (item.quantityBox === 10) return 580 * item.qty
    else if (item.quantityBox === 20) return 1160 * item.qty
    else if (item.quantityBox === 24) return 1392 * item.qty
    else if (item.quantityBox === 25) return 1450 * item.qty
    else if (item.quantityBox === 32) return 1856 * item.qty
    else if (item.quantityBox === 40) return 2320 * item.qty
    else return 0
}
function price(item){
    if (item.hidden) return 0;
    return item.priceBox * 100 * item.qty;
}
function priceWithDiscount(item){
    if (item.hidden) return {price:0, qty:0};
    return {price: item.priceBox * 100 * (item.discount ? 100 - item.discount : 100)/100, qty: item.qty};
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
function getTotal(cigars, setIsBox, setBoxesOff, taxes) {
    //check if box discount or manual
    const discounts = cigars.map(c => c.discount).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value > 0;
    });

    let isBox = !(discounts.length > 0);
    setIsBox( isBox );
    
    let prices = cigars.map(priceWithDiscount).filter(function (value) {
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
        let taxAmount = taxes ? cigars.map(tax).reduce(sum) : 0
        return {total: Math.ceil(prices.reduce(sum) + taxAmount)/100,
                tax: taxAmount/100};
    }
    else return 0;
}

const CigarOrderList2 = ({cigars, setOrderPrice, displayButton, taxes}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'
    const [key, setKey] = useState(5);
    const [subtotal, setSubtotal] = useState();
    const [taxAmount, setTaxAmount] = useState();
    const [total, setTotal] = useState();
    const [isBox, setIsBox] = useState(true);
    const [boxesOff, setBoxesOff] = useState("");
    const [allCigars, setAllCigars] = useState([]);

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


    const onCigarChange = (cid, field, value) => {
        //console.log("id: " + cid);
        let index = cigars.findIndex(c => c.id === cid);
        if (index === -1) {
            cigars.push({...allCigars[cid], id: cid})
        }
        index = cigars.findIndex(c => c.id === cid);
        if (cigars[index][field] === value) return;
        else {
            //console.log("id: " + cid + ", field: " + field + ", value: " + value);
            cigars[index][field] = value;
            //console.log(cigars);
            setKey(key*-1);
            let s = getSubtotal(cigars, setIsBox);
            let t = getTotal(cigars, setIsBox, setBoxesOff, taxes);
            setSubtotal(s);
            setTotal(t.total);
            setTaxAmount(t.tax);
            setOrderPrice(s, t);
        }
        console.log(cigars)
    }
    const notZeroCigars = cigars.filter(function (cigar) {
        return cigar.qty > 0;
    });
    let summary = notZeroCigars.map((cigar) => {
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
    });

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
                    <td key={index+.5}>{cigar.priceBox}</td>
                    <td><input className='cigar-qty cigar-col' type="number" defaultValue="" min={1} placeholder='Qty' 
                    onChange={(e) => {
                        onCigarChange(index, 'qty', e.target.value === "" ? 0 : parseInt(e.target.value));
                        if (e.target.value === "" || e.target.value === 0) cigar.set = false
                        else cigar.set = true
                    }} /></td>
                    <td><input className='cigar-qty cigar-col' type="number" defaultValue="" min={0} placeholder='% off' 
                    onChange={(e) => {onCigarChange(index, 'discount', e.target.value);}} /></td>
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
                <h5>Taxes</h5>
                <p>${taxAmount && taxAmount > 0 && taxAmount.toFixed(2)}</p>
                <h4>Total{boxesOff < 0 ? " (with per-cigar discount)" : boxesOff>0 ? " (with "+boxesOff+"-box discount)" : ""}</h4>
                <p className='total'>${cigars.length > 0 && total && total.toFixed(2)}</p>
            </div>

        </div>
    );
}
 
export default CigarOrderList2;

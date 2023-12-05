import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from 'axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';
import Total from './Total';

function tax(item){
    if (item.hidden) return 0
    else if (item.boxQty === 4) return 232 * item.qty
    else if (item.boxQty === 10) return 580 * item.qty
    else if (item.boxQty === 20) return 1160 * item.qty
    else if (item.boxQty === 24) return 1392 * item.qty
    else if (item.boxQty === 25) return 1450 * item.qty
    else if (item.boxQty === 32) return 1856 * item.qty
    else if (item.boxQty === 40) return 2320 * item.qty
    else return 0
}
function price(item){
    if (item.hidden) return 0;
    return item.price * item.qty;
}
function priceWithDiscount(item){
    if (item.hidden) return {price:0, qty:0};
    return {price: item.price * (item.discount ? 100 - item.discount : 100)/100, qty: item.qty === "" ? 0 : parseInt(item.qty)};
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
    const discounts = cigars.map(c => {if (!c.hidden) return c.discount}).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value > 0;
    });

    let isBox = !(discounts.length > 0);
    setIsBox( isBox );
    
    let prices = cigars.map(priceWithDiscount).filter(function (value) {
        return  !Number.isNaN(value.price) && value.price !== "" && 
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
                prices = prices.sort((a,b) => a.price - b.price);
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
        return Math.ceil(prices.reduce(sum) + taxAmount)/100;
    }
    else return 0;
}

const CigarOrderList = ({cigars, setOrderPrice, displayButton, taxes}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'
    const [key, setKey] = useState(5);
    const [subtotal, setSubtotal] = useState();
    const [total, setTotal] = useState();
    const [isBox, setIsBox] = useState(true);
    const [boxesOff, setBoxesOff] = useState("");

    const onCigarChange = (cid, field, value) => {
        //console.log("id: " + cid);
        const index = cigars.findIndex(c => c.id === cid);
        if (cigars[index][field] === value) return;
        else {
            //console.log("id: " + cid + ", field: " + field + ", value: " + value);
            cigars[index][field] = value;
            //console.log(cigars);
            setKey(key*-1);
            let s = getSubtotal(cigars, setIsBox);
            let t = getTotal(cigars, setIsBox, setBoxesOff, taxes);
            setSubtotal(s);
            setTotal(t);
            setOrderPrice(s, t);
        }
        //console.log(cigars)
    }

    return ( 
        <div className="cigar-list">
            {/*<h3>{cigs}</h3>*/}
            {/* Cigar List Header */}
            <div className="cigar">
                <p className="hcol cigar-brand">Brand</p>
                <p className="hcol cigar-name">Name</p>
                <p className="hcol cigar-blend">Blend</p>
                <p className="hcol cigar-size">Size</p>
                <p className="hcol cigar-qty">Qty</p>
                <p className="hcol cigar-discount">DC %</p>
                <p className="hcol cigar-price">$/Box</p>

            </div>
            {/* Cigar List */}

            {cigars.map((cigar, index) => (
                <Cigar 
                    key={index}
                    onCigarChange={(cid, field, value) => {onCigarChange(cid, field, value)}}
                    cid={cigar.id}
                />
            ))}

            {/* If displayButton param is passed, allow user to add cigars (Photos does not pass param) */}
            {displayButton ? <div className='cigar add-cigar'>
                <button onClick={() => {
                    console.log('click! adding cigar...');
                    let id = cigs ? cigars[cigs - 1].id + 1 : 1;
                    cigars.push({name: "", blend: "", size: "", qty: '', discount: '', price:"", hidden: false, boxQty:0, id: id});
                    setCigs(cigs + 1); // literally just a counter but it forces the cigar list to update when the button is pressed
                }}>Add cigar</button>
            </div> : <div></div>}

            {/*<Total key={key} cigars={cigars} />*/}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${cigars.length > 0 && subtotal && subtotal.toFixed(2)}</p>
                <h4>Total (with taxes{boxesOff < 0 ? " and per-cigar discount" : boxesOff>0 ? " and "+boxesOff+"-box discount" : ""})</h4>
                <p className='total'>${cigars.length > 0 && total && total.toFixed(2)}</p>
            </div>


        </div>
    );
}
 
export default CigarOrderList;

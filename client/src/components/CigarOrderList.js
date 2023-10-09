import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from 'axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';
import Total from './Total';


function price(item){
    if (item.hidden) return 0;
    return item.price * item.qty;
}
function priceWithDiscount(item){
    if (item.hidden) return 0;
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
        return prices.reduce(sum)/100;
    }
    else return 0;
}
function getTotal(cigars, setIsBox) {
    //check if box discount or manual
    const discounts = cigars.map(c => {if (!c.hidden) return c.discount}).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value > 0;
    });

    let isBox = !(discounts.length > 0);
    setIsBox( isBox );
    
    let prices = cigars.map(priceWithDiscount).filter(function (value) {
        return !Number.isNaN(value) && value !== "" && value;
    });

    if (!isBox) console.log("no box");
    if (isBox) {      // if using box discounts
        console.log("box");
        //prices = cigars.map(c => { return {price: c.price, id: c.id}}).filter(function (value) {
        if (true) {//(prices.length > 1) {
            const totalQty = prices.reduce((a,b)=>{
                return parseInt(a.qty) + parseInt(b.qty);
            });
            console.log(totalQty);
            if (totalQty >= 8 && totalQty%2===0) { // remove cheapest box if buying 8
                console.log("even");
                prices = prices.sort((a,b) => a.price - b.price);
                for (let i=0; i<totalQty/2 - 3; i++) {
                    prices[0].qty -= 1;
                    if (prices[0].qty == 0) prices = prices.slice(1);
                }
            }
            /*else if (totalQty == 10) {
                console.log("10");
                prices = prices.sort((a,b) => a.price - b.price);
                console.log(prices);
                prices[0].qty -= 1; // subtract 1. If 0, get rid of that cigar, then sub 1 from the next
                if (prices[0].qty == 0) prices = prices.slice(1);
                prices[0].qty -= 1;
                console.log(prices);
            }*/
            
        }
    }
    prices = prices.map((i) => i.price * i.qty);
    
    //return cigars.map(price).reduce(sum)/100;
    if (prices.length > 0) {
        //return prices.reduce((a, b) => a.price + b.price)/100;
        return prices.reduce(sum)/100;
    }
    else return 0;
}

const CigarOrderList = ({cigars, setOrderPrice, displayButton}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'
    const [key, setKey] = useState(5);
    const [subtotal, setSubtotal] = useState();
    const [total, setTotal] = useState();
    const [isBox, setIsBox] = useState(true);

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
            let t = getTotal(cigars, setIsBox);
            setSubtotal(s);
            setTotal(t);
            setOrderPrice(s, t);
        }
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
                <p className="hcol cigar-price">PPB</p>

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
                    cigars.push({brand: "", name: "", blend: "", size: "", qty: '', discount: '', price:"", hidden: false, id: id});
                    setCigs(cigs + 1); // literally just a counter but it forces the cigar list to update when the button is pressed
                }}>Add cigar</button>
            </div> : <div></div>}

            {/*<Total key={key} cigars={cigars} />*/}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${cigars.length > 0 && subtotal}</p>
                <h4>Total (with taxes and {isBox? "box" : "per-cigar"} discount)</h4>
                <p className='total'>${cigars.length > 0 && total}</p>
            </div>


        </div>
    );
}
 
export default CigarOrderList;

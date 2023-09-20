import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from 'axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';
import Total from './Total';

const cs = [{
    brand: "Esteban Carreras",
    name: "10 Anos",
    blend: "Maduro",
    sizeName: "Churchill"
},
{
    brand: "Esteban Carreras",
    name: "10 Anos",
    blend: "Maduro",
    sizeName: "Churchill"
},
{
    brand: "Esteban Carreras",
    name: "10 Anos",
    blend: "Maduro",
    sizeName: "Churchill"
}
]
function price(item){

    return item.price * item.qty * (item.discount ? 100 - item.discount : 100)/100;
}
  
function sum(prev, next){
    return prev + next;
}
function getSubtotal(cigars) {
    //console.log(cigars)
    const prices = cigars.map(price).filter(function (value) {
        return !Number.isNaN(value) && value !== "";
    });
    //return cigars.map(price).reduce(sum)/100;
    if (prices.length > 0) {
        return prices.reduce(sum)/100;
    }
    else return 0;
    
}

const CigarOrderList = ({cigars, displayButton}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'
    const [key, setKey] = useState(5);

    const onBrandChange = (cid, field, value) => {
        //console.log("id: " + cid);
        cigars[cid-1][field] = value;
        //console.log(cigars);
        setKey(key*-1);
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
                <p className="hcol cigar-price">Price</p>

            </div>
            {/* Cigar List */}

            {cigars.map((cigar) => (
                <Cigar 
                    onBrandChange={onBrandChange}
                    cid={cigar.id}
                />
            ))}

            {/* If displayButton param is passed, allow user to add cigars (Photos does not pass param) */}
            {displayButton ? <div className='cigar add-cigar'>
                <button onClick={() => {
                    console.log('click! adding cigar...');
                    let id = cigs ? cigars[cigs - 1].id + 1 : 1;
                    cigars.push({brand: "", name: "", blend: "", size: "", qty: '', discount: '', id: id});
                    setCigs(cigs + 1); // literally just a counter but it forces the cigar list to update when the button is pressed
                }}>Add cigar</button>
            </div> : <div></div>}

            {/*<Total key={key} cigars={cigars} />*/}
            <div className="subtotal">
                <h5>Subtotal</h5>
                <p>${cigars.length > 0 && getSubtotal(cigars)}</p>
                <h4>Total (with taxes and discount)</h4>
                <p className='total'>${cigars.length > 0 && getSubtotal(cigars)}</p>
            </div>


        </div>
    );
}
 
export default CigarOrderList;

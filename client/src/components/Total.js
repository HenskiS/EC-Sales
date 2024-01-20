import { useEffect, useState } from 'react';
import { CigarData } from '../data/CigarData';
import axios from '../api/axios';

import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';
import Cigar from './Cigar';

function price(item){
    return item.price;
}
  
function sum(prev, next){
    return prev + next;
}

const Total = (key, cigars) => {

    const p = () => {
        console.log("Cigars in total");
        console.log(cigars);
    }
    

    return (
        <div key={key}>{p()}</div>
        //p()
        /*<div className="subtotal">
            <h5>Subtotal</h5>
            <p>${cigars && console.log("cigars: " + cigars) && cigars.map(price).reduce(sum)}</p>
            <h4>Total (with taxes and discount)</h4>
            <p className='total'>${cigars && cigars.map(price).reduce(sum)}</p>
            {cigars && console.log("Sum: " + cigars.map(price).reduce(sum))}
        </div>*/
    );
}
 
export default Total;

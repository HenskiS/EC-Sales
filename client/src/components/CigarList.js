import { useState } from 'react';
import { FaAlignCenter } from 'react-icons/fa';
import * as IoIcons from 'react-icons/io';


const CigarList = ({cigars, displayButton}) => {

    const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'

    console.log(cigars);

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
                <p className="hcol cigar-discount">Discount %</p>

            </div>
            {/* Cigar List */}
            
            {!cigs ? <div></div> : cigars.map((cigar) => (
                <div className="cigar" key={cigar.id}>
                    <select className='cigar-brand cigar-col'>
                        <option defaultValue={cigar.brand}>{cigar.brand}</option>
                        <option value="Esteban Carreras">Esteban Carreras</option>
                        <option value="Bloodline">Bloodline</option>
                        <option value="Cuba Real">Cuba Real</option>
                        <option value="Vigilante">Vigilante</option>
                    </select>
                    <select className='cigar-name cigar-col'>
                        <option defaultValue={cigar.name}>{cigar.name}</option>
                        <option value="Hellcat">Hellcat</option>
                        <option value="Devils Hand">Devils Hand</option>
                        <option value="Gooding Real">Gooding Real</option>
                        <option value="Black Cross">Black Cross</option>
                        <option value="Bronze Cross">Bronze Cross</option>
                    </select>
                    <select className='cigar-blend cigar-col'>
                        <option defaultValue={cigar.blend}>{cigar.blend}</option>
                        <option value="Oscuro">Oscuro</option>
                        <option value="Melodioso">Melodioso</option>
                        <option value="Sabroso">Sabroso</option>
                    </select>
                    <select className='cigar-size cigar-col'>
                        <option defaultValue={cigar.size}>{cigar.size}</option>
                        <option value="Corona">Corona</option>
                        <option value="Toro">Toro</option>
                        <option value="Double Toro">Double Toro</option>
                        <option value="Corona Grande">Corona Grande</option>
                        <option value="Churchill">Churchill</option>
                    </select>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cigar.qty} />
                    <input type="number" className='cigar-discount cigar-col' defaultValue={cigar.discount} />
                </div>
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
        </div>
    );
}
 
export default CigarList;
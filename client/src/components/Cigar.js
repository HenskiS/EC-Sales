import { useEffect, useState } from "react";
import axios from '../api/axios';
import { IoMdTrash } from 'react-icons/io';
import Select from 'react-select'

const Cigar = ({ onCigarChange, cid/*, cigarDelete */}) => {

    //const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'

    const [cigarName, setCigarName] = useState("");
    const [cigarBlend, setCigarBlend] = useState("");
    const [cigarSize, setCigarSize] = useState("");
    const [cigarQty, setCigarQty] = useState("");
    const [cigarDiscount, setCigarDiscount] = useState("");
    const [cigarPrice, setCigarPrice] = useState("");
    const [boxQuantity, setBoxQuantity] = useState();

    const [cigarNames, setCigarNames] = useState(["fetching..."]);
    const [cigarBlends, setCigarBlends] = useState([""]);
    const [cigarSizes, setCigarSizes] = useState(["fetching..."]);

    //console.log(cigars);

    useEffect(() => {
        const getCigars = async () => {
            try {
                const response = await axios.get("/cigars/names");
                //console.log("/get cigars");
                //console.log(response.data);
                setCigarNames(response.data);
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, []);


    useEffect(() => {
        const getBlends = async () => {
            try {
                const response = await axios.post("/cigars/cigarblends", { brandAndName: cigarName});
                console.log("got " + cigarName + " blends");
                console.log(response);
                setCigarBlends(response.data[0]? response.data : []);
            } catch (err) { console.error(err); }
        }
        if (cigarName) {
            getBlends()
            .catch(console.error);
            setCigarSize("");
        }
    }, [cigarName])

    useEffect(() => {
        const getSizes = async () => {
            try {
                const response = await axios.post("/cigars/cigarsizes", { brandAndName: cigarName, blend: cigarBlends.length > 0 ? cigarBlend : ""});
                //console.log("got " + cigarName + " " + cigarBlend + " sizes");
                //console.log(response);
                setCigarSizes(response.data);
            } catch (err) { console.error(err); }
        }
        if (cigarName) {
            getSizes()
            .catch(console.error);
            setCigarSize("");
        }
    }, [cigarName, cigarBlend])

    useEffect(() => {
        const getPrice = async () => {
            try {
                const response = await axios.post("/cigars/priceandqty", { brandAndName: cigarName, blend: cigarBlends.length > 0 ? cigarBlend : "", sizeName: cigarSize});
                //console.log("got " + cigarName + " " + cigarBlend + " price: " + response.data);
                console.log(response);
                if (response.data.length) {
                    setCigarPrice(response.data[0].priceBox*100);
                    setBoxQuantity(response.data[0].quantityBox)
                }
                else {
                    setCigarPrice("");
                    setBoxQuantity("")
                }
            } catch (err) { console.error(err); }
        }
        if (cigarName) {
            getPrice()
            .catch(console.error);
        }
    }, [cigarName, cigarBlend, cigarSize])

    useEffect(() => {onCigarChange(cid, "name", cigarName);}, [cigarName])
    useEffect(() => {onCigarChange(cid, "blend", cigarBlend);}, [cigarBlend])
    useEffect(() => {onCigarChange(cid, "size", cigarSize);}, [cigarSize])
    useEffect(() => {onCigarChange(cid, "qty", cigarQty);}, [cigarQty])
    useEffect(() => {onCigarChange(cid, "discount", cigarDiscount);}, [cigarDiscount])
    useEffect(() => {onCigarChange(cid, "qty", cigarQty);}, [cigarQty])
    useEffect(() => {onCigarChange(cid, "price", cigarPrice);}, [cigarPrice])
    useEffect(() => {onCigarChange(cid, "boxQty", boxQuantity);}, [boxQuantity])

    const [hidden, setHidden] = useState(false);
    return (
        hidden? <></> :     // basically, hide div rather than actually deleting from cigars array in parent.
                            // onCigarChange sets the hidden param to true in cigars array, then discard these when finalizing.
                            // This avoids the odd bug of filling in the next cigar with the values of the deleted cig,
                            // while not actually changing the values in the array. It was weird, this fixes it
        <div className="cigar">
            <button className="trash" onClick={() => {onCigarChange(cid, "hidden", true); setHidden(true)}}><IoMdTrash /></button>
            {/*<select className='cigar-brand cigar-col' onChange={ (e) => {
                    setBrand(e.target.value);
                    //onCigarChange(id, "brand", e.target.value);
                    //document.getElementById('cigar-name').value = "";
                    setCigarName("");} }>
                
                <option value="" >---</option>
                
                {brands.map((brand, index) => (
                    <option key={index} value={brand}>{brand}</option>
                ))}
            </select>*/}
            
            <Select options={cigarNames.map((name) => ({label: name, value: name}))} 
            onChange={(e) => {setCigarName(e.value); setCigarBlend(""); setCigarSize("")} } />
            
            <select id='cigar-blend' className='cigar-blend cigar-col' defaultValue={""} disabled={cigarBlends.length === 0} onChange={(e) => {
                //onCigarChange(id, "blend", e.target.value);
                setCigarBlend(e.target.value);
            }}>
                {<option value="" /*selected={cigarBlend === ""}*/ >---</option>}
                {/* brand!=="" && cigarName!=="" && CigarData[ brand ].find(c => c.name === cigarName).blends.map((blend) => (
                    <option value={blend}>{blend}</option>
                ))*/}
                { cigarBlends.map((cigar) => (
                    <option value={cigar} key={cigar}>{cigar}</option>
                ))}
            </select>
            <select className='cigar-size cigar-col' value={cigarSize} onChange={(e) => {
                setCigarSize(e.target.value);
                //onCigarChange(id, "size", e.target.value);
                setCigarBlend( cigarBlends.length > 0 ? cigarBlend : "" )
            }}>
                <option value="" >---</option>
                {/* brand!=="" && cigarName!=="" && CigarData[ brand ].find(c => c.name === cigarName).sizes.map((size) => (
                    <option value={size}>{size}</option>
                ))*/}
                { cigarSizes.map((cigar) => (
                    <option value={cigar} key={cigar}>{cigar}</option>
                ))}
            </select>
            <input className='cigar-qty cigar-col' type="number" defaultValue="" min={1} onChange={(e) => {
                //onCigarChange(id, "qty", e.target.value);
                setCigarQty(e.target.value);
            }} />
            <input type="number" className='cigar-discount cigar-col' defaultValue="" min={0} onChange={(e) => {
                //onCigarChange(id, "discount", e.target.value);
                setCigarDiscount(e.target.value);
            }} />
            {
                <p className='cigar-price'>{!( cigarName && cigarSize && (cigarBlends.length === 0 || cigarBlend) ) ? " " : 
                    isNaN(parseInt(cigarPrice)) ? " " : parseInt(cigarPrice)/100
                }</p>
            }
            
        </div>
    )
    
}

export default Cigar;
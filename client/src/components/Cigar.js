import { useEffect, useState } from "react";
import axios from 'axios';


const Cigar = ({ onBrandChange, cid }) => {

    //const [cigs, setCigs] = useState(cigars.length); // cigs is a counter, only used to update the list onClick 'Add Cigar'

    const [brand, setBrand] = useState("");
    const [cigarName, setCigarName] = useState("");
    const [cigarBlend, setCigarBlend] = useState("");
    const [cigarSize, setCigarSize] = useState("");
    const [cigarQty, setCigarQty] = useState("");
    const [cigarDiscount, setCigarDiscount] = useState("");
    const [cigarPrice, setCigarPrice] = useState("");

    const [brands, setBrands] = useState(["fetching..."]);
    const [cigarNames, setCigarNames] = useState(["fetching..."]);
    const [cigarBlends, setCigarBlends] = useState(["fetching..."]);
    const [cigarSizes, setCigarSizes] = useState(["fetching..."]);

    //console.log(cigars);

    useEffect(() => {
        const getBrands = async () => {
            try {
                const response = await axios.get("http://localhost:3001/cigars/cigarbrands");
                console.log("got brands");
                console.log(response);
                setBrands(response.data);
            } catch (err) { console.error(err); }
        }
        getBrands()
        .catch(console.error);
    }, []);

    useEffect(() => {
        const getCigars = async () => {
            try {
                const response = await axios.post("http://localhost:3001/cigars/cigarnames", { brand: brand });
                console.log("got " + brand + " cigars");
                //console.log(response);
                setCigarNames(response.data);
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, [brand])

    useEffect(() => {
        const getBlends = async () => {
            try {
                const response = await axios.post("http://localhost:3001/cigars/cigarblends", { brand: brand , name: cigarName});
                console.log("got " + cigarName + " blends");
                //console.log(response);
                setCigarBlends(response.data);
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
                const response = await axios.post("http://localhost:3001/cigars/cigarsizes", { brand: brand , name: cigarName, blend: cigarBlends.length > 0 ? cigarBlend : ""});
                console.log("got " + cigarName + " " + cigarBlend + " sizes");
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
                const response = await axios.post("http://localhost:3001/cigars/cigarprice", { brand: brand , name: cigarName, blend: cigarBlends.length > 0 ? cigarBlend : "", sizeName: cigarSize});
                console.log("got " + cigarName + " " + cigarBlend + " price: " + response.data);
                //console.log(response);
                setCigarPrice(response.data[0]*100);
            } catch (err) { console.error(err); }
        }
        if (cigarName) {
            getPrice()
            .catch(console.error);
        }
    }, [brand, cigarName, cigarBlend, cigarSize])

    useEffect(() => {onBrandChange(cid, "brand", brand);}, [brand])
    useEffect(() => {onBrandChange(cid, "name", cigarName);}, [cigarName])
    useEffect(() => {onBrandChange(cid, "blend", cigarBlend);}, [cigarBlend])
    useEffect(() => {onBrandChange(cid, "size", cigarSize);}, [cigarSize])
    useEffect(() => {onBrandChange(cid, "qty", cigarQty);}, [cigarQty])
    useEffect(() => {onBrandChange(cid, "discount", cigarDiscount);}, [cigarDiscount])
    useEffect(() => {onBrandChange(cid, "qty", cigarQty);}, [cigarQty])
    useEffect(() => {onBrandChange(cid, "price", cigarPrice);}, [cigarPrice])

    return (
        
        <div className="cigar">
            <select className='cigar-brand cigar-col' onChange={ (e) => {
                    setBrand(e.target.value);
                    //onBrandChange(id, "brand", e.target.value);
                    //document.getElementById('cigar-name').value = "";
                    setCigarName("");} }>
                
                <option value="" >---</option>
                
                {brands.map((brand) => (
                    <option value={brand}>{brand}</option>
                ))}
            </select>

            <select id='cigar-name' className='cigar-name cigar-col' onChange={(e) => { 
                    //onBrandChange(id, "name", e.target.value);
                    setCigarName(e.target.value);
                    setCigarBlend("");
                    setCigarSize("");
                    /*document.getElementById('cigar-blend').value = "";*/} }>
                <option value="" selected={cigarName === ""}>---</option>
                {/* brand!=="" && CigarData[ brand ].map((cigar) => (
                    <option value={cigar.name}>{cigar.name}</option>
                ))*/}
                { cigarNames.map((cigar) => (
                    <option value={cigar}>{cigar}</option>
                ))}
            </select>
            <select id='cigar-blend' className='cigar-blend cigar-col' disabled={cigarBlends.length === 0} onChange={(e) => {
                //onBrandChange(id, "blend", e.target.value);
                setCigarBlend(e.target.value);
            }}>
                {<option value="" selected={cigarBlend === ""} >---</option>}
                {/* brand!=="" && cigarName!=="" && CigarData[ brand ].find(c => c.name === cigarName).blends.map((blend) => (
                    <option value={blend}>{blend}</option>
                ))*/}
                { cigarBlends.map((cigar) => (
                    <option value={cigar}>{cigar}</option>
                ))}
            </select>
            <select className='cigar-size cigar-col' onChange={(e) => {
                setCigarSize(e.target.value);
                //onBrandChange(id, "size", e.target.value);
                setCigarBlend( cigarBlends.length > 0 ? cigarBlend : "" )
            }}>
                <option value="" selected={cigarSize === ""}>---</option>
                {/* brand!=="" && cigarName!=="" && CigarData[ brand ].find(c => c.name === cigarName).sizes.map((size) => (
                    <option value={size}>{size}</option>
                ))*/}
                { cigarSizes.map((cigar) => (
                    <option value={cigar}>{cigar}</option>
                ))}
            </select>
            <input className='cigar-qty cigar-col' type="number" defaultValue="" min={1} onChange={(e) => {
                //onBrandChange(id, "qty", e.target.value);
                setCigarQty(e.target.value);
            }} />
            <input type="number" className='cigar-discount cigar-col' defaultValue="" min={0} onChange={(e) => {
                //onBrandChange(id, "discount", e.target.value);
                setCigarDiscount(e.target.value);
            }} />
            {
                <p className='cigar-price'>{!( brand && cigarName && cigarSize && (cigarBlends.length === 0 || cigarBlend) ) ? " " : 
                    cigarPrice/100
                }</p>
            }
            
        </div>
    )
    
}

export default Cigar;
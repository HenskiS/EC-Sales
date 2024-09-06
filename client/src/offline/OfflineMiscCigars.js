import { useState, useContext, useEffect } from "react"
import OfflineContext from "./OfflineContext"

const OfflineMiscCigars = () => {
    const { cigars: cart, 
        setCigars: setCart,
        client, coreDiscount, setCoreDiscount,
        addCigar, updateMiscCigar,
        isBoxDiscount, setIsBoxDiscount, discount, boxesOff, boxesUsed, updateBoxesOff,
        updateQuantity,
        updateDiscount,
        removeCigar,
        subtotal,
        total,
        taxAmount
    } = useContext(OfflineContext)

    const [c1, setC1] = useState({
        _id: "c1",
        brandAndName: "",
        blend: "",
        sizeName: "",
        quantityBox: 0,
        size: "",
        priceEach: 0,
        priceBox: 0,
        qty: 0,
        coreline: false
    })
    const [c2, setC2] = useState({
        _id: "c2",
        brandAndName: "",
        blend: "",
        sizeName: "",
        quantityBox: 0,
        size: "",
        priceEach: 0,
        priceBox: 0,
        qty: 0,
        coreline: false
    })
    const [c3, setC3] = useState({
        _id: "c3",
        brandAndName: "",
        blend: "",
        sizeName: "",
        quantityBox: 0,
        size: "",
        priceEach: 0,
        priceBox: 0,
        qty: 0,
        coreline: false
    })
    const [c4, setC4] = useState({
        _id: "c4",
        brandAndName: "",
        blend: "",
        sizeName: "",
        quantityBox: 0,
        size: "",
        priceEach: 0,
        priceBox: 0,
        qty: 0,
        coreline: false
    })
    const [c5, setC5] = useState({
        _id: "c5",
        brandAndName: "",
        blend: "",
        sizeName: "",
        quantityBox: 0,
        size: "",
        priceEach: 0,
        priceBox: 0,
        qty: 0,
        coreline: false
    })

    useEffect(()=>{
        updateMiscCigar(c1)
    }, [c1])
    useEffect(()=>{
        updateMiscCigar(c2)
    }, [c2])
    useEffect(()=>{
        updateMiscCigar(c3)
    }, [c3])
    useEffect(()=>{
        updateMiscCigar(c4)
    }, [c4])
    useEffect(()=>{
        updateMiscCigar(c5)
    }, [c5])

    return (
        <>
            <tr>
                <td><b>Miscellaneous</b></td>
                <td>Blend</td>
                <td>Size Name</td>
                <td>Box Qty</td>
                <td>Price</td>
                <td>Qty</td>
            </tr>
            <tr className={ cart.find(oldCigar => oldCigar._id === c1._id) ? "row-selected" : ""}>
                <td>
                    <input className='cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.brandAndName ?? "" } placeholder='Name' 
                        onChange={ (e) => { setC1({...c1, brandAndName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.blend ?? "" } placeholder='Blend' 
                        onChange={ (e) => { setC1({...c1, blend: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.sizeName ?? "" } placeholder='Size Name' 
                        onChange={ (e) => { setC1({...c1, sizeName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.size ?? "" } placeholder='BoxQty' 
                        onChange={ (e) => { setC1({...c1, quantityBox: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.priceBox ?? "" } placeholder='Price' 
                        onChange={ (e) => { setC1({...c1, priceBox: parseFloat(e.target.value)}) } }
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c1._id)?.qty ?? "" } min={1} placeholder='Qty' 
                        onChange={ (e) => { setC1({...c1, qty: parseInt(e.target.value)}) } }
                    /></td>
            </tr>

            <tr className={ cart.find(oldCigar => oldCigar._id === c2._id) ? "row-selected" : ""}>
                <td>
                    <input className='cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.brandAndName ?? "" } placeholder='Name' 
                        onChange={ (e) => { setC2({...c2, brandAndName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.blend ?? "" } placeholder='Blend' 
                        onChange={ (e) => { setC2({...c2, blend: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.sizeName ?? "" } placeholder='Size Name' 
                        onChange={ (e) => { setC2({...c2, sizeName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.size ?? "" } placeholder='BoxQty' 
                        onChange={ (e) => { setC2({...c2, quantityBox: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.priceBox ?? "" } placeholder='Price' 
                        onChange={ (e) => { setC2({...c2, priceBox: parseFloat(e.target.value)}) } }
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c2._id)?.qty ?? "" } min={1} placeholder='Qty' 
                        onChange={ (e) => { setC2({...c2, qty: parseInt(e.target.value)}) } }
                    />
                </td>
            </tr>

            <tr className={ cart.find(oldCigar => oldCigar._id === c3._id) ? "row-selected" : ""}>
                <td>
                    <input className='cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.brandAndName ?? "" } placeholder='Name' 
                        onChange={ (e) => { setC3({...c3, brandAndName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.blend ?? "" } placeholder='Blend' 
                        onChange={ (e) => { setC3({...c3, blend: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.sizeName ?? "" } placeholder='Size Name' 
                        onChange={ (e) => { setC3({...c3, sizeName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.size ?? "" } placeholder='BoxQty' 
                        onChange={ (e) => { setC3({...c3, quantityBox: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.priceBox ?? "" } placeholder='Price' 
                        onChange={ (e) => { setC3({...c3, priceBox: parseFloat(e.target.value)}) } }
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c3._id)?.qty ?? "" } min={1} placeholder='Qty' 
                        onChange={ (e) => { setC3({...c3, qty: parseInt(e.target.value)}) } }
                    />
                </td>
            </tr>

            <tr className={ cart.find(oldCigar => oldCigar._id === c4._id) ? "row-selected" : ""}>
                <td>
                    <input className='cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.brandAndName ?? "" } placeholder='Name' 
                        onChange={ (e) => { setC4({...c4, brandAndName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.blend ?? "" } placeholder='Blend' 
                        onChange={ (e) => { setC4({...c4, blend: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.sizeName ?? "" } placeholder='Size Name' 
                        onChange={ (e) => { setC4({...c4, sizeName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.size ?? "" } placeholder='BoxQty' 
                        onChange={ (e) => { setC4({...c4, quantityBox: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.priceBox ?? "" } placeholder='Price' 
                        onChange={ (e) => { setC4({...c4, priceBox: parseFloat(e.target.value)}) } }
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c4._id)?.qty ?? "" } min={1} placeholder='Qty' 
                        onChange={ (e) => { setC4({...c4, qty: parseInt(e.target.value)}) } }
                    />
                </td>
            </tr>

            <tr className={ cart.find(oldCigar => oldCigar._id === c5._id) ? "row-selected" : ""}>
                <td>
                    <input className='cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.brandAndName ?? "" } placeholder='Name' 
                        onChange={ (e) => { setC5({...c5, brandAndName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.blend ?? "" } placeholder='Blend' 
                        onChange={ (e) => { setC5({...c5, blend: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-size cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.sizeName ?? "" } placeholder='Size Name' 
                        onChange={ (e) => { setC5({...c5, sizeName: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="text" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.size ?? "" } placeholder='BoxQty' 
                        onChange={ (e) => { setC5({...c5, quantityBox: (e.target.value)}) } } 
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.priceBox ?? "" } placeholder='Price' 
                        onChange={ (e) => { setC5({...c5, priceBox: parseFloat(e.target.value)}) } }
                    />
                </td>
                <td>
                    <input className='cigar-qty cigar-col' type="number" defaultValue={cart.find(oldCigar => oldCigar._id === c5._id)?.qty ?? "" } min={1} placeholder='Qty' 
                        onChange={ (e) => { setC5({...c5, qty: parseInt(e.target.value)}) } }
                    />
                </td>
            </tr>
        </>
    )
}

export default OfflineMiscCigars
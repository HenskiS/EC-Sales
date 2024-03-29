import { Fragment, useEffect, useState } from "react"
import axios from "../api/axios";
import {config} from "../api/axios.js";

const saveTax = async (tax) => {
    console.log("saving tax...")
    try {
        console.log("inside try catch")
        const response = await axios.post("/api/orders/catax/", {tax}, config());
        console.log(response.data);
    } catch (err) { console.error(err); }
}


const Tax = () => {
    const [tax, setTax] = useState("")

    useEffect(() => {
        // get CA tax amount
        const getTax = async () => {
            try {
                const response = await axios.get("/api/orders/catax/", config());
                console.log("got CA tax info");
                console.log(response);
                setTax(response.data);
            } catch (err) { console.error(err); }
        }
        getTax();
    }, [])

    return (
        <Fragment>
            <br />
            <h3>CA Tax</h3>
            <hr />
            <span className="ca-tax-span">
                <label htmlFor="tax-input">CA Tax in Cents:</label>
                <input type="number" className="ca-tax-input" id="tax-input" value={tax} onChange={(e) => setTax(e.target.value)} />
                <button className="save-tax-button" onClick={() => saveTax(tax)}>Save</button>
            </span>
        </Fragment>
    )

}

export default Tax;
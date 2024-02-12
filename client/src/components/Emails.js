import { Fragment, useEffect, useState } from "react"
import axios from "../api/axios";
import {config} from "../api/axios.js";
import { ReactMultiEmail, isEmail } from 'react-multi-email'

const saveEmails = async (emails) => {
    console.log("saving tax...")
    try {
        console.log("inside try catch")
        const response = await axios.post("/api/orders/emails/", {emails}, config());
        console.log(response.data);
    } catch (err) { console.error(err); }
}

const Emails = () => {
    const [emails, setEmails] = useState([])

    useEffect(() => {
        // get CA tax amount
        const getEmails = async () => {
            try {
                const response = await axios.get("/api/orders/emails/", config());
                console.log("got email recipients");
                console.log(response.data);
                setEmails(response.data);
            } catch (err) { console.error(err); }
        }
        getEmails();
    }, [])

    return (
        <Fragment>
            <br />
            <h3>Order Email Recipients</h3>
            <hr />
            
            <ReactMultiEmail 
                    placeholder='Input email address(es)'
                    emails={emails}
                    onChange={(emails) => {setEmails(emails)}}
                    getLabel={(email, index, removeEmail) => (
                        <div data-tag key={index}>
                        <div data-tag-item>{email}</div>
                        <span data-tag-handle onClick={() => removeEmail(index)}>×</span>
                        </div>
                    )}/>
            <button className="save-email-button" onClick={() => saveEmails(emails)}>Save</button>
        </Fragment>
    )

}

export default Emails;
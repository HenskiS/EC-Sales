import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io"
import axios from "axios";


const ClientInfo = ({ id, close }) => {
    const [client, setClient] = useState({
        name: "Smokey Joe",
        phone: "310-818-3235",
        address1: "123 S Sotheby Ln",
        address2: "",
        city: "Los Angeles",
        state: "CA",
        zip: "90210"
      });

    useEffect(() => {
        const getClient = async () => {
            try {
                const response = await axios.post("http://192.168.1.133:3001/clients/getclientbyid", {id});
                console.log("got clients");
                console.log(response);
                setClient(response.data);
            } catch (err) { console.error(err); }
        }
        getClient()
        .catch(console.error);
    }, []);

    return (
        <div className="ClientInfo">
            <div className="clientinfo-header">
                {/*<h5>Info for Client {id}</h5>*/}
                <h2 className="client-name">{client.name}</h2>
                <IoIosClose onClick={close} />
            </div>
            <div className="client-info">
                {/*<h4 className="client-name">{client.name}</h4>*/}
                <p className="client-phone">{client.phone}</p>
                <p className="client-address">{client.address1}</p>
                <p className="client-city">{client.city}</p>
                <p className="client-state-and-zip">{client.state + " " + client.zip}</p>
            </div>
        </div>
    );
}
 
export default ClientInfo;

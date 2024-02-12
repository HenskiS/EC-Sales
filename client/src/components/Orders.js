import { Fragment, useEffect, useState } from "react";
import axios from "../api/axios";
import {config} from "../api/axios.js";

const Orders = () => {

    const [users, setUsers] = useState([])
    const [orders, setOrders] = useState([])
    const [totals, setTotals] = useState([])

    const getSalesmanTotal = async (id) => {
        console.log("getSalesmanTotal")
        let total = 0
        try {
            /*const token = JSON.parse(sessionStorage.getItem('token'));
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };*/
            const response = await axios.post("/api/orders/salesmantotal", {id}, config());
            console.log("got salesman total");
            console.log(response);
            total = response.data;
            //setEditClient(response.data);
        } catch (err) { console.error(err); }
        return total
    }
    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await axios.get("/api/users/", config());
                //console.log("got users info");
                //console.log(response);
                setUsers(response.data);
                let temp = []
                for (let i=0; i<response.data.length; i++) {
                    let t = await getSalesmanTotal(response.data[i]._id)
                    temp.push(t)
                }
                setTotals(temp)
                //console.log("temp:")
                //console.log(temp)
            } catch (err) { console.error(err); }
        }
        getUsers();
    }, [])
    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await axios.get("/api/orders/ordersminuscigars/", config());
                console.log("got orders info");
                console.log(response);
                setOrders(response.data.reverse());
            } catch (err) { console.error(err); }
        }
        getOrders();
    }, [])

    const [pdfList, setPdfList] = useState([]);
    const [selectedPdf, setSelectedPdf] = useState(null);

    const handlePdfClick = (pdfFileName) => {
        if (pdfFileName === selectedPdf)
            setSelectedPdf("")
        else
            setSelectedPdf(pdfFileName);
    };

    return (
        <Fragment>
            <br />
            <h3>Sales Totals</h3>
            <hr />
            {totals.map((total, index) => (
                <p key={index}>{users[index].name}: ${Number(total).toFixed(2)}</p>
            ))}
            <br />
            <h3>Orders</h3>
            <hr />
            {!orders.length? <></> : orders.map((order, index) => (
                <Fragment key={index}>
                    <button key={index} className={order.filename !== selectedPdf ? "orderpdf" : "orderpdf-selected"} 
                        onClick={() => {handlePdfClick(order.filename); console.log(order.filename)}} >
                        {new Date(order.date).toLocaleDateString()} - ${order.cigars.total}, {order.salesman.name} to {order.client.name}
                    </button>
                    
                </Fragment>
            ))}
            {selectedPdf && (
                <PdfViewer pdfFileName={selectedPdf} />
            )}
        </Fragment>
    )
}

const PdfViewer = ({ pdfFileName }) => {

    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfErr, setPdfErr] = useState(false);

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                setPdfErr(false)

                const response = await axios.get(`/api/orders/pdfs/${pdfFileName}`, {
                    ...config(), 
                    responseType: 'blob'
                });
                const blob = new Blob([response.data], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                setPdfUrl(url)

            } catch (err) { console.error('Error fetching PDF:', err); setPdfErr(true) }
        }

        fetchPdf();

        return () => {
            // Clean up URL object when component unmounts
            URL.revokeObjectURL(pdfUrl);
        }

    }, [pdfFileName])
    
    return (
      <div>
        <h3>PDF Viewer</h3>
        {pdfErr? <p style={{color: "red"}}><i>Error fetching {pdfFileName}</i></p> : 
        <iframe
          title="PDF Viewer"
          src={pdfUrl}
          width="100%"
          height="600px"
          headers={config()}
        />}
      </div>
    );
  };

export default Orders
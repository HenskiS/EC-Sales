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
    // Sales Totals disabled — the per-salesman N+1 fetch below was slowing the dashboard.
    // To re-enable, uncomment this effect and the "Sales Totals" render block below.
    // useEffect(() => {
    //     const getUsers = async () => {
    //         try {
    //             const response = await axios.get("/api/users/", config());
    //             setUsers(response.data);
    //             let temp = []
    //             for (let i=0; i<response.data.length; i++) {
    //                 let t = await getSalesmanTotal(response.data[i]._id)
    //                 temp.push(t)
    //             }
    //             setTotals(temp)
    //         } catch (err) { console.error(err); }
    //     }
    //     getUsers();
    // }, [])
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

    const PAGE_SIZE = 25;
    const [page, setPage] = useState(0);
    const pageCount = Math.ceil(orders.length / PAGE_SIZE);
    const pagedOrders = orders.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const handlePdfClick = (pdfFileName) => {
        if (pdfFileName === selectedPdf)
            setSelectedPdf("")
        else
            setSelectedPdf(pdfFileName);
    };

    return (
        <Fragment>
            <br />
            {/* Sales Totals disabled for performance — re-enable with the getUsers effect above.
            <h3>Sales Totals</h3>
            <hr />
            {totals.map((total, index) => (
                <p key={index}>{users[index].name}: ${Number(total).toFixed(2)}</p>
            ))}
            <br /> */}
            <h3>Orders</h3>
            <hr />

            <div className="order-list">
                {!orders.length? <></> : pagedOrders.map((order, index) => (
                    <Fragment key={index}>
                        <button key={index} className={order.filename !== selectedPdf ? "orderpdf" : "orderpdf-selected"}
                            onClick={() => {handlePdfClick(order.filename); console.log(order.filename)}} >
                            {order.isEstimate && <strong style={{ color: '#b8860b' }}>[ESTIMATE] </strong>}
                            {new Date(order.date).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })} - ${order.cigars.total}, {order.salesman.name} to {order.client.company ?? order.client.name ?? order.client.contact ?? order.client.city}
                        </button>

                    </Fragment>
                ))}
            </div>

            {orders.length > PAGE_SIZE && (
                <div className="order-pagination">
                    <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
                        Prev
                    </button>
                    <span> Page {page + 1} of {pageCount} </span>
                    <button disabled={page >= pageCount - 1} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}>
                        Next
                    </button>
                </div>
            )}

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
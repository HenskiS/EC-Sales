import React, { useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import axios from '../api/axios'
import {config} from "../api/axios.js";
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional Theme applied to the grid
import "../assets/index.css"

const CigarsController = () => {
    const [cigars, setCigars] = useState([])

    const currencyFormatter = (params) => {
        return params.value? "$" + Number(params.value).toFixed(2) : "";
    };

    const colDefs = [
        { headerName: "Name", field: "brandAndName", flex:1.5, filter: true, floatingFilter: true, editable: true,},
        { headerName: "Size name", field: "sizeName", flex:1, filter: true, floatingFilter: true, editable: true },
        { headerName: "Size", field: "size", flex:1, filter: true, floatingFilter: true, editable: true },
        { headerName: "Blend", field: "blend", flex:1, filter: true, floatingFilter: true, editable: true },
        { headerName: "Price: Each", field: "priceEach",flex:1, filter: true, floatingFilter: true, valueFormatter: currencyFormatter, editable: true, },
        { headerName: "Price: Box", field: "priceBox",flex:1, filter: true, floatingFilter: true, valueFormatter: currencyFormatter, editable: true, },
        { headerName: "California", field: "isCalifornia", flex:0.75, filter: true, floatingFilter: true, editable: true, cellDataType: 'boolean' },
    ]
    useEffect(() => {
        const getCigars = async () => {
            try {
                /*const token = JSON.parse(sessionStorage.getItem('token'));
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };*/
                const response = await axios.get("/api/cigars/", config());
                console.log("got all cigars");
                console.log(response);
                setCigars(response.data)
            } catch (err) { console.error(err); }
        }
        getCigars()
        .catch(console.error);
    }, [])
    const pagination = true;
    const paginationPageSize = 20;
    const paginationPageSizeSelector = [20, 50, 100, 200];
    const gridOptions = {
        defaultColDef: {
            resizable: true,
            initialWidth: 200,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        },
        autoSizeStrategy: {
            type: 'fitGridWidth',
            defaultMinWidth: 100,
        },
        // other grid options ...
    }
    const handleCellValueChanged = (e) => {
        if (e.column.colId === "brandAndName") handleNameChanged(e)
        if (e.column.colId === "sizeName") handleSizeNameChanged(e)
        if (e.column.colId === "size") handleSizeChanged(e)
        if (e.column.colId === "blend") handleBlendChanged(e)
        if (e.column.colId === "priceBox") handlePriceBoxChanged(e)
        if (e.column.colId === "priceEach") handlePriceEachChanged(e)
        if (e.column.colId === "isCalifornia") handleIsCaliforniaChanged(e)

    }
    
    const handleNameChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, brandAndName: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/", 
                { _id: e.data._id, brandAndName: e.data.brandAndName} ,config());
                console.log("posted brandAndName");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handleSizeNameChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, sizeName: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/", 
                { _id: e.data._id, sizeName: e.data.sizeName} ,config());
                console.log("posted sizeName");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handleSizeChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, size: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/", 
                { _id: e.data._id, size: e.data.size} ,config());
                console.log("posted size");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handleBlendChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, blend: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/", 
                { _id: e.data._id, blend: e.data.blend} ,config());
                console.log("posted blend");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handlePriceBoxChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, priceBox: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/", 
                { _id: e.data._id, priceBox: e.data.priceBox} ,config());
                console.log("posted priceBox");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handlePriceEachChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, priceEach: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/",
                { _id: e.data._id, priceEach: e.data.priceEach} ,config());
                console.log("posted priceEach");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }
    const handleIsCaliforniaChanged = (e) => {
        console.log(e)
        const updatedCigars = cigars.map(cigar =>
            cigar._id === e.data._id ? {...cigar, isCalifornia: e.newValue } : cigar
        )
        setCigars(updatedCigars)
        // update db
        const patchCigar = async () => {
            try {
                const response = await axios.patch("/api/cigars/",
                { _id: e.data._id, isCalifornia: e.data.isCalifornia} ,config());
                console.log("posted isCalifornia");
                console.log(response);
            } catch (err) { console.error(err); }
        }
        patchCigar()
        .catch(console.error);
    }


    return (
        <div>
            <br />
            <h3>Cigars</h3>
            <hr />
            <div className='ag-theme-quartz'style={{width:"100%",height:"600px", marginBottom: "100px", marginTop: "10px",}}>
                <AgGridReact
                    rowData={cigars}
                    columnDefs={colDefs}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                    gridOptions={gridOptions}
                    onCellValueChanged={handleCellValueChanged}
                />
            </div>
        </div>
    )
}

export default CigarsController
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { config } from "../api/axios.js";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../assets/Stats.css';

const Stats = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salesmen, setSalesmen] = useState([]);
    const [selectedSalesman, setSelectedSalesman] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTerritory, setSelectedTerritory] = useState('all');

    const uinfo = sessionStorage.getItem('UserInfo');
    const UserInfo = uinfo ? JSON.parse(uinfo) : { name: "", userID: "", roles: [] };
    const isAdmin = UserInfo.roles?.includes("Admin");

    useEffect(() => {
        // Fetch salesmen list for admin
        const fetchSalesmen = async () => {
            try {
                const response = await axios.get("/api/users", config());
                setSalesmen(response.data);
            } catch (err) {
                console.error("Error fetching salesmen:", err);
            }
        };

        if (isAdmin) {
            fetchSalesmen();
        } else {
            // Non-admin users see only their own stats
            setSelectedSalesman(UserInfo.userID);
        }
    }, [isAdmin, UserInfo.userID]);

    useEffect(() => {
        fetchStats();
    }, [selectedSalesman]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const payload = {
                salesmanId: isAdmin ? selectedSalesman : UserInfo.userID,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };

            const response = await axios.post("/api/orders/stats", payload, config());
            setStatsData(response.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="stats-container"><h2>Loading stats...</h2></div>;
    }

    if (!statsData) {
        return <div className="stats-container"><h2>No data available</h2></div>;
    }

    // Prepare data for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Sales by category pie chart data
    const categoryData = [
        { name: 'Coreline', value: statsData.salesByCategory.coreline },
        { name: 'Non-Coreline', value: statsData.salesByCategory.nonCoreline }
    ].filter(item => item.value > 0);

    const blendData = [
        { name: 'Maduro', value: statsData.salesByCategory.maduro },
        { name: 'Natural/Connecticut', value: statsData.salesByCategory.natural },
        { name: 'Flavored', value: statsData.salesByCategory.flavored },
        { name: 'Other', value: statsData.salesByCategory.other }
    ].filter(item => item.value > 0);

    // Format monthly sales for line chart
    const monthlySalesData = statsData.monthlySales.map(item => ({
        month: item.month,
        sales: item.totalSales,
        orders: item.orderCount,
        boxes: item.boxCount
    }));

    // Get territories for filter
    const territories = ['all', ...Object.keys(statsData.topAccountsByTerritory).sort()];

    // Filter accounts by territory
    const filteredAccounts = selectedTerritory === 'all'
        ? statsData.orderFrequency
        : statsData.orderFrequency.filter(acc => acc.state === selectedTerritory);

    // AG Grid column definitions for order frequency
    const orderFrequencyColumns = [
        { field: 'clientName', headerName: 'Client', sortable: true, filter: true, flex: 2 },
        { field: 'company', headerName: 'Company', sortable: true, filter: true, flex: 2 },
        { field: 'city', headerName: 'City', sortable: true, filter: true, flex: 1 },
        { field: 'state', headerName: 'State', sortable: true, filter: true, width: 100 },
        { field: 'orderCount', headerName: 'Orders', sortable: true, filter: true, width: 100 },
        {
            field: 'totalSales',
            headerName: 'Total Sales',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: params => `$${params.value.toFixed(2)}`
        },
        {
            field: 'avgDaysBetweenOrders',
            headerName: 'Avg Days Between Orders',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: params => params.value ? `${params.value} days` : 'N/A'
        },
        {
            field: 'daysSinceLastOrder',
            headerName: 'Days Since Last Order',
            sortable: true,
            filter: true,
            width: 160,
            cellStyle: params => {
                if (!params.data.avgDaysBetweenOrders) return null;
                if (params.data.isOverdue) return { backgroundColor: '#ffcccc', color: '#cc0000' };
                if (params.value >= params.data.avgDaysBetweenOrders * 0.8) return { backgroundColor: '#fff4cc', color: '#cc8800' };
                return null;
            }
        },
        {
            field: 'lastOrderDate',
            headerName: 'Last Order',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        }
    ];

    // Client Activity columns
    const clientActivityColumns = [
        { field: 'clientName', headerName: 'Client', sortable: true, filter: true, flex: 2 },
        { field: 'company', headerName: 'Company', sortable: true, filter: true, flex: 2 },
        { field: 'state', headerName: 'State', sortable: true, filter: true, width: 100 },
        {
            field: 'daysSinceLastOrder',
            headerName: 'Days Since Last Order',
            sortable: true,
            filter: true,
            width: 160
        },
        {
            field: 'avgDaysBetweenOrders',
            headerName: 'Avg Days Between',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: params => params.value ? `${params.value} days` : 'N/A'
        },
        {
            field: 'daysOverdue',
            headerName: 'Days Overdue',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: params => params.value > 0 ? params.value : '-'
        },
        {
            field: 'totalSales',
            headerName: 'Total Sales',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: params => `$${params.value.toFixed(2)}`
        },
        { field: 'orderCount', headerName: 'Orders', sortable: true, filter: true, width: 90 }
    ];

    // Cigar statistics columns
    const cigarStatsColumns = [
        { field: 'brandAndName', headerName: 'Brand', sortable: true, filter: true, flex: 2 },
        { field: 'blend', headerName: 'Blend', sortable: true, filter: true, flex: 1 },
        { field: 'sizeName', headerName: 'Size', sortable: true, filter: true, width: 120 },
        { field: 'size', headerName: 'Ring/Length', sortable: true, filter: true, width: 120 },
        {
            field: 'isCoreline',
            headerName: 'Coreline',
            sortable: true,
            filter: true,
            width: 100,
            valueFormatter: params => params.value ? 'Yes' : 'No'
        },
        { field: 'boxesSold', headerName: 'Boxes Sold', sortable: true, filter: true, width: 120 },
        {
            field: 'totalRevenue',
            headerName: 'Total Revenue',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: params => `$${params.value.toFixed(2)}`
        },
        {
            field: 'avgPricePerBox',
            headerName: 'Avg Price/Box',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: params => params.value ? `$${params.value.toFixed(2)}` : 'N/A'
        }
    ];

    // Top accounts by territory
    const topAccountsColumns = [
        { field: 'clientName', headerName: 'Client', sortable: true, filter: true, flex: 2 },
        { field: 'company', headerName: 'Company', sortable: true, filter: true, flex: 2 },
        { field: 'city', headerName: 'City', sortable: true, filter: true, flex: 1 },
        { field: 'orderCount', headerName: 'Orders', sortable: true, filter: true, width: 100 },
        {
            field: 'totalSales',
            headerName: 'Total Sales',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: params => `$${params.value.toFixed(2)}`
        }
    ];

    const topAccountsByTerritory = selectedTerritory === 'all'
        ? Object.entries(statsData.topAccountsByTerritory).flatMap(([state, accounts]) =>
            accounts.slice(0, 5).map(acc => ({ ...acc, state }))
          )
        : (statsData.topAccountsByTerritory[selectedTerritory] || []).slice(0, 10);

    return (
        <div className="stats-container">
            <h1>Sales Statistics</h1>

            {/* Filters */}
            <div className="stats-filters">
                {isAdmin && (
                    <div className="filter-group">
                        <label>Salesman:</label>
                        <select
                            value={selectedSalesman}
                            onChange={(e) => setSelectedSalesman(e.target.value)}
                        >
                            <option value="">All Salesmen</option>
                            {salesmen.map(salesman => (
                                <option key={salesman._id} value={salesman._id}>
                                    {salesman.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="filter-group">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Territory:</label>
                    <select
                        value={selectedTerritory}
                        onChange={(e) => setSelectedTerritory(e.target.value)}
                    >
                        {territories.map(territory => (
                            <option key={territory} value={territory}>
                                {territory === 'all' ? 'All Territories' : territory}
                            </option>
                        ))}
                    </select>
                </div>

                <button onClick={fetchStats} className="refresh-button">Refresh</button>
            </div>

            {/* Monthly Sales Trend */}
            <div className="stats-section">
                <h2>Monthly Sales Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlySalesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" name="Sales ($)" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                        <Line yAxisId="right" type="monotone" dataKey="boxes" stroke="#ffc658" name="Boxes" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Sales by Category */}
            <div className="stats-section charts-row">
                <div className="chart-container">
                    <h2>Sales by Category</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={entry => `${entry.name}: $${entry.value.toFixed(0)}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h2>Sales by Blend Type</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={blendData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={entry => `${entry.name}: $${entry.value.toFixed(0)}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {blendData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Cigars Sold */}
            <div className="stats-section">
                <h2>Top 15 Cigars by Boxes Sold</h2>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={(statsData.cigarStats || []).slice(0, 15).map(cigar => ({
                            ...cigar,
                            fullName: `${cigar.brandAndName}${cigar.blend ? ' ' + cigar.blend : ''}${cigar.sizeName ? ' ' + cigar.sizeName : ''}`
                        }))}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="fullName"
                            angle={-45}
                            textAnchor="end"
                            height={200}
                            interval={0}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{data.brandAndName}</p>
                                            {data.blend && <p style={{ margin: '0 0 5px 0' }}>Blend: {data.blend}</p>}
                                            {data.sizeName && <p style={{ margin: '0 0 5px 0' }}>Size: {data.sizeName} ({data.size})</p>}
                                            <p style={{ margin: '0 0 5px 0' }}>Boxes Sold: {data.boxesSold}</p>
                                            <p style={{ margin: '0' }}>Revenue: ${data.totalRevenue.toFixed(2)}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar dataKey="boxesSold" fill="#8884d8" name="Boxes Sold" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Order Frequency Per Account */}
            <div className="stats-section">
                <h2>Order Frequency Per Account</h2>
                <div className="color-legend" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <strong>Color Guide:</strong>
                    <span style={{ marginLeft: '15px' }}>
                        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#ffcccc', marginLeft: '10px', marginRight: '5px', verticalAlign: 'middle', border: '1px solid #ccc' }}></span>
                        <span style={{ color: '#cc0000' }}>Red cell</span> = Overdue (past their typical reorder time + 20% buffer)
                    </span>
                    <span style={{ marginLeft: '15px' }}>
                        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#fff4cc', marginLeft: '10px', marginRight: '5px', verticalAlign: 'middle', border: '1px solid #ccc' }}></span>
                        <span style={{ color: '#cc8800' }}>Yellow cell</span> = Due soon (within their typical reorder window)
                    </span>
                </div>
                <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
                    <AgGridReact
                        rowData={filteredAccounts}
                        columnDefs={orderFrequencyColumns}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true
                        }}
                        pagination={true}
                        paginationPageSize={20}
                    />
                </div>
            </div>

            {/* Top Accounts by Territory */}
            <div className="stats-section">
                <h2>Top Accounts {selectedTerritory !== 'all' ? `in ${selectedTerritory}` : 'by Territory'}</h2>
                <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
                    <AgGridReact
                        rowData={topAccountsByTerritory}
                        columnDefs={topAccountsColumns}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true
                        }}
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div>
            </div>

            {/* Cigar Statistics */}
            <div className="stats-section">
                <h2>Cigar Sales Statistics</h2>
                <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
                    <AgGridReact
                        rowData={statsData.cigarStats || []}
                        columnDefs={cigarStatsColumns}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true
                        }}
                        pagination={true}
                        paginationPageSize={20}
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-section summary-stats">
                <h2>Summary</h2>
                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>Total Sales</h3>
                        <p className="stat-value">
                            ${monthlySalesData.reduce((sum, item) => sum + item.sales, 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h3>Total Orders</h3>
                        <p className="stat-value">
                            {monthlySalesData.reduce((sum, item) => sum + item.orders, 0)}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h3>Total Boxes</h3>
                        <p className="stat-value">
                            {monthlySalesData.reduce((sum, item) => sum + item.boxes, 0)}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h3>Unique Clients</h3>
                        <p className="stat-value">
                            {statsData.orderFrequency.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;

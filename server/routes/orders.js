/*import express from "express";
import { OrderModel } from '../models/Orders.js'*/
const sendEmail = require("../middleware/emailHandler");
const express =  require("express");
const OrderModel =  require('../models/Orders.js');
const verifyJWT = require('../middleware/verifyJWT');
const path = require('path');

const router = express.Router();


const fs = require('fs');
const fileName = './config/tax.json';
const file = require('../config/tax.json');

const sanitizeFilename = (filename) => {
    // Define characters that are problematic for filenames
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    
    // Replace problematic characters with a safe alternative
    // You can customize the replacement character as needed
    const sanitized = filename
      .replace(invalidChars, '-')
      // Replace multiple consecutive dashes with a single dash
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Trim whitespace
      .trim();
      
    // Ensure the filename isn't empty after sanitization
    return sanitized || 'unnamed';
};

router.get("/orderbyid/:id", async (req, res) => {
    // Get order by id from MongoDB
    console.log("order by id")
    const id = req.params.id
    console.log(id)
    const order = await OrderModel.findById(id).lean()

    if (!order) {
        return res.status(400).json({ message: 'Order not found' })
    }
    // Because this route is unprotected, only return an order 
    // submitted in the last 10 minutes, for security purposes
    const now = Date.now()
    const diff = now - order.date
    const minutes = Math.floor((diff/1000)/60);
    if (minutes < 10) {
        res.status(200).json(order)
    } else {
        res.status(400).json({ message: 'Order submitted more than 10 minutes ago' })
    }
})

router.use(verifyJWT)

router.get("/catax", async (req, res) => {
    res.json(file.tax)
})

router.post("/catax", async (req, res) => {
    file.tax = req.body.tax;
    fs.writeFileSync(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) res.status(404).json(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
        res.json({success: "Success!"}) 
    });
    res.json({success: "Success!"}) 
})

router.get("/emails", async (req, res) => {
    res.json(file.emails)
})

router.post("/emails", async (req, res) => {
    file.emails = req.body.emails;
    fs.writeFileSync(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) res.status(404).json(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
        res.json({success: "Success!"}) 
    });
    res.json({success: "Success!"}) 
})

router.get("/ordersminuscigars", async (req, res) => {
    // Get all users from MongoDB
    const orders = await OrderModel.find().select('-cigars.cigars').lean()

    // If no users 
    if (!orders?.length) {
        return res.status(400).json({ message: 'No orders found' })
    }

    res.json(orders)
})

router.post("/getordersbyclientid", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "client._id": id })
    .exec()
    .then(orders => res.json(orders.sort((a,b) => {
        if (a.date < b.date)
            return -1;
        if (a.date > b.date)
            return 1;
        return 0;
    }).reverse()))
    .catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
});

router.post("/getordersbysalesid", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "salesman._id": id })
    .exec()
    .then(orders => res.json(orders.sort((a,b) => {
        if (a.date < b.date)
            return -1;
        if (a.date > b.date)
            return 1;
        return 0;
    }).reverse()))
    .catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
});

router.post("/salesmantotal", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "salesman._id": id })
    .exec()
    .then(orders => res.json(orders.map(i=>i.cigars.total).reduce((a,b)=>a+b)))
    //.catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
    .catch(err => res.json(0))
});

router.post("/stats", async (req, res) => {
    try {
        const { salesmanId, startDate, endDate } = req.body;

        // Build query filter
        let query = {};
        if (salesmanId) {
            query["salesman._id"] = salesmanId;
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const orders = await OrderModel.find(query).lean();

        if (!orders?.length) {
            return res.json({
                orderFrequency: [],
                topAccountsByTerritory: {},
                salesByCategory: {
                    coreline: 0,
                    nonCoreline: 0,
                    flavored: 0,
                    maduro: 0,
                    natural: 0,
                    other: 0
                },
                monthlySales: [],
                cigarStats: [],
                clientActivity: {
                    overdue: [],
                    needsFollowUp: [],
                    inactive: [],
                    active: []
                }
            });
        }

        // 1. Order frequency per account
        const orderFrequency = {};
        orders.forEach(order => {
            const clientId = order.client._id;
            const clientName = order.client.company || order.client.name;
            if (!orderFrequency[clientId]) {
                orderFrequency[clientId] = {
                    clientId,
                    clientName,
                    company: order.client.company,
                    city: order.client.city,
                    state: order.client.state,
                    orderCount: 0,
                    totalSales: 0,
                    lastOrderDate: order.date,
                    firstOrderDate: order.date,
                    orderDates: []
                };
            }
            orderFrequency[clientId].orderCount++;
            orderFrequency[clientId].totalSales += order.cigars.total || 0;
            orderFrequency[clientId].orderDates.push(order.date);

            // Track first and last order dates
            if (new Date(order.date) > new Date(orderFrequency[clientId].lastOrderDate)) {
                orderFrequency[clientId].lastOrderDate = order.date;
            }
            if (new Date(order.date) < new Date(orderFrequency[clientId].firstOrderDate)) {
                orderFrequency[clientId].firstOrderDate = order.date;
            }
        });

        // Calculate average days between orders and days since last order for each account
        const now = new Date();
        Object.keys(orderFrequency).forEach(clientId => {
            const account = orderFrequency[clientId];

            // Calculate days since last order
            account.daysSinceLastOrder = Math.floor((now - new Date(account.lastOrderDate)) / (1000 * 60 * 60 * 24));

            if (account.orderCount > 1) {
                const sortedDates = account.orderDates.sort((a, b) => new Date(a) - new Date(b));
                const daysBetween = [];
                for (let i = 1; i < sortedDates.length; i++) {
                    const diff = (new Date(sortedDates[i]) - new Date(sortedDates[i - 1])) / (1000 * 60 * 60 * 24);
                    daysBetween.push(diff);
                }
                account.avgDaysBetweenOrders = Math.round(daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length);

                // Calculate if client is overdue (days since last order exceeds their average + 20% buffer)
                const expectedNextOrder = account.avgDaysBetweenOrders * 1.2;
                account.isOverdue = account.daysSinceLastOrder > expectedNextOrder;
                account.daysOverdue = account.isOverdue ? Math.round(account.daysSinceLastOrder - account.avgDaysBetweenOrders) : 0;
            } else {
                account.avgDaysBetweenOrders = null;
                account.isOverdue = false;
                account.daysOverdue = 0;
            }

            delete account.orderDates; // Remove raw dates from response
        });

        // 2. Top accounts by territory (state)
        const accountsByTerritory = {};
        Object.values(orderFrequency).forEach(account => {
            const territory = account.state || 'Unknown';
            if (!accountsByTerritory[territory]) {
                accountsByTerritory[territory] = [];
            }
            accountsByTerritory[territory].push(account);
        });

        // Sort each territory by total sales
        Object.keys(accountsByTerritory).forEach(territory => {
            accountsByTerritory[territory].sort((a, b) => b.totalSales - a.totalSales);
        });

        // 3. Sales breakdown by category
        const salesByCategory = {
            coreline: 0,
            nonCoreline: 0,
            flavored: 0,
            maduro: 0,
            natural: 0,
            other: 0
        };

        // 3b. Cigar statistics
        const cigarStats = {};

        orders.forEach(order => {
            if (order.cigarData && Array.isArray(order.cigarData)) {
                order.cigarData.forEach(cigar => {
                    const price = (cigar.priceBox || 0) * (cigar.qty || 0);

                    // Coreline vs non-coreline
                    if (cigar.coreline) {
                        salesByCategory.coreline += price;
                    } else {
                        salesByCategory.nonCoreline += price;
                    }

                    // Blend classification
                    const blend = (cigar.blend || '').toLowerCase();
                    if (blend.includes('maduro')) {
                        salesByCategory.maduro += price;
                    } else if (blend.includes('natural') || blend.includes('connecticut')) {
                        salesByCategory.natural += price;
                    } else if (blend) {
                        salesByCategory.flavored += price;
                    } else {
                        salesByCategory.other += price;
                    }

                    // Individual cigar statistics
                    const cigarKey = `${cigar.brandAndName}${cigar.blend ? ' ' + cigar.blend : ''}${cigar.sizeName ? ' ' + cigar.sizeName : ''}`;

                    if (!cigarStats[cigarKey]) {
                        cigarStats[cigarKey] = {
                            brandAndName: cigar.brandAndName,
                            blend: cigar.blend || '',
                            sizeName: cigar.sizeName || '',
                            size: cigar.size || '',
                            boxesSold: 0,
                            totalRevenue: 0,
                            avgPricePerBox: 0,
                            isCoreline: cigar.coreline || false,
                            priceSum: 0,
                            priceCount: 0
                        };
                    }

                    cigarStats[cigarKey].boxesSold += cigar.qty || 0;
                    cigarStats[cigarKey].totalRevenue += price;

                    // Track average price (in case prices change over time)
                    if (cigar.priceBox) {
                        cigarStats[cigarKey].priceSum += cigar.priceBox;
                        cigarStats[cigarKey].priceCount++;
                        cigarStats[cigarKey].avgPricePerBox = cigarStats[cigarKey].priceSum / cigarStats[cigarKey].priceCount;
                    }
                });
            }
        });

        // 4. Monthly sales breakdown
        const monthlySales = {};
        orders.forEach(order => {
            const date = new Date(order.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlySales[monthKey]) {
                monthlySales[monthKey] = {
                    month: monthKey,
                    year: date.getFullYear(),
                    monthNum: date.getMonth() + 1,
                    totalSales: 0,
                    orderCount: 0,
                    boxCount: 0
                };
            }

            monthlySales[monthKey].totalSales += order.cigars.total || 0;
            monthlySales[monthKey].orderCount++;

            // Count boxes
            if (order.cigarData && Array.isArray(order.cigarData)) {
                order.cigarData.forEach(cigar => {
                    monthlySales[monthKey].boxCount += cigar.qty || 0;
                });
            }
        });

        // Sort monthly sales by date
        const sortedMonthlySales = Object.values(monthlySales).sort((a, b) => {
            return a.month.localeCompare(b.month);
        });

        // Sort cigar stats by boxes sold and clean up temp fields
        const sortedCigarStats = Object.values(cigarStats).map(cigar => {
            // Remove temporary calculation fields
            const { priceSum, priceCount, ...cleanCigar } = cigar;
            return cleanCigar;
        }).sort((a, b) => b.boxesSold - a.boxesSold);

        // 5. Client Activity Insights
        const clientActivity = {
            overdue: [],
            needsFollowUp: [],
            inactive: [],
            active: []
        };

        Object.values(orderFrequency).forEach(account => {
            // Overdue clients (past their expected reorder time)
            if (account.isOverdue) {
                clientActivity.overdue.push(account);
            }
            // Needs follow-up (within 7 days of expected reorder)
            else if (account.avgDaysBetweenOrders &&
                     account.daysSinceLastOrder >= (account.avgDaysBetweenOrders * 0.8) &&
                     account.daysSinceLastOrder < (account.avgDaysBetweenOrders * 1.2)) {
                clientActivity.needsFollowUp.push(account);
            }
            // Inactive (no order in 90+ days and only 1-2 orders ever)
            else if (account.daysSinceLastOrder > 90 && account.orderCount <= 2) {
                clientActivity.inactive.push(account);
            }
            // Active (ordered recently)
            else if (account.daysSinceLastOrder < 60) {
                clientActivity.active.push(account);
            }
        });

        // Sort each category
        clientActivity.overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
        clientActivity.needsFollowUp.sort((a, b) => b.totalSales - a.totalSales);
        clientActivity.inactive.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);
        clientActivity.active.sort((a, b) => a.daysSinceLastOrder - b.daysSinceLastOrder);

        res.json({
            orderFrequency: Object.values(orderFrequency).sort((a, b) => b.orderCount - a.orderCount),
            topAccountsByTerritory: accountsByTerritory,
            salesByCategory,
            monthlySales: sortedMonthlySales,
            cigarStats: sortedCigarStats,
            clientActivity
        });

    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Error generating stats' });
    }
});

router.post("/add", async (req, res) => {
    // if the order is submitted after 4pm, the date may be the next day
    let event = new Date()
    let time = event.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).replaceAll(":",".").replaceAll("/","-")
    const sanitizedClient = sanitizeFilename(req.body.client.company?.length ? req.body.client.company : req.body.client.name)
    let filename = `Order ${time} ${req.body.salesman.name} ${sanitizedClient}.pdf`
    console.log("filename: " + filename)
    //sendEmail(req.body, time)
    
    const newOrder = new OrderModel(  
        {
            client: req.body.client,
            salesman: req.body.salesman,
            cigars: req.body.cigars,
            cigarData: req.body.cigarData,
            filename: filename,
            date: req.body.date,
            notes: req.body.notes
        })
    const order = await newOrder.save();

    if (order) {
        res.json({ success: "Order Added Successfully!"})
        sendEmail(req.body, time, order._id, filename)
    } else {
        res.status(400).json({ error: 'Invalid order data received' })
    }
    
});

router.get('/pdfs/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('./orders/', filename);
  
    fs.access(filePath, fs.constants.R_OK, err => {
      if (err) {
        return res.status(404).json({ error: 'PDF not found.' });
      }
  
      // Stream the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  });


//export { router as orderRouter };
module.exports = router
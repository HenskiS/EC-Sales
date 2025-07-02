const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp'); // You'll need to install this: npm install sharp
const nodemailer = require('nodemailer');

// Apply JWT verification to all routes
// router.use(verifyJWT);

// Use your existing email configuration
const emailConfig = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "estebancarrerassales@gmail.com",
        pass: process.env.EMAIL_PASS
    }
};

const transporter = nodemailer.createTransport(emailConfig);

// Photos directory path - adjust as needed
const PHOTOS_DIR = path.join(__dirname, '../photos');
const THUMBNAILS_DIR = path.join(__dirname, '../thumbnails');

// Ensure directories exist
const ensureDirectories = async () => {
    try {
        await fs.mkdir(PHOTOS_DIR, { recursive: true });
        await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating directories:', error);
    }
};

// Initialize directories
ensureDirectories();

// GET /api/photos - Get all photos with metadata
router.get('/', async (req, res) => {
    try {
        const files = await fs.readdir(PHOTOS_DIR);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file)
        );

        const photos = await Promise.all(
            imageFiles.map(async (file) => {
                const filePath = path.join(PHOTOS_DIR, file);
                const stats = await fs.stat(filePath);
                
                return {
                    _id: Buffer.from(file).toString('base64'), // Simple ID generation
                    name: file,
                    size: stats.size,
                    mimetype: `image/${path.extname(file).slice(1).toLowerCase()}`,
                    filename: file,
                    createdAt: stats.birthtime
                };
            })
        );

        // Sort by name
        photos.sort((a, b) => a.name.localeCompare(b.name));
        
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ message: 'Error fetching photos' });
    }
});

// GET /api/photos/:id/thumbnail - Get thumbnail for a photo
router.get('/:id/thumbnail', async (req, res) => {
    try {
        const filename = Buffer.from(req.params.id, 'base64').toString();
        const originalPath = path.join(PHOTOS_DIR, filename);
        const thumbnailPath = path.join(THUMBNAILS_DIR, `thumb_${filename}`);

        // Check if thumbnail exists, if not create it
        try {
            await fs.access(thumbnailPath);
        } catch {
            // Thumbnail doesn't exist, create it
            await sharp(originalPath)
                .resize(200, 200, { 
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
        }

        // Send the thumbnail
        res.sendFile(thumbnailPath);
    } catch (error) {
        console.error('Error generating/serving thumbnail:', error);
        res.status(500).json({ message: 'Error serving thumbnail' });
    }
});

// GET /api/photos/:id - Get full photo
router.get('/:id', async (req, res) => {
    try {
        const filename = Buffer.from(req.params.id, 'base64').toString();
        const filePath = path.join(PHOTOS_DIR, filename);
        
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving photo:', error);
        res.status(500).json({ message: 'Error serving photo' });
    }
});

// POST /api/photos/send - Send photos via email
router.post('/send', async (req, res) => {
    try {
        const { photoIds, recipientEmail, customMessage, clientName } = req.body;
        
        if (!photoIds || photoIds.length === 0) {
            return res.status(400).json({ message: 'No photos selected' });
        }
        
        if (!recipientEmail) {
            return res.status(400).json({ message: 'Recipient email is required' });
        }

        // Get user info from JWT (req.user is just the username string)
        const username = req.user;
        
        // Prepare attachments
        const attachments = [];
        let totalSize = 0;
        
        for (const photoId of photoIds) {
            try {
                const filename = Buffer.from(photoId, 'base64').toString();
                const filePath = path.join(PHOTOS_DIR, filename);
                
                // Check file exists and get size
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
                
                // Check total size limit (10MB)
                if (totalSize > 10 * 1024 * 1024) {
                    return res.status(400).json({ message: 'Total file size exceeds 10MB limit' });
                }
                
                attachments.push({
                    filename: filename,
                    path: filePath
                });
            } catch (fileError) {
                console.error(`Error processing photo ${photoId}:`, fileError);
                return res.status(400).json({ message: `Photo not found: ${photoId}` });
            }
        }

        // Prepare email content
        const emailBody = `DO NOT REPLY - This is an automated email.

${customMessage ? customMessage + '\n\n' : ''}Please find attached photos of our premium cigars.

Best regards,
Esteban Carreras`;

        // Send email using your existing structure
        const mailOptions = {
            from: `Esteban Carreras <estebancarrerassales@gmail.com>`,
            to: recipientEmail,
            subject: 'Esteban Carreras Photos',
            text: emailBody,
            attachments: attachments
        };

        // Use promise-based sending like your existing code structure
        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Email error:', err);
                    reject(err);
                } else {
                    console.log(`Photos sent to ${recipientEmail} by ${username}`);
                    resolve(info.response);
                }
            });
        });
        
        res.json({ 
            message: 'Photos sent successfully',
            recipientEmail,
            photoCount: photoIds.length,
            totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)}MB`
        });
        
    } catch (error) {
        console.error('Error sending photos:', error);
        res.status(500).json({ message: 'Error sending photos' });
    }
});

module.exports = router;
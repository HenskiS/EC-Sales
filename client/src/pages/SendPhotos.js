import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { config } from "../api/axios.js";
import Select from 'react-select';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import '../assets/SendPhotos.css';

const SendPhotos = () => {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [customEmail, setCustomEmail] = useState('');
    const [useCustomEmail, setUseCustomEmail] = useState(true);
    const [message, setMessage] = useState('');
    const [totalSize, setTotalSize] = useState(0);
    const [isIntlClient, setIsIntlClient] = useState(false);
    const [clientsLoading, setClientsLoading] = useState(true);

    const tokenString = sessionStorage.getItem('UserInfo');
    let user = (tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    let isIntlUser = false;
    if (user) {
        isIntlUser = (user.roles.includes("International"));
    }

    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Fetch photos from server
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('/api/photos', config());
                setPhotos(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching photos:', error);
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    // Fetch clients
    useEffect(() => {
        const getClients = async () => {
            try {
                let endpoint = "/api/clients/clientnames";
                if (isIntlClient) endpoint += "/intl";
                const response = await axios.get(endpoint, config());
                
                let sortedClients = response.data.sort((a, b) => {
                    if ((a.company?.toLowerCase() + a.name?.toLowerCase()) < (b.company?.toLowerCase() + b.name?.toLowerCase())) return -1;
                    if ((a.company?.toLowerCase() + a.name?.toLowerCase()) > (b.company?.toLowerCase() + b.name?.toLowerCase())) return 1;
                    return 0;
                }).filter(n => (" " + n.company?.toLowerCase() + n.name?.toLowerCase()).length > 1 && (n.hasOwnProperty("company") || (n.hasOwnProperty("name") && n.name !== " ")));
                
                const reformattedClients = sortedClients.map((data) => {
                    return {
                        label: data.company ? data.company : data.name,
                        value: data._id,
                        email: data.email || null
                    };
                });
                
                setClients(reformattedClients);
                setClientsLoading(false);
            } catch (err) {
                console.error(err);
                setClientsLoading(false);
            }
        };
        getClients();
    }, [isIntlClient]);

    // Calculate total size when photos are selected/deselected
    useEffect(() => {
        const size = selectedPhotos.reduce((total, photoId) => {
            const photo = photos.find(p => p._id === photoId);
            return total + (photo ? photo.size : 0);
        }, 0);
        setTotalSize(size);
    }, [selectedPhotos, photos]);

    const handlePhotoToggle = (photoId) => {
        const photo = photos.find(p => p._id === photoId);
        const newSelectedPhotos = selectedPhotos.includes(photoId)
            ? selectedPhotos.filter(id => id !== photoId)
            : [...selectedPhotos, photoId];
        
        // Check if adding this photo would exceed size limit
        const newTotalSize = newSelectedPhotos.reduce((total, id) => {
            const p = photos.find(p => p._id === id);
            return total + (p ? p.size : 0);
        }, 0);
        
        if (newTotalSize <= MAX_SIZE_BYTES) {
            setSelectedPhotos(newSelectedPhotos);
        } else {
            alert(`Adding this photo would exceed the ${MAX_SIZE_MB}MB limit. Please remove some photos first.`);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSendPhotos = async () => {
        if (selectedPhotos.length === 0) {
            alert('Please select at least one photo to send.');
            return;
        }

        let recipientEmail = '';
        if (useCustomEmail) {
            if (!customEmail || !customEmail.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }
            recipientEmail = customEmail;
        } else {
            if (!selectedClient) {
                alert('Please select a client or enter a custom email.');
                return;
            }
            // Find the client's email
            const client = clients.find(c => c.value === selectedClient.value);
            if (!client || !client.email) {
                alert('Selected client does not have an email address. Please use custom email option.');
                return;
            }
            recipientEmail = client.email;
        }

        setSending(true);
        try {
            const response = await axios.post('/api/send-photos', {
                photoIds: selectedPhotos,
                recipientEmail,
                customMessage: message,
                clientName: useCustomEmail ? 'Valued Customer' : selectedClient.label
            }, config());

            alert('Photos sent successfully!');
            setSelectedPhotos([]);
            setMessage('');
            setSelectedClient(null);
            setCustomEmail('');
        } catch (error) {
            console.error('Error sending photos:', error);
            alert('Failed to send photos. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="send-photos-container">Loading photos...</div>;
    }

    return (
        <div className="send-photos-container">
            <h2>Send Photos to Client</h2>
            
            {/* Client Selection */}
            <div className="client-selection">
                <h3>Select Recipient</h3>
                <div className="email-toggle">
                    <label>
                        <input
                            type="radio"
                            checked={!useCustomEmail}
                            onChange={() => setUseCustomEmail(false)}
                        />
                        Select from Client List
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={useCustomEmail}
                            onChange={() => setUseCustomEmail(true)}
                        />
                        Enter Custom Email
                    </label>
                </div>

                {!useCustomEmail ? (
                    <>
                        {isIntlUser && (
                            <div className="intl">
                                <div className='intl-client-toggle'>
                                    <p>Domestic</p>
                                    <Toggle 
                                        checked={isIntlClient} 
                                        icons={{
                                            checked: null,
                                            unchecked: null,
                                        }} 
                                        onChange={(e) => setIsIntlClient(e.target.checked)}
                                    />
                                    <p>International</p>
                                </div>
                            </div>
                        )}
                        <Select
                            options={clients}
                            placeholder="Select a client..."
                            value={selectedClient}
                            onChange={setSelectedClient}
                            isDisabled={clientsLoading}
                        />
                        {selectedClient && !clients.find(c => c.value === selectedClient.value)?.email && (
                            <p className="no-email-warning">
                                This client does not have an email address on file. Please use the custom email option.
                            </p>
                        )}
                        {selectedClient && clients.find(c => c.value === selectedClient.value)?.email && (
                            <p className="client-email-info">
                                Email: {clients.find(c => c.value === selectedClient.value)?.email}
                            </p>
                        )}
                    </>
                ) : (
                    <input
                        type="email"
                        placeholder="Enter email address"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="custom-email-input"
                    />
                )}
            </div>

            {/* Message Input */}
            <div className="message-section">
                <h3>Custom Message (Optional)</h3>
                <p className="message-note">
                    Email will start with: "DO NOT REPLY - This is an automated email."
                </p>
                <textarea
                    placeholder="Add your custom message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="message-textarea"
                />
            </div>

            {/* Photo Selection */}
            <div className="photo-selection">
                <div className="photo-header">
                    <h3>Select Photos</h3>
                    <div className="size-info">
                        <span className={totalSize > MAX_SIZE_BYTES * 0.8 ? 'size-warning' : ''}>
                            {formatFileSize(totalSize)} / {MAX_SIZE_MB}MB
                        </span>
                        <span className="selected-count">
                            ({selectedPhotos.length} selected)
                        </span>
                    </div>
                </div>

                <div className="photos-grid">
                    {photos.map((photo) => (
                        <div key={photo._id} className="photo-item">
                            <div className="photo-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedPhotos.includes(photo._id)}
                                    onChange={() => handlePhotoToggle(photo._id)}
                                />
                            </div>
                            <img
                                src={`/api/photos/${photo._id}/thumbnail`}
                                alt={photo.name}
                                className="photo-thumbnail"
                            />
                            <div className="photo-info">
                                <p className="photo-name">{photo.name}</p>
                                <p className="photo-size">{formatFileSize(photo.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Send Button */}
            <div className="send-section">
                <button
                    onClick={handleSendPhotos}
                    disabled={sending || selectedPhotos.length === 0}
                    className="send-button"
                >
                    {sending ? 'Sending...' : `Send ${selectedPhotos.length} Photo${selectedPhotos.length === 1 ? '' : 's'}`}
                </button>
            </div>
        </div>
    );
};

export default SendPhotos;
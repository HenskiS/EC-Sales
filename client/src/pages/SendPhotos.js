import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { config } from "../api/axios.js";
import Select from 'react-select';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import '../assets/SendPhotos.css';

const SendPhotos = () => {
    // State management
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [customEmail, setCustomEmail] = useState('');
    const [useCustomEmail, setUseCustomEmail] = useState(true);
    const [message, setMessage] = useState('');
    const [isIntlClient, setIsIntlClient] = useState(false);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [expandedPhoto, setExpandedPhoto] = useState(null);

    // Constants
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // User info
    const user = getUserInfo();
    const isIntlUser = user?.roles?.includes("International") || false;

    // Helper functions
    function getUserInfo() {
        const tokenString = sessionStorage.getItem('UserInfo');
        return (tokenString && tokenString !== 'undefined') ? JSON.parse(tokenString) : null;
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const calculateTotalSize = (photoIds) => {
        return photoIds.reduce((total, photoId) => {
            const photo = photos.find(p => p._id === photoId);
            return total + (photo?.size || 0);
        }, 0);
    };

    // Event handlers
    const handlePhotoToggle = (photoId) => {
        const newSelectedPhotos = selectedPhotos.includes(photoId)
            ? selectedPhotos.filter(id => id !== photoId)
            : [...selectedPhotos, photoId];
        
        const newTotalSize = calculateTotalSize(newSelectedPhotos);
        
        if (newTotalSize <= MAX_SIZE_BYTES) {
            setSelectedPhotos(newSelectedPhotos);
        } else {
            alert(`Adding this photo would exceed the ${MAX_SIZE_MB}MB limit. Please remove some photos first.`);
        }
    };

    const handlePhotoClick = (photoId, e) => {
        e.stopPropagation();
        setExpandedPhoto(photoId);
    };

    const handleCardClick = (photoId) => {
        handlePhotoToggle(photoId);
    };

    const closeExpandedPhoto = () => {
        setExpandedPhoto(null);
    };

    const handleSendPhotos = async () => {
        // Validation
        if (selectedPhotos.length === 0) {
            alert('Please select at least one photo to send.');
            return;
        }

        let recipientEmail = '';
        let clientName = 'Valued Customer';

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
            const client = clients.find(c => c.value === selectedClient.value);
            if (!client?.email) {
                alert('Selected client does not have an email address. Please use custom email option.');
                return;
            }
            recipientEmail = client.email;
            clientName = selectedClient.label;
        }

        setSending(true);
        try {
            await axios.post('/api/photos/send', {
                photoIds: selectedPhotos,
                recipientEmail,
                customMessage: message,
                clientName
            }, config());

            alert('Photos sent successfully!');
            // Reset form
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

    // Data fetching
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get('/api/photos', config());
                setPhotos(response.data);
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const endpoint = isIntlClient ? "/api/clients/clientnames/intl" : "/api/clients/clientnames";
                const response = await axios.get(endpoint, config());
                
                const sortedClients = response.data
                    .filter(client => {
                        const displayName = (client.company || client.name || '').trim();
                        return displayName.length > 0;
                    })
                    .sort((a, b) => {
                        const nameA = (a.company || a.name || '').toLowerCase();
                        const nameB = (b.company || b.name || '').toLowerCase();
                        return nameA.localeCompare(nameB);
                    })
                    .map(client => ({
                        label: client.company || client.name,
                        value: client._id,
                        email: client.email || null
                    }));
                
                setClients(sortedClients);
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setClientsLoading(false);
            }
        };
        fetchClients();
    }, [isIntlClient]);

    // Render loading state
    if (loading) {
        return <div className="send-photos-container">Loading photos...</div>;
    }

    const totalSize = calculateTotalSize(selectedPhotos);
    const selectedClientEmail = selectedClient && clients.find(c => c.value === selectedClient.value)?.email;

    return (
        <div className="send-photos-container">
            <h2>Send Photos to Client</h2>
            
            {/* Recipient Selection */}
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
                                        icons={{ checked: null, unchecked: null }} 
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
                        {selectedClient && !selectedClientEmail && (
                            <p className="no-email-warning">
                                This client does not have an email address on file. Please use the custom email option.
                            </p>
                        )}
                        {selectedClient && selectedClientEmail && (
                            <p className="client-email-info">Email: {selectedClientEmail}</p>
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
                <div className="photo-header sticky">
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
                        <div 
                            key={photo._id} 
                            className="photo-item"
                            onClick={() => handleCardClick(photo._id)}
                        >
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
                                onClick={(e) => handlePhotoClick(photo._id, e)}
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

            {/* Expanded Photo Modal */}
            {expandedPhoto && (
                <div className="photo-modal" onClick={closeExpandedPhoto}>
                    <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="photo-modal-close" onClick={closeExpandedPhoto}>×</button>
                        <img
                            src={`/api/photos/${expandedPhoto}`}
                            alt="Expanded photo"
                            className="photo-modal-image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendPhotos;
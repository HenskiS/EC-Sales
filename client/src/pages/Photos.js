import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaDownload, FaEnvelope, FaList, FaTh, FaTimes } from 'react-icons/fa';
import axios, { config } from '../api/axios';
import '../assets/Catalog.css';

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CatalogEmailModal = ({ catalog, onClose }) => {
    const [recipientMode, setRecipientMode] = useState('custom');
    const [customEmail, setCustomEmail] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clients, setClients] = useState([]);
    const [customMessage, setCustomMessage] = useState('');
    const [loadingClients, setLoadingClients] = useState(true);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        let active = true;
        const loadClients = async () => {
            try {
                const results = await Promise.allSettled([
                    axios.get('/api/clients/clientnames', config()),
                    axios.get('/api/clients/clientnames/intl', config()),
                ]);
                const combined = results
                    .filter(result => result.status === 'fulfilled')
                    .flatMap(result => result.value.data)
                    .filter(client => client.email && (client.company || client.name));
                const unique = Array.from(new Map(combined.map(client => [client._id, client])).values())
                    .sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name));
                if (active) setClients(unique);
            } catch (error) {
                if (active) setStatus({ type: 'error', message: 'Client list could not be loaded. You can still enter an email.' });
            } finally {
                if (active) setLoadingClients(false);
            }
        };
        loadClients();
        return () => { active = false; };
    }, []);

    const selectedClient = clients.find(client => client._id === selectedClientId);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const recipientEmail = recipientMode === 'client' ? selectedClient?.email : customEmail.trim();
        const clientName = recipientMode === 'client' ? (selectedClient?.company || selectedClient?.name) : '';
        if (!recipientEmail) {
            setStatus({ type: 'error', message: 'Choose a client or enter an email address.' });
            return;
        }

        setSending(true);
        setStatus({ type: '', message: '' });
        try {
            const response = await axios.post('/api/catalog/email', {
                recipientEmail,
                clientName,
                customMessage,
            }, config());
            setStatus({ type: 'success', message: response.data.message });
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'The catalogue could not be sent. Please try again.',
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="catalog-modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="catalog-email-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-email-title" onMouseDown={event => event.stopPropagation()}>
                <button className="catalog-modal-close" type="button" onClick={onClose} aria-label="Close email form"><FaTimes /></button>
                <p className="catalog-eyebrow">Share the complete catalogue</p>
                <h2 id="catalog-email-title">Email PDF</h2>
                <p className="catalog-email-note">
                    The complete {catalog.pages.length}-page catalogue will be attached
                    {catalog.pdfSize ? ` (${formatFileSize(catalog.pdfSize)})` : ''}.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="catalog-recipient-tabs" role="group" aria-label="Recipient source">
                        <button type="button" className={recipientMode === 'custom' ? 'active' : ''} onClick={() => setRecipientMode('custom')}>Email address</button>
                        <button type="button" className={recipientMode === 'client' ? 'active' : ''} onClick={() => setRecipientMode('client')}>Client list</button>
                    </div>

                    {recipientMode === 'custom' ? (
                        <label className="catalog-field">
                            Recipient email
                            <input type="email" required autoFocus value={customEmail} onChange={event => setCustomEmail(event.target.value)} placeholder="customer@example.com" />
                        </label>
                    ) : (
                        <label className="catalog-field">
                            Client
                            <select required value={selectedClientId} onChange={event => setSelectedClientId(event.target.value)} disabled={loadingClients}>
                                <option value="">{loadingClients ? 'Loading clients...' : 'Choose a client'}</option>
                                {clients.map(client => (
                                    <option key={client._id} value={client._id}>{client.company || client.name} - {client.email}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className="catalog-field">
                        Message <span>optional</span>
                        <textarea rows="4" value={customMessage} onChange={event => setCustomMessage(event.target.value)} placeholder="Add a short note for the customer..." />
                    </label>

                    {status.message && <p className={`catalog-email-status ${status.type}`}>{status.message}</p>}
                    <button className="catalog-send-button" type="submit" disabled={sending || status.type === 'success'}>
                        <FaEnvelope /> {sending ? 'Sending catalogue...' : status.type === 'success' ? 'Catalogue sent' : 'Send catalogue'}
                    </button>
                </form>
            </section>
        </div>
    );
};

const Photos = () => {
    const [catalog, setCatalog] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [showContents, setShowContents] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const touchStartX = useRef(null);

    useEffect(() => {
        let active = true;
        axios.get('/api/catalog')
            .then(response => {
                if (!active) return;
                setCatalog(response.data);
                const savedPage = Number(sessionStorage.getItem('catalogPage'));
                if (savedPage > 0 && savedPage <= response.data.pages.length) setCurrentIndex(savedPage - 1);
            })
            .catch(() => active && setError('The catalogue could not be loaded.'))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    const pages = useMemo(() => catalog?.pages || [], [catalog]);
    const goToPage = useCallback((index) => {
        if (!pages.length) return;
        const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
        setCurrentIndex(nextIndex);
        sessionStorage.setItem('catalogPage', String(nextIndex + 1));
        setShowContents(false);
    }, [pages.length]);
    const previousPage = useCallback(() => goToPage(currentIndex - 1), [currentIndex, goToPage]);
    const nextPage = useCallback(() => goToPage(currentIndex + 1), [currentIndex, goToPage]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (showEmail || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
            if (event.key === 'ArrowLeft') previousPage();
            if (event.key === 'ArrowRight') nextPage();
            if (event.key === 'Escape') {
                setShowThumbnails(false);
                setShowContents(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextPage, previousPage, showEmail]);

    useEffect(() => {
        [pages[currentIndex - 1], pages[currentIndex + 1]].filter(Boolean).forEach(page => {
            const image = new Image();
            image.src = page.imageUrl;
        });
    }, [currentIndex, pages]);

    const sections = useMemo(() => pages.reduce((groups, page) => {
        const group = groups.find(item => item.name === page.section);
        if (group) group.pages.push(page);
        else groups.push({ name: page.section, pages: [page] });
        return groups;
    }, []), [pages]);

    const handleTouchStart = (event) => { touchStartX.current = event.touches[0].clientX; };
    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(distance) < 55) return;
        if (distance > 0) previousPage();
        else nextPage();
    };

    if (loading) return <div className="catalog-state">Loading catalogue...</div>;
    if (error || !pages.length) return <div className="catalog-state error">{error || 'No catalogue pages were found.'}</div>;
    const currentPage = pages[currentIndex];

    return (
        <div className="catalog-reader">
            <header className="catalog-toolbar">
                <div><p className="catalog-eyebrow">Esteban Carreras</p><h1>Product Catalogue</h1></div>
                <div className="catalog-toolbar-actions">
                    <button className="catalog-contents-toggle" type="button" onClick={() => setShowContents(value => !value)}><FaList /> Contents</button>
                    <button type="button" onClick={() => setShowThumbnails(value => !value)}><FaTh /> Thumbnails</button>
                    <a href={catalog.pdfUrl} download><FaDownload /> PDF</a>
                    <button className="catalog-email-button" type="button" onClick={() => setShowEmail(true)}><FaEnvelope /> Email PDF</button>
                </div>
            </header>

            <div className="catalog-layout">
                {showContents && <button className="catalog-sidebar-scrim" aria-label="Close contents" onClick={() => setShowContents(false)} />}
                <aside className={`catalog-sidebar ${showContents ? 'open' : ''}`} aria-label="Catalogue contents">
                    <div className="catalog-sidebar-heading"><span>Contents</span><button type="button" onClick={() => setShowContents(false)} aria-label="Close contents"><FaTimes /></button></div>
                    {sections.map(section => (
                        <section key={section.name}>
                            <h2>{section.name}</h2>
                            {section.pages.map(page => (
                                <button type="button" key={page.filename} className={page.number === currentPage.number ? 'active' : ''} onClick={() => goToPage(page.number - 1)}>
                                    <span>{String(page.number).padStart(2, '0')}</span>{page.title}
                                </button>
                            ))}
                        </section>
                    ))}
                </aside>

                <main className="catalog-viewer">
                    {showThumbnails && (
                        <section className="catalog-thumbnail-panel" aria-label="Catalogue thumbnails">
                            <div className="catalog-thumbnail-heading"><h2>All pages</h2><button type="button" onClick={() => setShowThumbnails(false)} aria-label="Close thumbnails"><FaTimes /></button></div>
                            <div className="catalog-thumbnail-grid">
                                {pages.map(page => (
                                    <button type="button" key={page.filename} className={page.number === currentPage.number ? 'active' : ''} onClick={() => { goToPage(page.number - 1); setShowThumbnails(false); }}>
                                        <img src={page.thumbnailUrl} alt="" loading="lazy" /><span>{page.number}. {page.title}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="catalog-page-area" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <button type="button" className="catalog-page-arrow previous" onClick={previousPage} disabled={currentIndex === 0} aria-label="Previous page"><FaChevronLeft /></button>
                        <figure className="catalog-page">
                            <img src={currentPage.imageUrl} alt={`Page ${currentPage.number}: ${currentPage.title}`} draggable="false" />
                            <figcaption><strong>{currentPage.title}</strong><span>Page {currentPage.number} of {pages.length}</span></figcaption>
                        </figure>
                        <button type="button" className="catalog-page-arrow next" onClick={nextPage} disabled={currentIndex === pages.length - 1} aria-label="Next page"><FaChevronRight /></button>
                    </div>
                </main>
            </div>

            {showEmail && <CatalogEmailModal catalog={catalog} onClose={() => setShowEmail(false)} />}
        </div>
    );
};

export default Photos;

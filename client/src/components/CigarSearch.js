import { useRef, useCallback } from 'react';

const CigarSearch = ({ handleSearch, searchTerm, setSearchTerm, handleTotalClick }) => {
  
    const inputRef = useRef(null);

    const handleClearSearch = () => {
        setSearchTerm('');
    };
    
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.blur(); // This will unfocus the input and dismiss the keyboard
          
          // Delay the search to allow time for the keyboard to dismiss and the layout to adjust
          setTimeout(() => {
            handleSearch(e);
            setSearchTerm('');
          }, 200); // Adjust this delay as needed
        }
    }, [handleSearch]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '15px',
      background: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid lightgray',
      borderRadius: '8px',
      zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <div style={{ position: 'relative', marginRight: '8px' }}>
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cigars..."
            style={{
              padding: '8px',
              paddingRight: '30px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '200px'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: '16px',
                lineHeight: 1,
                color: '#999'
              }}
            >
              &#x2715;
            </button>
          )}
        </div>
        <button 
          type="submit"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Find
        </button>
        <button 
          type="button"
          onClick={handleTotalClick}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Total
        </button>
      </form>
    </div>
  );
};

export default CigarSearch;
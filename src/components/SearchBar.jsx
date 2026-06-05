import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder = "Busca un tema, nicho o palabra clave...", onSearch, initialValue = '' }) {
    const [value, setValue] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(value.trim());
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                    id="main-search"
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <button type="submit" className="btn-search" id="btn-search-submit">
                <Search size={16} />
                Analizar
            </button>
        </form>
    );
}

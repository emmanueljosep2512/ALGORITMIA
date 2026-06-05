import { Search } from 'lucide-react';

export default function FiltersPanel({ filters, onChange, options }) {
    return (
        <div className="filters-panel" role="group" aria-label="Filtros de búsqueda">
            <div className="filter-group search-group" style={{ flex: 1 }}>
                <label className="filter-label">Buscar Palabra Clave</label>
                <div className="search-input-wrapper">
                    <Search size={14} className="search-icon" />
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Ej: faceless, finanzas..."
                        value={filters.searchQuery || ''}
                        onChange={(e) => onChange('searchQuery', e.target.value)}
                    />
                </div>
            </div>

            {options.map(({ key, label, items }) => (
                <div className="filter-group" key={key}>
                    <label className="filter-label" htmlFor={`filter-${key}`}>{label}</label>
                    <select
                        id={`filter-${key}`}
                        className="filter-select"
                        value={filters[key]}
                        onChange={(e) => onChange(key, e.target.value)}
                    >
                        {items.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
}

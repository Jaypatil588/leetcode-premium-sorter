import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './MultiSelect.module.css';

/**
 * MultiSelect renders a searchable multi-select dropdown for filtering.
 */
function MultiSelect({ options, selected, onChange, label, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(filterText.toLowerCase())
  );

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="dropdown" ref={containerRef}>
      <label
        className="form-label fw-bold"
        style={{ fontSize: '0.9rem', marginBottom: '0.15rem' }}
      >
        {label}
      </label>
      <div className="w-100">
        <button
          className="btn btn-outline-secondary w-100 text-start d-flex justify-content-between align-items-center"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-truncate">
            {selected.length === 0 ? placeholder : `${selected.length} selected`}
          </span>
          <span className="dropdown-toggle"></span>
        </button>

        {isOpen && (
          <div
            className="dropdown-menu show w-100 p-2 shadow"
            style={{ maxHeight: '300px', overflowY: 'auto', zIndex: 9999 }}
          >
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
            <div className="d-flex flex-column gap-1">
              <button
                className="btn btn-sm btn-link text-decoration-none text-start p-0 mb-1"
                onClick={() => onChange([])}
              >
                Clear selection
              </button>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt}
                    className="form-check"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(opt);
                    }}
                  >
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selected.includes(opt)}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                    <label
                      className="form-check-label w-100"
                      style={{ cursor: 'pointer' }}
                    >
                      {opt}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-muted small">No matches found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired
};

export default memo(MultiSelect);


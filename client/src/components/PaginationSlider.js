import React, { useState } from 'react';

const PaginationSlider = ({ items, rowsPerPage, renderPage }) => {
  // Divide items into pages
  const pages = [];
  for (let i = 0; i < items.length; i += rowsPerPage) {
    pages.push(items.slice(i, i + rowsPerPage));
  }
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div>
      <div className="am-table-responsive" style={{ overflow: 'hidden' }}>
        <div
          className="table-slider"
          style={{
            display: 'flex',
            width: `${pages.length * 100}%`,
            transform: `translateX(-${(currentPage * 100) / pages.length}%)`,
            transition: 'transform 0.5s ease'
          }}
        >
          {pages.map((pageData, pageIndex) => (
            <div
              key={pageIndex}
              className="table-page"
              style={{ width: `${100 / pages.length}%`, flexShrink: 0 }}
            >
              {renderPage(pageData)}
            </div>
          ))}
        </div>
      </div>
      {pages.length > 1 && (
        <div className="pagination-controls" style={{ marginTop: '10px', textAlign: 'center' }}>
          <button
            className="am-btn am-btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            style={{ marginRight: '10px' }}
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {pages.length}
          </span>
          <button
            className="am-btn am-btn-secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages.length - 1))}
            disabled={currentPage === pages.length - 1}
            style={{ marginLeft: '10px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginationSlider;

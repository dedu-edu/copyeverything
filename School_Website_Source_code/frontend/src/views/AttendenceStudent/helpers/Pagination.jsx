
import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { buildPageNumbers } from './Utils';

const btnBase = {
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '13px',
    backgroundColor: 'white',
    color: '#555',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '34px',
    lineHeight: 1,
};

export default function Pagination({ currentPage, totalPages, totalCount, onChange }) {
    if (totalPages <= 1) return null;

    const pages = buildPageNumbers(currentPage, totalPages);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '14px 20px',
                borderTop: '1px solid #dee2e6',
                flexWrap: 'wrap',
            }}
        >
            <button
                style={{ ...btnBase, opacity: currentPage === 1 ? 0.4 : 1 }}
                disabled={currentPage === 1}
                onClick={() => onChange(currentPage - 1)}
            >
                <ChevronLeft size={14} />
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`e-${i}`} style={{ padding: '0 4px', color: '#aaa' }}>
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        style={{
                            ...btnBase,
                            backgroundColor: p === currentPage ? '#4c8bf5' : 'white',
                            color: p === currentPage ? 'white' : '#555',
                            borderColor: p === currentPage ? '#4c8bf5' : '#dee2e6',
                            fontWeight: p === currentPage ? 'bold' : 'normal',
                        }}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                style={{ ...btnBase, opacity: currentPage === totalPages ? 0.4 : 1 }}
                disabled={currentPage === totalPages}
                onClick={() => onChange(currentPage + 1)}
            >
                <ChevronRight size={14} />
            </button>

            <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                Нийт <strong style={{ color: '#333' }}>{totalCount}</strong> оюутан —{' '}
                <strong style={{ color: '#4c8bf5' }}>{currentPage}</strong>/{totalPages} хуудас
            </span>
        </div>
    );
}

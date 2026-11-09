import React from "react";
import "./Pagination.css";

export interface PaginationProps {
    currentPage: number;
    lastPage: number;
    totalItems?: number;
    from?: number;
    to?: number;
    perPage?: number;
    perPageOptions?: number[];
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    lastPage,
    totalItems,
    from,
    to,
    perPage,
    perPageOptions = [10, 25, 50],
    onPageChange,
    onPerPageChange,
}) => {
    // Generate page items with ellipses
    const getPageNumbers = (): (number | string)[] => {
        if (lastPage <= 7) {
            return Array.from({ length: lastPage }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "...", lastPage];
        }

        if (currentPage >= lastPage - 3) {
            return [1, "...", lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
        }

        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", lastPage];
    };

    const pages = getPageNumbers();

    // Compute inferred from/to if totalItems is provided but from/to not explicitly given
    const calculatedFrom = from ?? (totalItems !== undefined && totalItems > 0 ? (currentPage - 1) * (perPage || 10) + 1 : 0);
    const calculatedTo = to ?? (totalItems !== undefined ? Math.min(currentPage * (perPage || 10), totalItems) : 0);

    return (
        <nav className="pg-wrapper" aria-label="Pagination Navigation">
            {/* Left: Summary text */}
            <div className="pg-summary">
                {totalItems !== undefined ? (
                    <span>
                        Showing <strong className="pg-highlight">{calculatedFrom}</strong> to{" "}
                        <strong className="pg-highlight">{calculatedTo}</strong> of{" "}
                        <strong className="pg-highlight">{totalItems}</strong> entries
                    </span>
                ) : (
                    <span>
                        Page <strong className="pg-highlight">{currentPage}</strong> of{" "}
                        <strong className="pg-highlight">{lastPage}</strong>
                    </span>
                )}
            </div>

            {/* Center / Right: Page navigation pills and optional per-page selector */}
            <div className="pg-controls">
                {onPerPageChange && perPage && (
                    <div className="pg-per-page">
                        <label htmlFor="pg-per-page-select" className="pg-per-page-label">
                            Rows:
                        </label>
                        <select
                            id="pg-per-page-select"
                            className="pg-per-page-select"
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="pg-buttons-group">
                    <button
                        type="button"
                        className="pg-nav-btn"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Previous Page"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        <span className="pg-nav-text">Prev</span>
                    </button>

                    <div className="pg-pages-list">
                        {pages.map((p, idx) => {
                            if (p === "...") {
                                return (
                                    <span key={`ellipsis-${idx}`} className="pg-ellipsis">
                                        &hellip;
                                    </span>
                                );
                            }

                            const pageNum = p as number;
                            const isActive = pageNum === currentPage;

                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    className={`pg-page-btn ${isActive ? "active" : ""}`}
                                    onClick={() => onPageChange(pageNum)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        className="pg-nav-btn"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage}
                        aria-label="Next Page"
                    >
                        <span className="pg-nav-text">Next</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Pagination;

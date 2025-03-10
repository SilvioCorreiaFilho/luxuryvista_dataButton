import React, { useState, useEffect, useCallback } from 'react';

interface VirtualListProps<T> {
  /** All items in the list */
  items: T[];
  /** Number of items to display per page */
  pageSize?: number;
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Optional function to get a unique key for each item */
  keyExtractor?: (item: T, index: number) => string;
  /** Optional classname for the container */
  className?: string;
  /** Show pagination controls */
  showControls?: boolean;
  /** Text for the 'Previous' button */
  previousLabel?: string;
  /** Text for the 'Next' button */
  nextLabel?: string;
  /** Callback when page changes */
  onPageChange?: (pageIndex: number) => void;
}

/**
 * A virtualized list component that shows items with pagination
 */
export function VirtualList<T>({ 
  items, 
  pageSize = 10, 
  renderItem, 
  keyExtractor = (_, index) => `item-${index}`,
  className = '',
  showControls = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  onPageChange
}: VirtualListProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  
  const totalPages = Math.ceil(items.length / pageSize);
  
  // Update visible items when items or page changes
  useEffect(() => {
    const start = currentPage * pageSize;
    setVisibleItems(items.slice(start, start + pageSize));
  }, [items, currentPage, pageSize]);
  
  // Navigate to next page if available
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => {
        const newPage = prev + 1;
        onPageChange?.(newPage);
        return newPage;
      });
    }
  }, [currentPage, totalPages, onPageChange]);
  
  // Navigate to previous page if available
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => {
        const newPage = prev - 1;
        onPageChange?.(newPage);
        return newPage;
      });
    }
  }, [currentPage, onPageChange]);
  
  // Go to a specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      onPageChange?.(page);
    }
  }, [totalPages, onPageChange]);
  
  return (
    <div className={`virtual-list ${className}`}>
      <div className="virtual-list-items">
        {visibleItems.map((item, index) => (
          <div key={keyExtractor(item, index)} className="virtual-list-item">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {showControls && totalPages > 1 && (
        <div className="virtual-list-pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 0}
            className="pagination-button prev"
          >
            {previousLabel}
          </button>
          
          <div className="pagination-info">
            {totalPages > 0 ? (
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
            ) : (
              <span>No items</span>
            )}
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={currentPage >= totalPages - 1}
            className="pagination-button next"
          >
            {nextLabel}
          </button>
        </div>
      )}
      
      {showControls && totalPages > 3 && (
        <div className="virtual-list-page-numbers">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={`page-${index}`}
              onClick={() => goToPage(index)}
              className={`page-number ${currentPage === index ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage a virtual list state externally
 */
export function useVirtualList<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  
  const totalPages = Math.ceil(items.length / pageSize);
  
  useEffect(() => {
    const start = currentPage * pageSize;
    setVisibleItems(items.slice(start, start + pageSize));
  }, [items, currentPage, pageSize]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  return {
    currentPage,
    totalPages,
    visibleItems,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0
  };
}
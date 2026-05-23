import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  pageSize?: number;
  mode?: 'pagination' | 'lazy_load';
  className?: string;
  listClassName?: string;
}

export default function PaginatedList<T>({
  items,
  renderItem,
  renderHeader,
  renderEmpty,
  pageSize = 10,
  mode = 'pagination',
  className = '',
  listClassName = '',
}: PaginatedListProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Reset page when items change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const totalCount = items.length;
  // Rule: Automatically activate pagination / lazy load when count > 50
  const isPagingRequired = totalCount > 50;

  const currentItems = React.useMemo(() => {
    if (!isPagingRequired) {
      return items;
    }
    if (mode === 'pagination') {
      const startIndex = (currentPage - 1) * pageSize;
      return items.slice(startIndex, startIndex + pageSize);
    } else {
      // lazy_load mode
      return items.slice(0, visibleCount);
    }
  }, [items, isPagingRequired, mode, currentPage, pageSize, visibleCount]);

  if (totalCount === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : (
      <div className="py-16 text-center text-slate-400 text-sm font-medium">
        Không có dữ liệu
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + pageSize, totalCount));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {renderHeader && renderHeader()}

      <div className={`divide-y divide-slate-100 ${listClassName}`}>
        <AnimatePresence mode="popLayout">
          {currentItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
            >
              {renderItem(item, idx)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isPagingRequired && (
        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/20 rounded-b-[40px]">
          {mode === 'pagination' ? (
            <>
              <div>
                Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
                {Math.min(currentPage * pageSize, totalCount)} của {totalCount} bản ghi
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl hover:bg-white hover:text-mint-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  // Center the active page if totalPages > 5
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum + (4 - i) > totalPages) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all ${
                        currentPage === pageNum
                          ? 'bg-mint-600 text-white shadow-lg shadow-mint-100'
                          : 'hover:bg-white hover:text-mint-600 hover:shadow-sm border border-transparent hover:border-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-1 text-slate-300 select-none">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-all ${
                        currentPage === totalPages
                          ? 'bg-mint-600 text-white shadow-lg shadow-mint-100'
                          : 'hover:bg-white hover:text-mint-600 hover:shadow-sm'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl hover:bg-white hover:text-mint-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                Đã tải {Math.min(visibleCount, totalCount)} / {totalCount} bản ghi
              </div>
              {visibleCount < totalCount && (
                <button
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 px-5 py-2.5 bg-mint-50 hover:bg-mint-100 text-mint-700 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Tải thêm dữ liệu
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

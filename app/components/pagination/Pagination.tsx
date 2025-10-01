import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show limited pages around current page
  const visiblePages = pages.filter(page => 
    page === 1 || 
    page === totalPages || 
    Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-gray-400 text-center sm:text-left">
        Halaman {currentPage} dari {totalPages}
      </div>
      
      <div className="flex items-center space-x-1 lg:space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 lg:h-8 lg:w-8 p-0 text-gray-400 border-gray-600 hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            const showEllipsis = index > 0 && page - visiblePages[index - 1] > 1;
            return (
              <div key={page} className="flex items-center">
                {showEllipsis && (
                  <span className="px-1 lg:px-2 text-gray-400">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "h-9 w-9 lg:h-8 lg:w-8 p-0 text-sm",
                    currentPage === page 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "text-gray-400 border-gray-600 hover:bg-gray-700"
                  )}
                >
                  {page}
                </Button>
              </div>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 lg:h-8 lg:w-8 p-0 text-gray-400 border-gray-600 hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
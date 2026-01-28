'use client';

import { useState, useEffect } from 'react';
import SearchHeader from './components/SearchHeader';
import ServiceProviderCard from './components/ServiceProviderCard';

// Define types based on the database schema
interface FacilityType {
  type: string;
  count: number;
}

interface ServiceProvider {
  _id: string;
  serviceName: string;
  address: string;
  logoUrl: string;
  serviceProviderType: string;
  features: string[];
  facilityTypes: FacilityType[];
  totalFacilities: number;
}

const ITEMS_PER_PAGE = 6;

// Mapping of facility types to display names
const FACILITY_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'individual-cabin': 'Private Cabins',
  'coworking-spaces': 'Co-Working Space',
  'meeting-rooms': 'Meeting Area',
  'bio-allied-labs': 'Labs',
  'manufacturing-labs': 'Labs',
  'prototyping-labs': 'Labs',
  'software': 'Labs',
  'saas-allied': 'Labs',
  'raw-space-office': 'Co-Working Space',
  'raw-space-lab': 'Labs',
};

export default function ProviderSearchPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        // const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        
        // // Use the absolute URL for the backend
        // const response = await fetch(`${API_URL}/service-providers`);
        const response = await fetch('/api/service-providers');
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        const data = await response.json();
        if (data.success || Array.isArray(data)) {
          setProviders(data.providers);
          setFilteredProviders(data.providers);
        } else {
          throw new Error(data.error || 'Failed to fetch providers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching providers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProviders(providers);
    } else {
      const searchTerms = query.toLowerCase().split(' ');
      const filtered = providers.filter(provider => {
        const searchText = `${provider.serviceName} ${provider.address} ${provider.serviceProviderType} ${provider.features.join(' ')}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
      });
      setFilteredProviders(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchHeader onSearch={handleSearch} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader onSearch={handleSearch} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
              >
                <div className="h-24 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No service providers found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProviders.map((provider) => (
                <ServiceProviderCard
                  key={provider._id}
                  provider={provider}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-md ${
                            currentPage === page
                              ? 'bg-green-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="px-2">
                          {page}
                        </span>
                      )
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
            
            {/* Results Summary */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProviders.length)} of {filteredProviders.length} providers
            </div>
          </>
        )}
      </div>
    </div>
  );
}

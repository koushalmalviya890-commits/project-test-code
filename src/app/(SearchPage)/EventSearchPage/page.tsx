"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import EventCards from "../../(landing)/events-page/components/eventcard";
import EventService from "@/services/Events/services/event-api-services";

// Interface definition (keep the same)
interface Event {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: string;
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string;
  features: Array<{
    name: string;
    files: string[];
    _id: string;
  }>;
  chiefGuests: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
  hasChiefGuest: boolean;
  hasFeatures: boolean;
  approvalStatus: string;
  activeStatus: string;
  ticketType: string;
  tickets: string;
  ticketCapacity: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  isFeatured: boolean;
  bulkEmailFile: string;
  collectPersonalInfo: Array<{
    fullName: string;
    email: string;
    phoneNumber: string;
    _id: string;
  }>;
  collectIdentityProof: Array<{
    idProof: string;
    idProofType: string;
    idNumber: string;
    webisteLink: string;
    _id: string;
  }>;
  customQuestions: Array<{
    questionType: string;
    question: string;
    options: string[];
    isRequired: string;
    _id: string;
  }>;
  customizeRegistrationEmail: boolean;
  registrationEmailBodyContent: string;
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: Array<{
    couponCode: string;
    discount: number;
    validFrom: string;
    validTo: string;
    _id: string;
  }>;
  eventReminder: boolean;
  postEventFeedback: boolean;
  postEventFeedbackDetails: Array<{
    scheduledDateTime: string;
    bodyContent: string;
    _id: string;
  }>;
  socialMediaLinks: Array<{
    socialLink: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Loading Component
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Search Page Component
function EventSearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get search query from URL
  const searchQueryFromUrl = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    hasNext: false,
    hasPrev: false
  });
  const sortEventsByFeatured = (events: Event[]) => {
  return [...events].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;

    return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
  });
};
  // Search events function
  const searchEvents = async (query: string = searchQuery, page: number = 1) => {
    try {
      setLoading(true);
      setError("");

      // Build search parameters
      const searchParams: any = {
        search: query,
        page: page,
        limit: 6
      };

     // console.log("Searching with params:", searchParams);

      const response = await EventService.searchEvents(searchParams);
      
      if (response.success) {
        
        const sorted = sortEventsByFeatured(Array.isArray(response.events) ? response.events : []);
setEvents(sorted);
        // setEvents(Array.isArray(response.events) ? response.events : []);
        setPagination(response.pagination as unknown as PaginationData || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 6,
          hasNext: false,
          hasPrev: false
        });
      } else {
        setError("Failed to search events");
        setEvents([]);
      }
    } catch (err: any) {
      console.error("Error searching events:", err);
      setError(err.message || "Failed to search events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL with search parameters
  const updateUrl = (query: string, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (query) params.set('search', query);
    if (page > 1) params.set('page', page.toString());

    const newUrl = `/EventSearchPage${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl, { scroll: false });
  };

  // Handle search
  const handleSearch = () => {
    updateUrl(searchQuery, 1);
    searchEvents(searchQuery, 1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateUrl(searchQuery, page);
    searchEvents(searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    router.push('/EventSearchPage');
    searchEvents("", 1);
  };




  // Load initial search on component mount and when URL params change
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    const urlPage = parseInt(searchParams.get('page') || '1');

    setSearchQuery(urlSearchQuery);
    searchEvents(urlSearchQuery, urlPage);
  }, [searchParams]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (pagination.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, pagination.currentPage - 1);
      let endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + 1);
      
      if (pagination.currentPage <= 2) {
        endPage = 4;
      } else if (pagination.currentPage >= pagination.totalPages - 1) {
        startPage = pagination.totalPages - 3;
      }
      
      if (startPage > 2) pageNumbers.push('...');
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < pagination.totalPages - 1) pageNumbers.push('...');
      
      if (pagination.totalPages > 1) {
        pageNumbers.push(pagination.totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">   
          {/* New Search Bar Design */}
          <div className="container mx-auto px-4 py-5 flex justify-center">
            <Card className="w-full max-w-[450px] rounded-full border border-gray-200 shadow-md">
              <CardContent className="p-0 flex items-center h-[60px]">
                <div className="flex items-center justify-between w-full h-full">
                  <div className="flex items-center flex-1 pl-6">
                    <Search className="h-5 w-5 text-gray-400 mr-3" />
                    <Input
                      className="border-none text-base font-light placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                      placeholder="Search by name or location"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                  <div className="pr-2">
                    <Button 
                      className="h-[40px] w-[40px] bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center p-0"
                      onClick={handleSearch}
                      aria-label="Search"
                    >
                      <Search className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clear Search Button */}
          {searchQuery && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={clearSearch}
                variant="outline"
                className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Results Info */}
          {!loading && (
            <div className=" text-gray-600 mt-6">
              {searchQuery && (
                <p className="mb-2">
                  Search results for: <span className="font-semibold text-gray-900">"{searchQuery}"</span>
                </p>
              )}
              <p className="text-sm">
                Showing {pagination.itemsPerPage * (pagination.currentPage - 1) + 1}-{Math.min(pagination.itemsPerPage * pagination.currentPage, pagination.totalItems)} of {pagination.totalItems} events
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Searching events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <Button 
                onClick={() => searchEvents()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-auto ">
           
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No events match your search for "${searchQuery}"` 
                  : 'No events available at the moment'
                }
              </p>
              {searchQuery && (
                <Button 
                  onClick={clearSearch}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <EventCards events={events} />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center mt-12">
                <nav className="flex items-center space-x-2 mb-4">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                      !pagination.hasPrev
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white border border-gray-300 bg-white shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                      typeof page === 'number' ? (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                            pagination.currentPage === page
                              ? 'bg-green-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-white border border-gray-300 bg-white shadow-sm'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="px-2 text-gray-500">
                          {page}
                        </span>
                      )
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                      !pagination.hasNext
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-white border border-gray-300 bg-white shadow-sm'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </nav>
                
                <div className="text-center text-sm text-gray-500">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventSearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <EventSearchPageClient />
    </Suspense>
  );
}

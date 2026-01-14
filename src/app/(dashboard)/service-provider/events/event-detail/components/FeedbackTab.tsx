'use client';

import React, { useEffect, useState } from 'react';
import { Star, Loader2, Filter, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import EventService from '../../services/event-api-services';

interface FeedbackData {
  _id: string;
  name: string;
  email: string;
  rating: number;
  comments: string;
  createdAt: string;
}

interface FeedbackResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  feedbacks: FeedbackData[];
}

interface FeedbackTabProps {
  eventData: {
    _id: string;
  };
}

export default function FeedbackTab({ eventData }: FeedbackTabProps) {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 6;

  // Fetch feedback data with filters and pagination
  const fetchFeedbacks = async (page = 1, sort = sortBy, filter = filterBy) => {
    if (!eventData?._id || !session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await EventService.getFeedback(
        eventData._id,
        session.user.id,
        sort,
        filter,
        page,
        itemsPerPage
      );

      if (response && response.feedbacks as unknown as FeedbackData[]) {
        const data = response as unknown as FeedbackResponse;
        setFeedbacks(data.feedbacks);
        setTotalPages(data.totalPages);
        setTotalFeedbacks(data.total);
        setCurrentPage(data.page);
      } else {
        setFeedbacks([]);
        setTotalPages(1);
        setTotalFeedbacks(0);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedback data');
      setFeedbacks([]);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFeedbacks();
  }, [eventData?._id, session?.user?.id]);

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    fetchFeedbacks(1, newSort, filterBy);
    setShowMobileFilters(false);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilterBy(newFilter);
    setCurrentPage(1);
    fetchFeedbacks(1, sortBy, newFilter);
    setShowMobileFilters(false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchFeedbacks(newPage, sortBy, filterBy);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 md:h-4 md:w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Calculate overall rating
  const calculateOverallRating = () => {
    if (feedbacks.length === 0) return 'No ratings yet';
    
    const avgRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
    
    if (avgRating >= 4.5) return 'Excellent';
    if (avgRating >= 4.0) return 'Very Good';
    if (avgRating >= 3.5) return 'Good';
    if (avgRating >= 3.0) return 'Average';
    return 'Below Average';
  };

  // Get sort/filter display names
  const getSortDisplayName = (value: string) => {
    const names: Record<string, string> = {
      'newest': 'Newest',
      'oldest': 'Oldest',
      'highest': 'Highest Rated',
      'lowest': 'Lowest Rated'
    };
    return names[value] || value;
  };

  const getFilterDisplayName = (value: string) => {
    const names: Record<string, string> = {
      'all': 'All Feedbacks',
      '5-star': '5 Star',
      '4-star': '4 Star',
      '3-star': '3 Star',
      '2-star': '2 Star',
      '1-star': '1 Star'
    };
    return names[value] || value;
  };

  // Mobile Feedback Card Component
  const MobileFeedbackCard = ({ feedback }: { feedback: FeedbackData }) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar with initials */}
        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
          {feedback.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{feedback.name}</h4>
          <p className="text-xs text-gray-600 mb-2 truncate">{feedback.email}</p>
          <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
        {feedback.comments}
      </p>

      <p className="text-xs text-gray-500">
        {formatDate(feedback.createdAt)} - {formatTime(feedback.createdAt)}
      </p>
    </div>
  );

  if (loading && currentPage === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 pb-4 gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Feedback</h2>
        
        {/* Desktop Filters */}
        <div className="hidden sm:flex items-center gap-3">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32 md:w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-32 md:w-36">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedbacks</SelectItem>
              <SelectItem value="5-star">5 Star</SelectItem>
              <SelectItem value="4-star">4 Star</SelectItem>
              <SelectItem value="3-star">3 Star</SelectItem>
              <SelectItem value="2-star">2 Star</SelectItem>
              <SelectItem value="1-star">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filter Button */}
        <div className="sm:hidden">
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Sort & Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Sort & Filter Feedback</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Current Selection Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Sort:</span>
                    <span className="text-sm font-medium">{getSortDisplayName(sortBy)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Filter:</span>
                    <span className="text-sm font-medium">{getFilterDisplayName(filterBy)}</span>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'newest', label: 'Newest' },
                      { value: 'oldest', label: 'Oldest' },
                      { value: 'highest', label: 'Highest Rated' },
                      { value: 'lowest', label: 'Lowest Rated' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? "default" : "outline"}
                        onClick={() => handleSortChange(option.value)}
                        className="w-full justify-start"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filter Options */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Filter By Rating
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Feedbacks' },
                      { value: '5-star', label: '5 Star' },
                      { value: '4-star', label: '4 Star' },
                      { value: '3-star', label: '3 Star' },
                      { value: '2-star', label: '2 Star' },
                      { value: '1-star', label: '1 Star' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={filterBy === option.value ? "default" : "outline"}
                        onClick={() => handleFilterChange(option.value)}
                        className="w-full justify-start"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Overall Ratings */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Overall Ratings</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm md:text-base font-medium">{calculateOverallRating()}</span>
          <span className="text-xl md:text-2xl">😊</span>
          {totalFeedbacks > 0 && (
            <span className="text-xs md:text-sm text-gray-500">
              ({totalFeedbacks} review{totalFeedbacks !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
            <p className="text-red-600 text-sm md:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State for Pagination */}
      {loading && currentPage > 1 && (
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="flex items-center justify-center py-6 md:py-8">
            <Loader2 className="animate-spin h-5 w-5 md:h-6 md:w-6 text-gray-400" />
          </div>
        </div>
      )}

      {/* Feedback Grid */}
      {!loading && (
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="text-gray-400 text-4xl md:text-6xl mb-3 md:mb-4">📝</div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-500 text-sm md:text-base">
                {filterBy !== 'all' 
                  ? `No ${filterBy} feedback found for this event.`
                  : 'No feedback for this event!'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Grid View */}
              <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {feedbacks.map((feedback) => (
                  <div key={feedback._id} className="bg-gray-50 p-4 md:p-6 rounded-lg border">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      {/* Avatar with initials */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs md:text-sm">
                        {feedback.name
                          .split(' ')
                          .map((word) => word[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 truncate text-sm md:text-base">{feedback.name}</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mb-2 truncate">{feedback.email}</p>
                        <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 leading-relaxed">
                      {feedback.comments}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatDate(feedback.createdAt)} - {formatTime(feedback.createdAt)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile List View */}
              <div className="sm:hidden space-y-3">
                {feedbacks.map((feedback) => (
                  <MobileFeedbackCard key={feedback._id} feedback={feedback} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 pb-4 md:pb-6 gap-3">
          <div className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalFeedbacks)} of {totalFeedbacks} results
          </div>
          
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="text-xs md:text-sm"
            >
              Previous
            </Button>
            
            {/* Desktop Pagination Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0 text-xs"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Mobile Page Indicator */}
            <div className="sm:hidden px-3 py-1 bg-gray-100 rounded text-xs text-gray-600">
              {currentPage} / {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="text-xs md:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

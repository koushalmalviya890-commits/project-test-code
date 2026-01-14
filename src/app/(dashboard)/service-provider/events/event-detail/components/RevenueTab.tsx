'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Download, ExternalLink, Calendar, ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import EventService from '../../services/event-api-services'; // Adjust path as needed

interface BookingData {
  _id: string;
  bookingRefNumber?: string;
  status: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'free';
  razorpayOrderId?: string;
  paymentMethod: string;
  bookingTickets: number;
  gstAmount: number;
  platformFee: number;
  totalAmount: number;
  invoiceUrl: string | null;
  PersonalInfo: Array<{
    userfullName: string;
    useremail: string;
    userphoneNumber: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface TicketSummary {
  ticketCapacity: number;
  bookedTicketsCount: number;
  remainingTickets: number;
}

interface RevenueTabProps {
  eventData: {
    _id: string;
  };
}

interface PaymentSummary {
  totalBookings: number;
  totalEarnings: number;
}

export default function RevenueTab({ eventData }: RevenueTabProps) {
  const { data: session } = useSession();
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('This Month');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);

  // Custom Calendar Component
  const CustomCalendar = ({
    selectedDate,
    onSelect,
  }: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
  }) => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const today = new Date();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => onSelect(date)}
          className={`h-8 w-8 text-sm rounded transition-colors ${
            isSelected
              ? "bg-green-500 text-white font-medium"
              : isToday
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-3 md:p-4 w-[280px] md:w-80 bg-white shadow-lg rounded-lg border">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`h-6 md:h-8 flex items-center justify-center text-xs font-medium ${
                index === 0 || index === 6 ? "text-green-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  // Mobile Revenue Card Component
  const MobileRevenueCard = ({ booking, index }: { booking: BookingData; index: number }) => {
    const personalInfo = booking.PersonalInfo[0] || {};
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRows.includes(booking._id)}
              onCheckedChange={(checked) => handleRowSelect(booking._id, checked as boolean)}
            />
            <span className="text-sm text-gray-500">#{index + 1}</span>
          </div>
          <div className="flex items-center gap-2">
            {getPaymentStatusBadge(booking.paymentStatus)}
            {booking.invoiceUrl ? (
              <a 
                href={booking.invoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded"
              >
                <Download className="h-4 w-4 text-gray-600 hover:text-gray-900" />
              </a>
            ) : (
              <Download className="h-4 w-4 text-gray-300" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Booking ID:</span>
            <span className="font-medium text-sm">
              {booking.bookingRefNumber || `BK${booking._id.slice(-6)}`}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Customer:</span>
            <span className="font-medium text-sm text-blue-600 truncate max-w-[150px]">
              {personalInfo.userfullName || '-'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Email:</span>
            <span className="text-sm truncate max-w-[150px]">
              {personalInfo.useremail || '-'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Phone:</span>
            <span className="text-sm">
              {personalInfo.userphoneNumber || '-'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm font-medium">
              {formatDate(booking.createdAt)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tickets:</span>
            <span className="text-sm font-medium">
              {booking.bookingTickets}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Payment:</span>
            <span className="text-sm">
              {booking.paymentMethod || '-'}
            </span>
          </div>
          
          {booking.razorpayOrderId && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Order ID:</span>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[120px]">
                {booking.razorpayOrderId}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      if (!eventData._id || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await EventService.getBookingsByEvent(eventData._id, session.user.id);
        
        if (response.success) {
          const data = response.data as { bookings: BookingData[]; ticketSummary: TicketSummary; paymentSummary: PaymentSummary };
          setAllBookings(data.bookings || []);
          setFilteredBookings(data.bookings || []);
          setPaymentSummary(data.paymentSummary || null);
        } else {
          setError('Failed to fetch bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Error loading bookings');
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [eventData._id, session?.user?.id]);

  // Filter bookings by month
  useEffect(() => {
    if (allBookings.length === 0) return;

    const now = new Date();
    let filtered = [...allBookings];

    switch (selectedMonth) {
      case "This Month":
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        filtered = allBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= startOfThisMonth && bookingDate <= endOfThisMonth;
        });
        break;

      case "Last Month":
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        filtered = allBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= startOfLastMonth && bookingDate <= endOfLastMonth;
        });
        break;

      case "Last 3 Months":
        const start3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        filtered = allBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= start3Months;
        });
        break;

      case "Last 6 Months":
        const start6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        filtered = allBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= start6Months;
        });
        break;

      case "This Year":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        filtered = allBookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= startOfYear && bookingDate <= endOfYear;
        });
        break;

      default:
        filtered = allBookings;
        break;
    }

    setFilteredBookings(filtered);
  }, [allBookings, selectedMonth]);

  // Filter by selected date
  useEffect(() => {
    if (selectedDate && allBookings.length > 0) {
      const filtered = allBookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === selectedDate.toDateString();
      });
      setFilteredBookings(filtered);
    }
  }, [selectedDate, allBookings]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs">Received</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white text-xs">Payment Failed</Badge>;
      case 'free':
        return <Badge className="bg-blue-500 text-white text-xs">Free</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-red-500 text-white text-xs">Payment Failed</Badge>;
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredBookings.map(booking => booking._id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowCalendar(false);
    if (!date) {
      setSelectedMonth('This Month');
    }
  };

  // Export to Excel
  const handleExportData = () => {
    const dataToExport = selectedRows.length > 0 
      ? filteredBookings.filter(booking => selectedRows.includes(booking._id))
      : filteredBookings;

    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = dataToExport.map((booking, index) => ({
      'SL.NO': index + 1,
      'Booking ID': booking.bookingRefNumber || '',
      'Customer Name': booking.PersonalInfo[0]?.userfullName || '',
      'Email': booking.PersonalInfo[0]?.useremail || '',
      'Phone': booking.PersonalInfo[0]?.userphoneNumber || '',
      'Booking Date': formatDate(booking.createdAt),
      'Tickets': booking.bookingTickets,
      'Amount': booking.totalAmount,
      'Payment Method': booking.paymentMethod,
      'Order ID': booking.razorpayOrderId || '',
      'Status': booking.paymentStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue');
    
    XLSX.writeFile(workbook, `revenue-${eventData._id}.xlsx`);
    toast.success(`Revenue data exported successfully! (${dataToExport.length} rows)`);
    setShowMobileFilters(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Filters and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 pb-4 gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Revenue</h2>
        
        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Custom Calendar Filter */}
          <div className="relative" ref={calendarRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`h-10 w-10 ${selectedDate ? 'border-green-500 text-green-600' : 'text-gray-500'}`}
            >
              <Calendar className="h-5 w-5" />
            </Button>
            {showCalendar && (
              <div className="absolute top-12 right-0 z-50">
                <CustomCalendar selectedDate={selectedDate} onSelect={handleDateSelect} />
              </div>
            )}
          </div>

          {/* Month Filter */}
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500">
              <Calendar className="h-5 w-5" />
            </Button>
            <Select 
              value={selectedDate ? 'Custom Date' : selectedMonth} 
              onValueChange={(value) => {
                if (value !== 'Custom Date') {
                  setSelectedMonth(value);
                  setSelectedDate(undefined);
                }
              }}
            >
              <SelectTrigger className="border-0 w-[150px] h-10 focus:ring-0">
                <SelectValue>{selectedDate ? 'Custom Date' : selectedMonth}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Data */}
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export Data {selectedRows.length > 0 && `(${selectedRows.length})`}
          </Button>
        </div>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Filters & Export
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Revenue Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date Range
                  </label>
                  <Select 
                    value={selectedDate ? 'Custom Date' : selectedMonth} 
                    onValueChange={(value) => {
                      if (value !== 'Custom Date') {
                        setSelectedMonth(value);
                        setSelectedDate(undefined);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>{selectedDate ? 'Custom Date' : selectedMonth}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="Last Month">Last Month</SelectItem>
                      <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                      <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                      <SelectItem value="This Year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Custom Calendar */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Custom Date
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`w-full ${selectedDate ? 'border-green-500 text-green-600' : ''}`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDate ? formatDate(selectedDate.toISOString()) : 'Select Date'}
                  </Button>
                  {showCalendar && (
                    <div className="mt-2">
                      <CustomCalendar selectedDate={selectedDate} onSelect={handleDateSelect} />
                    </div>
                  )}
                </div>

                {/* Export Actions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Export Data {selectedRows.length > 0 && `(${selectedRows.length} selected)`}
                  </label>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Revenue Data
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Bookings so far</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{paymentSummary?.totalBookings || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Earnings so far</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">₹{paymentSummary?.totalEarnings || 0}</div>
          </div>
        </div>
      </div>

      {/* Bulk Selection Info (Mobile) */}
      {selectedRows.length > 0 && (
        <div className="px-4 md:px-6 pb-4 lg:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">
                {selectedRows.length} booking{selectedRows.length > 1 ? 's' : ''} selected
              </p>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setSelectedRows([])}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block px-4 md:px-6 pb-4 md:pb-6">
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedRows.length === filteredBookings.length && filteredBookings.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">SL.NO</TableHead>
                  <TableHead className="font-semibold text-gray-600">BOOKING ID</TableHead>
                  <TableHead className="font-semibold text-gray-600">NAME</TableHead>
                  <TableHead className="font-semibold text-gray-600">EMAIL ID</TableHead>
                  <TableHead className="font-semibold text-gray-600">MOBILE NO</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">BOOKING DATE</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">TICKETS</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">AMOUNT PAID</TableHead>
                  <TableHead className="font-semibold text-gray-600">PAYMENT METHOD</TableHead>
                  <TableHead className="font-semibold text-gray-600">ORDER ID</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">STATUS LABELS</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">PAYMENT DETAILS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                      No revenue data found for the selected filter
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking, index) => {
                    const personalInfo = booking.PersonalInfo[0] || {};
                    return (
                      <TableRow key={booking._id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox 
                            checked={selectedRows.includes(booking._id)}
                            onCheckedChange={(checked) => handleRowSelect(booking._id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {booking.bookingRefNumber || `BK${booking._id.slice(-6)}`}
                        </TableCell>
                        <TableCell className="text-blue-600 cursor-pointer hover:underline">
                          {personalInfo.userfullName || '-'}
                        </TableCell>
                        <TableCell>{personalInfo.useremail || '-'}</TableCell>
                        <TableCell>{personalInfo.userphoneNumber || '-'}</TableCell>
                        <TableCell className="text-center">
                          {formatDate(booking.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {booking.bookingTickets}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(booking.totalAmount)}
                        </TableCell>
                        <TableCell>{booking.paymentMethod || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {booking.razorpayOrderId || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-center">
                          {booking.invoiceUrl ? (
                            <a 
                              href={booking.invoiceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-1 hover:bg-gray-100 rounded"
                            >
                              <Download className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                            </a>
                          ) : (
                            <Download className="h-4 w-4 text-gray-300" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden px-4 md:px-6 pb-4 md:pb-6">
        {/* Mobile Select All */}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedRows.length === filteredBookings.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredBookings.length} booking{filteredBookings.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No revenue data found for the selected filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking, index) => (
              <MobileRevenueCard key={booking._id} booking={booking} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

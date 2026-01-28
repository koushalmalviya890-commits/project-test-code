'use client';

import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { Download, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

interface BookingTabProps {
  eventData: {
    _id: string;
  };
}

export default function BookingTab({ eventData }: BookingTabProps) {
  // const { data: session } = useSession();
  const {user} = useAuth();
  const session = user ? { user } : null;
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [ticketSummary, setTicketSummary] = useState<TicketSummary>({
    ticketCapacity: 0,
    bookedTicketsCount: 0,
    remainingTickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Fetch bookings data
  useEffect(() => {
    const fetchBookings = async () => {
      if (!eventData._id || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await EventService.getBookingsByEvent(eventData._id, session.user.id);
        
        if (response.success) {
          const data = response.data as { bookings: BookingData[]; ticketSummary: TicketSummary };
          setBookings(data.bookings || []);
          setTicketSummary(data.ticketSummary || {
            ticketCapacity: 0,
            bookedTicketsCount: 0,
            remainingTickets: 0
          });
        } else {
          setError('No bookings found');
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
      setSelectedRows(bookings.map(booking => booking._id));
    } else {
      setSelectedRows([]);
    }
  };

  // Export to Excel
  const handleExportData = async () => {
     try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/events/export`, {
          method: "POST",
           body: JSON.stringify({
        'event_id': eventData._id,
        'facility_id': session?.user?.id
      }),
    
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          throw new Error("Failed to export data");
        }
    
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
    
        // Create a hidden link element and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = "all_events.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
    
        window.URL.revokeObjectURL(url);
        toast.success("All event data exported successfully!");
      } catch (error) {
        console.error("Export error:", error);
        toast.error("No data to export");
      }
    // const dataToExport = selectedRows.length > 0 
    //   ? bookings.filter(booking => selectedRows.includes(booking._id))
    //   : bookings;

    // if (dataToExport.length === 0) {
    //   toast.error('No data to export');
    //   return;
    // }

    // const exportData = dataToExport.map((booking, index) => ({
    //   'SL.NO': index + 1,
    //   'Booking ID': booking.bookingRefNumber || '',
    //   'Customer Name': booking.PersonalInfo[0]?.userfullName || '',
    //   'Email': booking.PersonalInfo[0]?.useremail || '',
    //   'Phone': booking.PersonalInfo[0]?.userphoneNumber || '',
    //   'Booking Date': formatDate(booking.createdAt),
    //   'Tickets': booking.bookingTickets,
    //   'Amount': booking.totalAmount,
    //   'Status': booking.paymentStatus
    // }));

    // const worksheet = XLSX.utils.json_to_sheet(exportData);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    
    // XLSX.writeFile(workbook, `bookings-${eventData._id}.xlsx`);
    // toast.success(`Booking data exported successfully! (${dataToExport.length} rows)`);
    // setShowMobileActions(false);
  };

  // Mobile Booking Card Component
  const MobileBookingCard = ({ booking, index }: { booking: BookingData; index: number }) => {
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
        </div>
      </div>
    );
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 pb-4 gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Booking History</h2>
        
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* <Button variant="outline" className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">Open Full Table</span>
            <span className="md:hidden">Full Table</span>
          </Button> */}
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export Data</span>
            <span className="md:hidden">Export</span>
            {selectedRows.length > 0 && ` (${selectedRows.length})`}
          </Button>
        </div>
        
        {/* Mobile Actions */}
        <div className="sm:hidden">
          <Sheet open={showMobileActions} onOpenChange={setShowMobileActions}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Actions & Export
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Booking Actions</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowMobileActions(false)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Full Table
                </Button> */}
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data {selectedRows.length > 0 && `(${selectedRows.length})`}
                </Button>
                {selectedRows.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      {selectedRows.length} booking{selectedRows.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Ticket Summary Cards */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl capitalize font-bold text-gray-900 mb-1">
              {ticketSummary.ticketCapacity}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Total Tickets</div>
          </div>
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              {ticketSummary.bookedTicketsCount}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Ticket Booked</div>
          </div>
          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 capitalize">
              {ticketSummary.remainingTickets}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>

      {/* Bulk Selection Info (Mobile) */}
      {selectedRows.length > 0 && (
        <div className="px-4 md:px-6 pb-4 sm:hidden">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedRows.length === bookings.length && bookings.length > 0}
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
                <TableHead className="font-semibold text-gray-600 text-center">STATUS LABELS</TableHead>
                <TableHead className="font-semibold text-gray-600 text-center">TICKETS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking, index) => {
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

      {/* Mobile Card View */}
      <div className="lg:hidden px-4 md:px-6 pb-4 md:pb-6">
        {/* Mobile Select All */}
        {bookings.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedRows.length === bookings.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
            <span className="text-sm text-gray-500">
              {bookings.length} booking{bookings.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, index) => (
              <MobileBookingCard key={booking._id} booking={booking} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

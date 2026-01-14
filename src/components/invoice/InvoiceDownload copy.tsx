'use client'

import { useState, useEffect } from 'react';
import { FiFileText, FiMail, FiPrinter } from 'react-icons/fi';
import { RiErrorWarningLine } from 'react-icons/ri';
import Link from 'next/link';
import { toast } from 'sonner';

interface InvoiceDownloadProps {
  bookingId: string;
}

export default function InvoiceDownload({ bookingId }: InvoiceDownloadProps) {
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoiceUrl() {
      try {
        setLoading(true);
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
       // console.log("Booking data for invoice:", data);
        
        if (data.invoiceUrl) {
          setInvoiceUrl(data.invoiceUrl);
        } else {
          setError('Invoice is not yet available for this booking');
        }
      } catch (error) {
        setError('Error loading invoice information');
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchInvoiceUrl();
    }
  }, [bookingId]);

  const handleEmailInvoice = async () => {
    try {
      const response = await fetch('/api/invoices/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bookingId,
          // When user manually clicks, always force send the email
          forceSend: true 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invoice email');
      }

      toast.success('Invoice has been sent to your email!');
    } catch (error) {
      console.error('Error sending invoice email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invoice. Please try again later.');
    }
  };

  const handlePrintInvoice = () => {
    if (!invoiceUrl) return;
    
    // Open the invoice in a new window and print it
    const printWindow = window.open(invoiceUrl, 'print_invoice', 'height=600,width=800');
    if (printWindow) {
      printWindow.onload = () => {
        // Brief delay to ensure the content is loaded
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      toast.error('Please allow pop-ups to print the invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse flex space-x-4 w-full">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <RiErrorWarningLine className="h-8 w-8 mb-2" />
        <h3 className="text-lg font-medium mb-2">Invoice Not Available</h3>
        <p className="text-center text-sm mb-4">{error}</p>
        <p className="text-xs text-center">
          The invoice will be generated shortly after your payment is confirmed.
          Please check back in a few moments.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <FiFileText className="h-8 w-8 text-brand-primary mb-2" />
      <h3 className="text-lg font-medium mb-2">Invoice Ready</h3>
      <p className="text-center text-sm text-gray-600 mb-4">
        Your booking invoice has been generated and is ready for viewing or printing.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        {invoiceUrl && (
          <>
            <Link
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              <FiFileText className="mr-2" />
              View Invoice
            </Link>
            
            <button
              onClick={handlePrintInvoice}
              className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
            >
              <FiPrinter className="mr-2" />
              Print Invoice
            </button>
          </>
        )}
        
        <button
          onClick={handleEmailInvoice}
          className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          <FiMail className="mr-2" />
          Email Invoice
        </button>
      </div>
    </div>
  );
} 
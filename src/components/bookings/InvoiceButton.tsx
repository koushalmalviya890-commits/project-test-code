import { useState } from 'react';
import { FiDownload, FiMail, FiFileText, FiPrinter } from 'react-icons/fi';
import { toast } from 'sonner';

interface InvoiceButtonProps {
  bookingId: string;
  invoiceUrl?: string | null;
  className?: string;
  variant?: 'icon' | 'full' | 'compact';
}

export default function InvoiceButton({
  bookingId,
  invoiceUrl,
  className = '',
  variant = 'full'
}: InvoiceButtonProps) {
  const [sending, setSending] = useState(false);

  const handleSendEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (sending) return;
    
    try {
      setSending(true);
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
    } finally {
      setSending(false);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  if (!invoiceUrl) {
    return variant === 'icon' ? (
      <span className={`text-gray-400 cursor-not-allowed ${className}`} title="Invoice not available">
        <FiFileText className="w-5 h-5" />
      </span>
    ) : variant === 'compact' ? (
      <span className={`text-gray-400 px-2 py-1 text-sm rounded border border-gray-200 cursor-not-allowed ${className}`} title="Invoice not available">
        <FiFileText className="w-4 h-4 inline mr-1" /> No Invoice
      </span>
    ) : (
      <span className={`text-gray-400 px-3 py-2 text-sm rounded-md border border-gray-200 cursor-not-allowed ${className}`} title="Invoice not available">
        <FiFileText className="w-4 h-4 inline mr-2" /> Invoice Not Available
      </span>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-primary-dark transition-colors"
          title="View Invoice"
        >
          <FiFileText className="w-5 h-5" />
        </a>
        <button
          onClick={handlePrint}
          className="text-brand-primary hover:text-brand-primary-dark transition-colors"
          title="Print Invoice"
        >
          <FiPrinter className="w-5 h-5" />
        </button>
        <button
          onClick={handleSendEmail}
          disabled={sending}
          className={`text-brand-primary hover:text-brand-primary-dark transition-colors ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Email Invoice"
        >
          <FiMail className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary hover:text-brand-primary-dark transition-colors text-sm px-2 py-1 rounded border border-brand-primary hover:bg-brand-primary/5"
        >
          <FiFileText className="w-3 h-3 inline mr-1" /> Invoice
        </a>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center px-3 py-2 bg-brand-primary text-white text-sm rounded-md hover:bg-brand-primary-dark transition-colors"
      >
        <FiFileText className="mr-2" />
        View Invoice
      </a>
      <button
        onClick={handlePrint}
        className="flex items-center justify-center px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
      >
        <FiPrinter className="mr-2" />
        Print
      </button>
      <button
        onClick={handleSendEmail}
        disabled={sending}
        className={`flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FiMail className="mr-2" />
        {sending ? 'Sending...' : 'Email'}
      </button>
    </div>
  );
} 
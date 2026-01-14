'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import {
  UserPlus,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  Filter,
  Download,
  X,
} from 'lucide-react';

interface Customer {
  _id: string;
  userId: string;
  startupName: string;
  contactName?: string;
  startupMailId: string;
  contactNumber: string;
  address?: string;
  createdAt?: string;
}

export default function BookingsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [startups, setStartups] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [emailDomain, setEmailDomain] = useState(''); // Default email domain, change as needed
const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch customers with email domain filter for the popup
        const res = await fetch(`/api/customers?emailDomain=${emailDomain}`);
        const data = await res.json();
        if (res.ok) {
          setCustomers(data);
        } else {
          console.error('Error fetching customers:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [emailDomain]);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const res = await fetch('/api/fecthstartups');
        const data = await res.json();
        if (res.ok) {
          setStartups(data);
        } else {
          console.error('Error fetching startups:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch startups', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const handleAddStartup = async (startupId: string) => {
    try {
      const res = await fetch('/api/fecthstartups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId }),
      });
      if (res.ok) {
        // Success toast animation
        const toast = document.createElement('div');
        toast.className =
          'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        toast.innerHTML = '✓ Startup added successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        setSelectedCustomers([...selectedCustomers, startupId]);

        // Refresh startups list
        const refreshRes = await fetch('/api/fecthstartups');
        const refreshData = await refreshRes.json();
        setStartups(refreshData);

        // Close the popup after successful addition
        setShowPopup(false);
        setSearchQuery('');
         // Clear search query for next time
        
      } else {
        console.error('Failed to add startup');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStartup = async (startupId: string) => {
    try {
      const res = await fetch(`/api/fecthstartups`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId }),
      });
      if (res.ok) {
        // Success toast animation
        const toast = document.createElement('div');
        toast.className =
          'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
        toast.innerHTML = '✓ Startup removed successfully';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        // Refresh startups list
        const refreshRes = await fetch('/api/fecthstartups');
        const refreshData = await refreshRes.json();
        setStartups(refreshData);
      } else {
        console.error('Failed to remove startup');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const safelyParseDate = (dateString: string | undefined) => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date();
    }
  };

  const filteredStartups = startups.filter((customer) =>
  customer.startupName?.toLowerCase().includes(searchTerm.toLowerCase())
);

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = (cust.startupName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isNotAlreadyAdded = !startups.some((startup) => startup._id === cust._id);
    return matchesSearch && isNotAlreadyAdded;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 font-medium">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Customer Management
                </h1>
                <p className="text-slate-600 mt-1">Manage your startup partnerships</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>{
                  setEmailDomain('');
                  setCustomers([]);
                  setShowPopup(true)
                } }
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-600">Total Customers</p>
                  <p className="text-2xl font-bold text-slate-900">{startups.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Mail className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-600">Active</p>
                  <p className="text-2xl font-bold text-slate-900">{startups.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Active Customers</h2>
              <div className="relative">
                {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" /> */}

  <input
    type="text"
    placeholder="Search by Startup Name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
  />

              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-b border-slate-200/60">
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">#</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date Added</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Startup Name</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">Contact Person</TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Mobile</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-left">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 font-semibold text-slate-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
        <TableBody className="divide-y divide-slate-200/60">
  {startups.length === 0 ? (
    // 👉 No customers in DB at all
    <TableRow>
      <TableCell colSpan={8} className="h-64">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-600 font-medium text-lg">
              No customers found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Get started by adding your first customer
            </p>
          </div>
          <button
            onClick={() => {
              setEmailDomain("");
              setCustomers([]);
              setShowPopup(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Customer
          </button>
        </div>
      </TableCell>
    </TableRow>
  ) : filteredStartups.length > 0 ? (
    // 👉 Show filtered results
    filteredStartups.map((customer, index) => {
      const createdDate = safelyParseDate(customer.createdAt);
      return (
        <TableRow
          key={customer._id || index}
          className="hover:bg-slate-50/50 transition-colors duration-200"
        >
          <TableCell className="py-4 px-6">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-semibold text-indigo-700">
              {index + 1}
            </div>
          </TableCell>
          <TableCell className="py-4 px-6">
            <div className="flex flex-col">
              <span className="font-medium text-slate-900">
                {format(createdDate, "dd MMM yyyy")}
              </span>
              <span className="text-sm text-slate-500">
                {format(createdDate, "HH:mm")}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {customer.startupName?.charAt(0)?.toUpperCase() || "S"}
                </span>
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  {customer.startupName || "N/A"}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell className="py-4 px-6">
            <span className="text-slate-700">
              {customer.contactName || "N/A"}
            </span>
          </TableCell>
          <TableCell className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">
                {customer.startupMailId || "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">
                {customer.contactNumber || "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 max-w-32 truncate">
                {customer.address || "N/A"}
              </span>
            </div>
          </TableCell>
          <TableCell className="py-4 px-6 text-center">
            <button
              onClick={() => handleRemoveStartup(customer.userId)}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 group"
            >
              <Trash2 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
              Remove
            </button>
          </TableCell>
        </TableRow>
      );
    })
  ) : (
    // 👉 No matches when searching
    <TableRow>
      <TableCell colSpan={8} className="h-64 text-center text-slate-500">
        No matching results
      </TableCell>
    </TableRow>
  )}
</TableBody>


            </Table>
          </div>
        </div>

        {/* Enhanced Popup Modal */}
        <Dialog
          open={showPopup}
          onClose={() => {
            setShowPopup(false);
            setEmailDomain('');
            setCustomers([]);
          }}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-white">
                        Add Existing Customers
                      </Dialog.Title>
                      <p className="text-indigo-100 text-sm">
                        Select customers with @{emailDomain} email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by startup mail..."
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-slate-50"
                  />
                </div>

                <div className="max-h-96 overflow-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <Table className="w-full">
                    <TableHeader className="bg-white/80 sticky top-0">
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">Startup Name</TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">Email</TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700">Phone</TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-slate-700 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-200">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((cust) => (
                          <TableRow key={cust._id} className="hover:bg-white/60 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {cust.startupName?.charAt(0)?.toUpperCase() || 'S'}
                                  </span>
                                </div>
                                <span className="font-medium text-slate-900">{cust.startupName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">{cust.startupMailId}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">{cust.contactNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleAddStartup(cust.userId)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center space-y-3">
                              <Search className="h-12 w-12 text-slate-300" />
                              {/* <p className="text-slate-500 font-medium">No customers found</p> */}
                              <p className="text-slate-400 text-sm">Try adjusting your search terms</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                    onClick={() => setShowPopup(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
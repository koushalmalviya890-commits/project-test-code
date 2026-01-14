// import {
//   Dialog,
//   DialogContent,
//   DialogTrigger,
//   DialogHeader,
//   DialogTitle
// } from "@/components/ui/dialog";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Clock, CheckCircle, XCircle } from "lucide-react";
// import { toast } from "sonner"; // Optional: for feedback

// interface ExtensionRequest {
//   _id: string;
//   startupName: string;
//   facilityName: string;
//   extentDays: number;
//   status: string;
// }

// export default function ExtensionRequestDialog() {
//   const [open, setOpen] = useState(false);
//   const [requests, setRequests] = useState<ExtensionRequest[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [updatingId, setUpdatingId] = useState<string | null>(null);

//   useEffect(() => {
//     if (open) {
//       fetchExtensionRequests();
//     }
//   }, [open]);

//   const fetchExtensionRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/startup/extent-booking");
//       const data = await res.json();
//       if (Array.isArray(data)) {
//         // setRequests(data.filter((r) => r.status === "pending"));
//          setRequests(data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch extension requests", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
//     setUpdatingId(id);
//     try {
//       const res = await fetch(`/api/startup/extent-booking/${id}`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ status })
//       });

//       if (!res.ok) {
//         throw new Error("Failed to update status");
//       }

//       // Remove from local list
//       setRequests((prev) => prev.filter((req) => req._id !== id));
//       fetchExtensionRequests();
//       toast.success(`Extension ${status}`);
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Failed to update request");
//     } finally {
//       setUpdatingId(null);
//     }
//   };
// const hasPending = requests.some((r) => r.status === "pending");
// const pendingCount = requests.filter((r) => r.status === "pending").length;
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//       <DialogTrigger asChild>
//   <Button
//     className={`relative bg-blue-500 hover:bg-blue-600 h-10 flex items-center gap-2 ${
//       hasPending ? "animate-pulse" : ""
//     }`}
//   >
//     <Clock className="w-4 h-4" />
//     Extension Requests

//     {pendingCount > 0 && (
//       <span className="absolute -top-1 -right-2 text-xs px-1.5 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
//         {pendingCount}
//       </span>
//     )}
//   </Button>
// </DialogTrigger>

    
//       </DialogTrigger>
//       <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl">Extension Requests</DialogTitle>
//         </DialogHeader>

//         {loading ? (
//           <p className="text-center text-sm text-gray-500 py-6">Loading...</p>
//         ) : requests.length > 0 ? (
//           <div className="space-y-4">
           
//           {requests.map((req) => (
//   <div
//     key={req._id}
//     className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-2"
//   >
//     <div className="flex items-center justify-between">
//       <p className="text-gray-800">
//         <strong>{req.startupName}</strong> requested{" "}
//         <strong>{req.extentDays}</strong> day(s) extension for{" "}
//         <strong>{req.facilityName}</strong>.
//       </p>
//       <span
//         className={`text-xs font-medium px-2 py-1 rounded ${
//           req.status === "approved"
//             ? "bg-green-100 text-green-700"
//             : req.status === "rejected"
//             ? "bg-red-100 text-red-700"
//             : "bg-yellow-100 text-yellow-700"
//         }`}
//       >
//         {req.status}
//       </span>
//     </div>

//     {req.status === "pending" && (
//       <div className="flex gap-4 pt-2">
//         <Button
//           variant="outline"
//           className="text-green-700 border-green-500 hover:bg-green-100"
//           disabled={updatingId === req._id}
//           onClick={() => handleStatusUpdate(req._id, "approved")}
//         >
//           <CheckCircle className="w-4 h-4 mr-2" />
//           Approve
//         </Button>
//         <Button
//           variant="outline"
//           className="text-red-700 border-red-500 hover:bg-red-100"
//           disabled={updatingId === req._id}
//           onClick={() => handleStatusUpdate(req._id, "rejected")}
//         >
//           <XCircle className="w-4 h-4 mr-2" />
//           Reject
//         </Button>
//       </div>
//     )}
//   </div>
// ))}


            
//           </div>
//         ) : (
//           <p className="text-center text-sm text-gray-500 py-6">
//             No pending extension requests.
//           </p>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }


'use client';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ExtensionRequest {
  _id: string;
  startupName: string;
  facilityName: string;
  extentDays: number;
  status: string;
}

export default function ExtensionRequestDialog() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<ExtensionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch data initially and optionally poll
  useEffect(() => {
    fetchExtensionRequests();

    // Optional: auto-refresh every 60 seconds
    const interval = setInterval(fetchExtensionRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchExtensionRequests = async () => {
    try {
      const res = await fetch("/api/startup/extent-booking");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch extension requests", error);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/startup/extent-booking/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(`Extension ${status}`);
      fetchExtensionRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const hasPending = pendingCount > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`relative bg-blue-500 hover:bg-blue-600 h-10 flex items-center gap-2 ${
            hasPending ? "animate-pulse" : ""
          }`}
        >
          <Clock className="w-4 h-4" />
          Extension Requests

          {hasPending && (
            <span className="absolute -top-1 -right-2 text-xs px-1.5 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Extension Requests</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center text-sm text-gray-500 py-6">Loading...</p>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-800">
                    <strong>{req.startupName}</strong> requested{" "}
                    <strong>{req.extentDays}</strong> day(s) extension for{" "}
                    <strong>{req.facilityName}</strong>.
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      req.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-4 pt-2">
                    <Button
                      variant="outline"
                      className="text-green-700 border-green-500 hover:bg-green-100"
                      disabled={updatingId === req._id}
                      onClick={() => handleStatusUpdate(req._id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-700 border-red-500 hover:bg-red-100"
                      disabled={updatingId === req._id}
                      onClick={() => handleStatusUpdate(req._id, "rejected")}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 py-6">
            No extension requests.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

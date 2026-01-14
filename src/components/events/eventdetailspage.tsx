// "use client";
// import React, { useState } from "react";
// import { Calendar, Clock, MapPin, Users, Share2, Heart, ArrowLeft, CheckCircle, Award, Globe, Shield } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// // Sample event data - in real app, this would come from props or API
// const eventDetails = {
//   id: 1,
//   title: "Startup Ignite - Design Thinking Bootcamp",
//   subtitle: "Offline",
//   date: "June 20, 2025",
//   time: "10:00 Am to 6:30 Pm",
//   location: "IIT Madras Research Park, Chennai",
//   price: "FREE",
//   registrationStatus: "REGISTRATIONS ARE NOW OPEN",
//   description: "Join us for an intensive Design Thinking Bootcamp where you'll learn the fundamentals of human-centered design. This hands-on workshop will guide you through the entire design thinking process, from empathizing with users to prototyping solutions.",
//   highlights: [
//     "Learn design thinking methodologies",
//     "Hands-on workshops and activities",
//     "Network with like-minded entrepreneurs",
//     "Get mentorship from industry experts"
//   ],
//   speakers: [
//     {
//       id: 1,
//       name: "Dr. Arun Sundararajan",
//       title: "Professor, Stern School of Business",
//       image: "/speakers/speaker1.jpg"
//     },
//     {
//       id: 2,
//       name: "Ms. Priya Nair",
//       title: "Design Lead, Google",
//       image: "/speakers/speaker2.jpg"
//     },
//     {
//       id: 3,
//       name: "Mr. Rahul Sharma",
//       title: "Startup Mentor",
//       image: "/speakers/speaker3.jpg"
//     }
//   ],
//   agenda: [
//     { time: "10:00 AM", activity: "Registration & Welcome Coffee" },
//     { time: "10:30 AM", activity: "Introduction to Design Thinking" },
//     { time: "12:00 PM", activity: "Workshop Session 1: Empathize & Define" },
//     { time: "1:00 PM", activity: "Networking Lunch" },
//     { time: "2:00 PM", activity: "Workshop Session 2: Ideate & Prototype" },
//     { time: "4:00 PM", activity: "Coffee Break" },
//     { time: "4:30 PM", activity: "Presentation & Feedback" },
//     { time: "6:00 PM", activity: "Closing Remarks & Next Steps" }
//   ],
//   terms: [
//     "Entry registration for bootcamp/event is mandatory",
//     "You can register multiple events at same time",
//     "Refreshments will be provided during the event",
//     "Certificates will be provided at the end",
//     "Registration is simple and easy & takes only few minutes"
//   ],
//   networking: [
//     "An opportunity to connect with like-minded entrepreneurs",
//     "Meet industry experts and potential collaborators",
//     "Build lasting professional relationships",
//     "Exchange ideas and get valuable feedback"
//   ],
//   registration: [
//     "Register online at www.startupignite.com/register",
//     "Fill out the complete registration form",
//     "Receive email confirmation within 24 hours",
//     "Check-in at the venue on event day"
//   ]
// };

// const EventDetailPage = () => {
//   const [isLiked, setIsLiked] = useState(false);
//   const [registrationData, setRegistrationData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     organization: ''
//   });

//   const handleRegistration = () => {
//     // Handle registration logic here
//    // console.log('Registration data:', registrationData);
//     alert('Registration successful! You will receive a confirmation email shortly.');
//   };

//   const handleInputChange = (field: string, value: string) => {
//     setRegistrationData({
//       ...registrationData,
//       [field]: value
//     });
//   };

//   const handleShare = () => {
//     const shareUrl = window.location.href;
//     if (navigator.clipboard) {
//       navigator.clipboard.writeText(shareUrl);
//       alert("Event link copied to clipboard!");
//     } else {
//       window.prompt("Copy this link:", shareUrl);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="relative">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-800 to-blue-900">
//           <div className="absolute inset-0 bg-black/40" />
//         </div>
        
//         {/* Navigation */}
//         <div className="relative z-20 p-6">
//           <Button variant="ghost" className="text-white hover:bg-white/20 mb-8">
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Events
//           </Button>
//         </div>

//         {/* Hero Content */}
//         <div className="relative z-20 px-6 pb-16">
//           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
//             {/* Left Content */}
//             <div className="text-white">
//               <div className="mb-6">
//                 <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
//                   {eventDetails.registrationStatus}
//                 </span>
//               </div>
              
//               <h1 className="text-4xl lg:text-5xl font-bold mb-4">
//                 {eventDetails.title}
//               </h1>
//               <p className="text-xl text-purple-200 mb-8">
//                 {eventDetails.subtitle}
//               </p>

//               {/* Event Details */}
//               <div className="space-y-4 mb-8">
//                 <div className="flex items-center text-white/90">
//                   <Calendar className="w-5 h-5 mr-3" />
//                   <span>{eventDetails.date}</span>
//                 </div>
//                 <div className="flex items-center text-white/90">
//                   <Clock className="w-5 h-5 mr-3" />
//                   <span>{eventDetails.time}</span>
//                 </div>
//                 <div className="flex items-center text-white/90">
//                   <MapPin className="w-5 h-5 mr-3" />
//                   <span>{eventDetails.location}</span>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-4">
//                 <Button 
//                   onClick={handleShare}
//                   variant="outline" 
//                   className="bg-white/10 border-white/30 text-white hover:bg-white/20"
//                 >
//                   <Share2 className="w-4 h-4 mr-2" />
//                   Share
//                 </Button>
//                 <Button 
//                   onClick={() => setIsLiked(!isLiked)}
//                   variant="outline" 
//                   className="bg-white/10 border-white/30 text-white hover:bg-white/20"
//                 >
//                   <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
//                   {isLiked ? 'Liked' : 'Like'}
//                 </Button>
//               </div>
//             </div>

//             {/* Right Content - Registration Form */}
//             <div className="bg-white rounded-2xl p-8 shadow-2xl">
//               <div className="text-center mb-6">
//                 <div className="text-3xl font-bold text-green-600 mb-2">
//                   {eventDetails.price}
//                 </div>
//                 <p className="text-gray-600">Registration Fee</p>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <Input
//                     placeholder="Full Name *"
//                     value={registrationData.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     type="email"
//                     placeholder="Email Address *"
//                     value={registrationData.email}
//                     onChange={(e) => handleInputChange('email', e.target.value)}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     type="tel"
//                     placeholder="Phone Number *"
//                     value={registrationData.phone}
//                     onChange={(e) => handleInputChange('phone', e.target.value)}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                   />
//                 </div>
//                 <div>
//                   <Input
//                     placeholder="Organization/Company"
//                     value={registrationData.organization}
//                     onChange={(e) => handleInputChange('organization', e.target.value)}
//                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                   />
//                 </div>
                
//                 <Button 
//                   onClick={handleRegistration}
//                   className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg"
//                 >
//                   Register Now
//                 </Button>
//               </div>

//               <p className="text-xs text-gray-500 mt-4 text-center">
//                 By registering, you agree to our terms and conditions
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-12">
//         <div className="grid lg:grid-cols-3 gap-12">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2 space-y-12">
//             {/* Event Information */}
//             <div className="bg-white rounded-xl p-8 shadow-sm">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Information</h2>
//               <p className="text-gray-600 leading-relaxed mb-6">
//                 {eventDetails.description}
//               </p>
              
//               <div className="grid md:grid-cols-2 gap-6">
//                 {eventDetails.highlights.map((highlight, index) => (
//                   <div key={index} className="flex items-start">
//                     <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
//                     <span className="text-gray-700">{highlight}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Agenda */}
//             <div className="bg-white rounded-xl p-8 shadow-sm">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Agenda</h2>
//               <div className="space-y-4">
//                 {eventDetails.agenda.map((item, index) => (
//                   <div key={index} className="flex items-start border-l-2 border-green-500 pl-6 pb-4">
//                     <div className="min-w-0 flex-1">
//                       <div className="text-sm font-medium text-green-600 mb-1">
//                         {item.time}
//                       </div>
//                       <div className="text-gray-900 font-medium">
//                         {item.activity}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Chief Guest */}
//             <div className="bg-white rounded-xl p-8 shadow-sm">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Chief Guest</h2>
//               <div className="grid md:grid-cols-3 gap-6">
//                 {eventDetails.speakers.map((speaker) => (
//                   <div key={speaker.id} className="text-center">
//                     <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4">
//                       <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
//                         <span className="text-white font-bold text-xl">
//                           {speaker.name.split(' ').map(n => n[0]).join('')}
//                         </span>
//                       </div>
//                     </div>
//                     <h3 className="font-semibold text-gray-900 mb-1">{speaker.name}</h3>
//                     <p className="text-sm text-gray-600">{speaker.title}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Terms & Conditions */}
//             <div className="bg-white rounded-xl p-8 shadow-sm">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
//               <ul className="space-y-3">
//                 {eventDetails.terms.map((term, index) => (
//                   <li key={index} className="flex items-start">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
//                     <span className="text-gray-700">{term}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-8">
//             {/* Quick Info */}
//             <div className="bg-white rounded-xl p-6 shadow-sm">
//               <h3 className="font-bold text-gray-900 mb-4">What You Get?</h3>
//               <div className="space-y-4">
//                 <div className="flex items-center">
//                   <Award className="w-5 h-5 text-green-500 mr-3" />
//                   <span className="text-sm text-gray-700">Certificate of Completion</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Users className="w-5 h-5 text-green-500 mr-3" />
//                   <span className="text-sm text-gray-700">Networking Opportunities</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Globe className="w-5 h-5 text-green-500 mr-3" />
//                   <span className="text-sm text-gray-700">Industry Insights</span>
//                 </div>
//                 <div className="flex items-center">
//                   <Shield className="w-5 h-5 text-green-500 mr-3" />
//                   <span className="text-sm text-gray-700">Expert Mentorship</span>
//                 </div>
//               </div>
//             </div>

//             {/* Connections & Networking */}
//             <div className="bg-white rounded-xl p-6 shadow-sm">
//               <h3 className="font-bold text-gray-900 mb-4">Connections & Networking</h3>
//               <ul className="space-y-2">
//                 {eventDetails.networking.map((item, index) => (
//                   <li key={index} className="text-sm text-gray-700 flex items-start">
//                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0" />
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Registration & Participation */}
//             <div className="bg-white rounded-xl p-6 shadow-sm">
//               <h3 className="font-bold text-gray-900 mb-4">Registration & Participation</h3>
//               <ul className="space-y-2">
//                 {eventDetails.registration.map((step, index) => (
//                   <li key={index} className="text-sm text-gray-700 flex items-start">
//                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0" />
//                     {step}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Event Stats */}
//             <div className="bg-white rounded-xl p-6 shadow-sm">
//               <h3 className="font-bold text-gray-900 mb-4">Event Stats</h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Expected Attendees</span>
//                   <span className="font-semibold text-gray-900">150+</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Duration</span>
//                   <span className="font-semibold text-gray-900">8.5 Hours</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Event Type</span>
//                   <span className="font-semibold text-gray-900">Offline</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Language</span>
//                   <span className="font-semibold text-gray-900">English</span>
//                 </div>
//               </div>
//             </div>

//             {/* Organizer Info */}
//             <div className="bg-white rounded-xl p-6 shadow-sm">
//               <h3 className="font-bold text-gray-900 mb-4">Organized By</h3>
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
//                   <span className="text-white font-bold">SI</span>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900">Startup Ignite</h4>
//                   <p className="text-sm text-gray-600">Event Organizer</p>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-600 mb-4">
//                 Startup Ignite is a leading platform for entrepreneurs and innovators, 
//                 organizing impactful events and workshops.
//               </p>
//               <Button variant="outline" className="w-full">
//                 View Profile
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Related Events Section */}
//         <div className="mt-16">
//           <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Events</h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
//                 <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-600"></div>
//                 <div className="p-6">
//                   <h3 className="font-semibold text-gray-900 mb-2">
//                     Related Workshop {i}
//                   </h3>
//                   <div className="flex items-center text-gray-600 mb-2">
//                     <Calendar className="w-4 h-4 mr-2" />
//                     <span className="text-sm">June {20 + i}, 2025</span>
//                   </div>
//                   <div className="flex items-center text-gray-600 mb-4">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     <span className="text-sm">Chennai</span>
//                   </div>
//                   <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
//                     View Details
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Floating Registration Button for Mobile */}
//       <div className="fixed bottom-6 left-6 right-6 lg:hidden z-50">
//         <Button 
//           onClick={handleRegistration}
//           className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-4 rounded-xl shadow-lg"
//         >
//           Register Now - FREE
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EventDetailPage;
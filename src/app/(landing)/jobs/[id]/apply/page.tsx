// "use client";
// import { useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import axios from "axios";
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   Briefcase,
//   GraduationCap,
//   Upload,
//   FileText,
//   Linkedin,
//   Github,
//   Globe,
//   Calendar,
//   DollarSign,
//   ArrowLeft,
//   CheckCircle,
//   X,
// } from "lucide-react";

// const JobApplicationForm = () => {
//   const { id } = useParams();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const [formData, setFormData] = useState({
//     jobId: id,
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "",
//     currentJobTitle: "",
//     currentCompany: "",
//     totalExperience: "",
//     expectedSalary: "",
//     noticePeriod: "",
//     availableStartDate: "",
//     highestEducation: "",
//     university: "",
//     graduationYear: "",
//     linkedinUrl: "",
//     portfolioUrl: "",
//     githubUrl: "",
//     howDidYouHear: "",
//     willingToRelocate: "",
//     coverLetter: "",
//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "resume" | "coverLetter"
//   ) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       const allowedTypes = [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ];

//       if (file.size > maxSize) {
//         setErrors((prev) => ({
//           ...prev,
//           [type]: "File size must be less than 5MB",
//         }));
//         return;
//       }

//       if (!allowedTypes.includes(file.type)) {
//         setErrors((prev) => ({
//           ...prev,
//           [type]: "Only PDF, DOC, and DOCX files are allowed",
//         }));
//         return;
//       }

//       if (type === "resume") {
//         setResumeFile(file);
//         setErrors((prev) => ({ ...prev, resume: "" }));
//       } else {
//         setCoverLetterFile(file);
//         setErrors((prev) => ({ ...prev, coverLetter: "" }));
//       }
//     }
//   };

//   const removeFile = (type: "resume" | "coverLetter") => {
//     if (type === "resume") {
//       setResumeFile(null);
//     } else {
//       setCoverLetterFile(null);
//     }
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.firstName.trim())
//       newErrors.firstName = "First name is required";
//     if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
//     if (!formData.email.trim()) newErrors.email = "Email is required";
//     else if (!/^\S+@\S+\.\S+$/.test(formData.email))
//       newErrors.email = "Invalid email format";
//     if (!formData.phone.trim()) newErrors.phone = "Phone is required";
//     if (!formData.totalExperience.trim())
//       newErrors.totalExperience = "Experience is required";
//     if (!formData.highestEducation)
//       newErrors.highestEducation = "Education is required";
//     if (!resumeFile) newErrors.resume = "Resume is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     setLoading(true);

//     try {
//       const formDataToSend = new FormData();

//       Object.entries(formData).forEach(([key, value]) => {
//         if (value !== undefined) {
//           formDataToSend.append(
//             key,
//             Array.isArray(value) ? value.join(", ") : value
//           );
//         }
//       });

//       if (resumeFile) {
//         formDataToSend.append("resume", resumeFile);
//       }
//       if (coverLetterFile) {
//         formDataToSend.append("coverLetterFile", coverLetterFile);
//       }

//       await axios.post(
//         `https://api.cumma.in/api/applications`,
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setSubmitted(true);
//       setTimeout(() => {
//         router.push(`/jobs/${id}`);
//       }, 3000);
//     }  catch (error) {
//   if (axios.isAxiosError(error)) {
//     console.error("Error submitting application:", error);
//     const errorMessage =
//       error.response?.data?.message || "Failed to submit application. Please try again.";
//     alert(errorMessage);
//   } else {
//     console.error("Unexpected error:", error);
//     alert("An unexpected error occurred. Please try again.");
//   }
// }}

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle className="w-10 h-10 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Application Submitted!
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Thank you for applying. We'll review your application and get back
//             to you soon.
//           </p>
//           <p className="text-sm text-gray-500">Redirecting...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => router.back()}
//           type="button"
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Job Details
//         </button>

//         <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Submit Your Application
//           </h1>
//           <p className="text-gray-600 mb-8">
//             Fill in the details below to apply for this position
//           </p>

//           <div className="space-y-8">
//             {/* Personal Information */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-green-600" />
//                 Personal Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     First Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="firstName"
//                     value={formData.firstName}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border ${errors.firstName ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   />
//                   {errors.firstName && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.firstName}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Last Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="lastName"
//                     value={formData.lastName}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border ${errors.lastName ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   />
//                   {errors.lastName && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.lastName}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number *
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   />
//                   {errors.phone && (
//                     <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//                   )}
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Address
//                   </label>
//                   <input
//                     type="text"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     State/Province
//                   </label>
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     ZIP/Postal Code
//                   </label>
//                   <input
//                     type="text"
//                     name="zipCode"
//                     value={formData.zipCode}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Country
//                   </label>
//                   <input
//                     type="text"
//                     name="country"
//                     value={formData.country}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Professional Information */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Briefcase className="w-5 h-5 text-green-600" />
//                 Professional Information
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Current Job Title
//                   </label>
//                   <input
//                     type="text"
//                     name="currentJobTitle"
//                     value={formData.currentJobTitle}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Current Company
//                   </label>
//                   <input
//                     type="text"
//                     name="currentCompany"
//                     value={formData.currentCompany}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Total Experience (Years) *
//                   </label>
//                   <input
//                     type="text"
//                     name="totalExperience"
//                     value={formData.totalExperience}
//                     onChange={handleInputChange}
//                     placeholder="e.g., 3-5 years"
//                     className={`w-full px-4 py-3 border ${errors.totalExperience ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   />
//                   {errors.totalExperience && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.totalExperience}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Expected Salary
//                   </label>
//                   <input
//                     type="text"
//                     name="expectedSalary"
//                     value={formData.expectedSalary}
//                     onChange={handleInputChange}
//                     placeholder="e.g., $80,000"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Notice Period
//                   </label>
//                   <select
//                     name="noticePeriod"
//                     value={formData.noticePeriod}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   >
//                     <option value="">Select...</option>
//                     <option value="Immediate">Immediate</option>
//                     <option value="15 Days">15 Days</option>
//                     <option value="1 Month">1 Month</option>
//                     <option value="2 Months">2 Months</option>
//                     <option value="3 Months">3 Months</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Start Date
//                   </label>
//                   <input
//                     type="date"
//                     name="availableStartDate"
//                     value={formData.availableStartDate}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Education */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <GraduationCap className="w-5 h-5 text-green-600" />
//                 Education
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Highest Education *
//                   </label>
//                   <select
//                     name="highestEducation"
//                     value={formData.highestEducation}
//                     onChange={handleInputChange}
//                     className={`w-full px-4 py-3 border ${errors.highestEducation ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
//                   >
//                     <option value="">Select...</option>
//                     <option value="High School">High School</option>
//                     <option value="Associate Degree">Associate Degree</option>
//                     <option value="Bachelor's Degree">Bachelor's Degree</option>
//                     <option value="Master's Degree">Master's Degree</option>
//                     <option value="Doctorate">Doctorate</option>
//                   </select>
//                   {errors.highestEducation && (
//                     <p className="text-red-500 text-sm mt-1">
//                       {errors.highestEducation}
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     University/Institution
//                   </label>
//                   <input
//                     type="text"
//                     name="university"
//                     value={formData.university}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Graduation Year
//                   </label>
//                   <input
//                     type="text"
//                     name="graduationYear"
//                     value={formData.graduationYear}
//                     onChange={handleInputChange}
//                     placeholder="e.g., 2020"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Documents */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <FileText className="w-5 h-5 text-green-600" />
//                 Documents
//               </h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Resume/CV * (PDF, DOC, DOCX - Max 5MB)
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       onChange={(e) => handleFileChange(e, "resume")}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600 file:font-medium hover:file:bg-green-100"
//                     />
//                   </div>
//                   {resumeFile && (
//                     <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
//                       <p className="text-sm text-green-600 flex items-center gap-2">
//                         <Upload className="w-4 h-4" />
//                         {resumeFile.name}
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => removeFile("resume")}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                   {errors.resume && (
//                     <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cover Letter (Optional - PDF, DOC, DOCX)
//                   </label>
//                   <input
//                     type="file"
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => handleFileChange(e, "coverLetter")}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600 file:font-medium hover:file:bg-green-100"
//                   />
//                   {coverLetterFile && (
//                     <div className="flex items-center justify-between mt-2 p-2 bg-green-50 rounded-lg">
//                       <p className="text-sm text-green-600 flex items-center gap-2">
//                         <Upload className="w-4 h-4" />
//                         {coverLetterFile.name}
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => removeFile("coverLetter")}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Cover Letter Text */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Cover Letter (Text)
//               </label>
//               <textarea
//                 name="coverLetter"
//                 value={formData.coverLetter}
//                 onChange={handleInputChange}
//                 rows={6}
//                 placeholder="Tell us why you're a great fit for this position..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
//               />
//             </div>

//             {/* Additional Links */}
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Globe className="w-5 h-5 text-green-600" />
//                 Additional Links
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <Linkedin className="w-4 h-4" />
//                     LinkedIn Profile
//                   </label>
//                   <input
//                     type="url"
//                     name="linkedinUrl"
//                     value={formData.linkedinUrl}
//                     onChange={handleInputChange}
//                     placeholder="https://linkedin.com/in/..."
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <Github className="w-4 h-4" />
//                     GitHub Profile
//                   </label>
//                   <input
//                     type="url"
//                     name="githubUrl"
//                     value={formData.githubUrl}
//                     onChange={handleInputChange}
//                     placeholder="https://github.com/..."
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Portfolio Website
//                   </label>
//                   <input
//                     type="url"
//                     name="portfolioUrl"
//                     value={formData.portfolioUrl}
//                     onChange={handleInputChange}
//                     placeholder="https://..."
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Questions */}
//             <div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     How did you hear about us?
//                   </label>
//                   <select
//                     name="howDidYouHear"
//                     value={formData.howDidYouHear}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   >
//                     <option value="">Select...</option>
//                     <option value="LinkedIn">LinkedIn</option>
//                     <option value="Company Website">Company Website</option>
//                     <option value="Job Board">Job Board</option>
//                     <option value="Referral">Referral</option>
//                     <option value="Social Media">Social Media</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Willing to Relocate?
//                   </label>
//                   <select
//                     name="willingToRelocate"
//                     value={formData.willingToRelocate}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   >
//                     <option value="">Select...</option>
//                     <option value="Yes">Yes</option>
//                     <option value="No">No</option>
//                     <option value="Maybe">Maybe</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex gap-4 pt-6">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
//               >
//                 {loading ? "Submitting..." : "Submit Application"}
//                 {!loading && <Upload className="w-5 h-5" />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobApplicationForm;
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Job {
  title: string;
  _id: string;
  zohoJobId?: string;
}

const ApplyPage = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`https://api.cumma.in/api/jobs/${id}`)
      .then((res) => {
        setJob(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching job:", err);
        setLoading(false);
      });
  }, [id]);

  // Zoho Career Site Job URL
  // This URL already links the application to the specific job in Zoho
  const zohoCareerJobUrl = job?.zohoJobId
    ? `https://cumma.zohorecruit.in/jobs/Careers/${job.zohoJobId}/${job.title?.replace(/\s+/g, "-")}`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 flex items-center justify-center">
        <p className="text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job || !job.zohoJobId) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Job details not found</p>
        <button
          onClick={() => router.push("/careers")}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Apply for: {job.title}
            </h1>
            <p className="text-gray-600">
              Click below to open the official application form
            </p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-700 mb-6">
            You will be taken to Zoho Recruit's official application form where you can:
          </p>
          <ul className="text-left text-gray-600 mb-8 max-w-md mx-auto space-y-2">
            <li>✓ Upload your resume and cover letter</li>
            <li>✓ Add photo and other documents</li>
            <li>✓ View complete job details</li>
            <li>✓ Submit your application securely</li>
          </ul>
          
          <a
            href={zohoCareerJobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Open Application Form
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> Your application will be automatically linked to the {job.title} position in our system. You will receive updates about your application status via email.
          </p>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your information will be sent securely to our recruitment system</p>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;

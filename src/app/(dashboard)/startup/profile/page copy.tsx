// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { ProfilePicture } from "@/components/ui/profile-picture";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ENTITY_TYPES, SECTORS, LOOKING_FOR } from "@/lib/constants";
// import { INDUSTRIES, STAGES_COMPLETED } from "@/lib/constants/dropdowns";
// import { toast } from "sonner";
// import { AlertCircle, Info } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import { UserCircle } from "lucide-react";
// interface StartupProfile {
//   startupName: string | null;
//   contactName: string | null;
//   contactNumber: string | null;
//   founderName: string | null;
//   founderDesignation: string | null;
//   entityType: string | null;
//   teamSize: number | null;
//   dpiitNumber: string | null;
//   cin: string | null;
//   gstnumber: string | null;
//   secondarycontactname: string | null;
//   secondarycontactdesignation: string | null;
//   secondarycontactnumber: string | null;
//   sector: string | null;
//   industry: string | null;
//   stagecompleted: string | null;
//   startupMailId: string | null;
//   website: string | null;
//   linkedinStartupUrl: string | null;
//   linkedinFounderUrl: string | null;
//   instagramurl: string | null;
//   twitterurl: string | null;
//   lookingFor: string[] | null;
//   address: string | null;
//   city: string | null;
//   state: string | null;
//   pincode: string | null;
//   country: string | null;
//   category: string | null;
//   logoUrl: string | null;
//   bankName: string | null;
//   accountNumber: string | null;
//   ifscCode: string | null;
// }

// export default function StartupProfile() {
//   const { data: session } = useSession();
//   const [profile, setProfile] = useState<StartupProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [completionPercentage, setCompletionPercentage] = useState(0);
//   const [incompleteFields, setIncompleteFields] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch("/api/startup/profile");
//         if (!response.ok) throw new Error("Failed to fetch profile");
//         const data = await response.json();
//         setProfile(data);
//         calculateProfileCompletion(data);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         toast.error("Failed to load profile");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const calculateProfileCompletion = (profileData: StartupProfile) => {
//     const requiredFields = [
//       { name: "Logo", value: profileData.logoUrl },
//       { name: "Startup Name", value: profileData.startupName },
//       { name: "Entity Type", value: profileData.entityType },
//       { name: "Team Size", value: profileData.teamSize },
//       { name: "Contact Name", value: profileData.contactName },
//       { name: "Contact Number", value: profileData.contactNumber },
//       { name: "Founder Name", value: profileData.founderName },
//       { name: "Founder Designation", value: profileData.founderDesignation },
//       { name: "Startup Email", value: profileData.startupMailId },
//       { name: "Address", value: profileData.address },
//       { name: "City", value: profileData.city },
//       { name: "State", value: profileData.state },
//       { name: "Pincode", value: profileData.pincode },
//       { name: "Country", value: profileData.country },
//       { name: "Website", value: profileData.website },
//       { name: "LinkedIn Company URL", value: profileData.linkedinStartupUrl },
//       { name: "Founder LinkedIn URL", value: profileData.linkedinFounderUrl },
//       { name: "Instagram URL", value: profileData.instagramurl },
//       { name: "Twitter URL", value: profileData.twitterurl },
//       { name: "Industry", value: profileData.industry },
//       { name: "Sector", value: profileData.sector },
//       { name: "Category", value: profileData.category },
//       { name: "Stage Completed", value: profileData.stagecompleted },
//       { name: "DPIIT Number", value: profileData.dpiitNumber },
//       { name: "CIN", value: profileData.cin },
//       { name: "GST Number", value: profileData.gstnumber },
//       {
//         name: "Secondary Contact Name",
//         value: profileData.secondarycontactname,
//       },
//       {
//         name: "Secondary Contact Designation",
//         value: profileData.secondarycontactdesignation,
//       },
//       {
//         name: "Secondary Contact Number",
//         value: profileData.secondarycontactnumber,
//       },
//     ];

//     const filledFields = requiredFields.filter(
//       (field) =>
//         field.value !== null && field.value !== undefined && field.value !== ""
//     ).length;

//     const percentage = Math.round((filledFields / requiredFields.length) * 100);
//     setCompletionPercentage(percentage);

//     const incomplete = requiredFields
//       .filter((field) => !field.value)
//       .map((field) => field.name);
//     setIncompleteFields(incomplete);
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//   };

//   const handleSave = async (formData: StartupProfile) => {
//     try {
//       const response = await fetch("/api/startup/profile", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error("Failed to update profile");

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile);
//       calculateProfileCompletion(updatedProfile);
//       setIsEditing(false);
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("Failed to update profile");
//     }
//   };

//   const handleLookingForChange = (option: string) => {
//     if (!profile) return;

//     const currentLookingFor = profile.lookingFor || [];
//     const updatedLookingFor = currentLookingFor.includes(option)
//       ? currentLookingFor.filter((item) => item !== option)
//       : [...currentLookingFor, option];

//     setProfile({ ...profile, lookingFor: updatedLookingFor });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <p className="text-muted-foreground">Profile not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold">My Profile</h1>
//           <p className="mt-2 text-sm text-muted-foreground">
//             Manage your startup profile and settings
//           </p>
//         </div>
//         {!isEditing && <Button onClick={handleEdit}>Edit Profile</Button>}
//       </div>

//       {completionPercentage < 100 && (
//         <Card className="border-amber-200 bg-amber-50">
//           <CardContent className="pt-6">
//             <div className="flex items-start gap-4">
//               <Info className="h-5 w-5 text-amber-500 mt-0.5" />
//               <div className="space-y-2 flex-1">
//                 <div>
//                   <span className="font-medium">Complete your profile: </span>
//                   <span className="text-sm">
//                     {completionPercentage}% complete
//                   </span>
//                 </div>
//                 <Progress value={completionPercentage} className="h-2" />
//                 {incompleteFields.length > 0 && (
//                   <div className="text-sm text-muted-foreground">
//                     <p>
//                       Missing information:{" "}
//                       {incompleteFields.slice(0, 3).join(", ")}
//                       {incompleteFields.length > 3 &&
//                         ` and ${incompleteFields.length - 3} more`}
//                     </p>
//                   </div>
//                 )}
//                 <p className="text-sm text-muted-foreground">
//                   A complete profile helps you connect better with Facility
//                   Partners and access more resources.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid grid-cols-4 w-full">
//           <TabsTrigger value="profile">Basic Info</TabsTrigger>
//           <TabsTrigger value="business">Business Details</TabsTrigger>
//           <TabsTrigger value="social">Social & Contact</TabsTrigger>
//           <TabsTrigger value="preferences">Preferences</TabsTrigger>
//         </TabsList>

//         <TabsContent value="profile" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Picture</CardTitle>
//               <CardDescription>Upload your startup logo</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-col items-center space-y-4">
//                 <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gray-200">
//                   {isEditing ? (
//                     <ProfilePicture
//                       imageUrl={profile.logoUrl}
//                       size={128}
//                       isEditing={isEditing}
//                       onImageChange={(urls) => {
//                         const newLogoUrl = urls[0];
//                         const updatedProfile = {
//                           ...profile,
//                           logoUrl: newLogoUrl,
//                         };

//                         setProfile(updatedProfile); // update UI immediately
//                         handleSave(updatedProfile); // send correct logoUrl in PATCH payload
//                       }}
//                       onImageRemove={() => {
//                         const updatedProfile = { ...profile, logoUrl: null };

//                         setProfile(updatedProfile);
//                         handleSave(updatedProfile);
//                       }}
//                       className="w-full h-full"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-muted flex items-center justify-center">
//                       {profile.logoUrl ? (
//                         <img
//                           src={profile.logoUrl}
//                           alt="Startup Logo"
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <UserCircle className="w-3/4 h-3/4 text-muted-foreground" />
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-center space-y-1">
//                   <h4 className="text-sm font-medium">Startup Logo</h4>
//                   <p className="text-sm text-muted-foreground">
//                     This will be displayed on your profile and in search
//                     results.
//                   </p>
//                   {isEditing && (
//                     <p className="text-xs text-muted-foreground">
//                       Upload a square image (1:1 ratio) for best results.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Startup Name</Label>
//                   <Input
//                     value={profile.startupName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, startupName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter startup name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Entity Type</Label>
//                   <Select
//                     value={profile.entityType || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, entityType: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select entity type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {ENTITY_TYPES.map((type) => (
//                         <SelectItem key={type} value={type}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Team Size</Label>
//                   <Input
//                     type="number"
//                     value={profile.teamSize?.toString() || ""}
//                     disabled={!isEditing}
//                     onChange={(e) => {
//                       const value = e.target.value
//                         ? parseInt(e.target.value)
//                         : null;
//                       setProfile({ ...profile, teamSize: value });
//                     }}
//                     placeholder={isEditing ? "Enter team size" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>DPIIT Number</Label>
//                   <Input
//                     value={profile.dpiitNumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, dpiitNumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter DPIIT number" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>CIN</Label>
//                   <Input
//                     value={profile.cin || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, cin: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter CIN" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>GST Number</Label>
//                   <Input
//                     value={profile.gstnumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, gstnumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter GST number" : "Not provided"
//                     }
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Bank Name</Label>
//                   <Input
//                     value={profile.bankName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, bankName: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter bank name" : "Not provided"}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Account Number</Label>
//                   <Input
//                     value={profile.accountNumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, accountNumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter account number" : "Not provided"
//                     }
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>IFSC Code</Label>
//                   <Input
//                     value={profile.ifscCode || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, ifscCode: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter IFSC code" : "Not provided"}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Founder Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Founder Name</Label>
//                   <Input
//                     value={profile.founderName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, founderName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter founder name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Founder Designation</Label>
//                   <Input
//                     value={profile.founderDesignation || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         founderDesignation: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing ? "Enter founder designation" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="business" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Business Classification</CardTitle>
//               <CardDescription>Industry and sector information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Industry</Label>
//                   <Select
//                     value={profile.industry || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, industry: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select industry" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {INDUSTRIES.map((industry) => (
//                         <SelectItem key={industry} value={industry}>
//                           {industry}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Sector</Label>
//                   <Select
//                     value={profile.sector || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, sector: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select sector" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {SECTORS.map((sector) => (
//                         <SelectItem key={sector} value={sector}>
//                           {sector}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Stage Completed</Label>
//                   <Select
//                     value={profile.stagecompleted || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, stagecompleted: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select stage completed" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {STAGES_COMPLETED.map((stage) => (
//                         <SelectItem key={stage} value={stage}>
//                           {stage}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Category</Label>
//                   <Input
//                     value={profile.category || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, category: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter category" : "Not provided"}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Address Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Address</Label>
//                   <Input
//                     value={profile.address || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, address: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter address" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>City</Label>
//                   <Input
//                     value={profile.city || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, city: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter city" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>State</Label>
//                   <Input
//                     value={profile.state || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, state: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter state" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Pincode</Label>
//                   <Input
//                     value={profile.pincode || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, pincode: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter pincode" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Country</Label>
//                   <Input
//                     value={profile.country || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, country: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter country" : "Not provided"}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="social" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Contact Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Contact Name</Label>
//                   <Input
//                     value={profile.contactName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, contactName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter contact name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Contact Number</Label>
//                   <Input
//                     value={profile.contactNumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, contactNumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter contact number" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Name</Label>
//                   <Input
//                     value={profile.secondarycontactname || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactname: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact name"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Designation</Label>
//                   <Input
//                     value={profile.secondarycontactdesignation || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactdesignation: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact designation"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Number</Label>
//                   <Input
//                     value={profile.secondarycontactnumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactnumber: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact number"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Startup Email</Label>
//                   <Input
//                     type="email"
//                     value={profile.startupMailId || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, startupMailId: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter startup email" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Website</Label>
//                   <Input
//                     value={profile.website || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, website: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter website URL" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Social Links</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>LinkedIn Company URL</Label>
//                   <Input
//                     value={profile.linkedinStartupUrl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         linkedinStartupUrl: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing ? "Enter LinkedIn company URL" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Founder's LinkedIn URL</Label>
//                   <Input
//                     value={profile.linkedinFounderUrl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         linkedinFounderUrl: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter founder's LinkedIn URL"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Instagram URL</Label>
//                   <Input
//                     value={profile.instagramurl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, instagramurl: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter Instagram URL" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Twitter URL</Label>
//                   <Input
//                     value={profile.twitterurl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, twitterurl: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter Twitter URL" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="preferences" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Looking For</CardTitle>
//               <CardDescription>
//                 What facilities are you interested in?
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-muted/50 rounded-lg p-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//                   {LOOKING_FOR.map((option) => (
//                     <div key={option} className="flex items-start space-x-3">
//                       <Checkbox
//                         id={`looking-for-${option}`}
//                         checked={profile.lookingFor?.includes(option) || false}
//                         disabled={!isEditing}
//                         onCheckedChange={() =>
//                           isEditing && handleLookingForChange(option)
//                         }
//                         className="mt-0.5"
//                       />
//                       <label
//                         htmlFor={`looking-for-${option}`}
//                         className={`text-sm leading-tight ${!isEditing && "cursor-not-allowed opacity-80"}`}
//                       >
//                         {option}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 {isEditing && (
//                   <p className="text-xs text-muted-foreground mt-3">
//                     Select all that apply to your startup's needs
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//       {isEditing && (
//         <div className="flex justify-end gap-4">
//           <Button variant="outline" onClick={handleCancel}>
//             Cancel
//           </Button>
//           <Button onClick={() => handleSave(profile)}>Save Changes</Button>
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { StartupLogoSection } from "@/components/ui/StartupLogoSection";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { ENTITY_TYPES, SECTORS, LOOKING_FOR } from "@/lib/constants";
// import { INDUSTRIES, STAGES_COMPLETED } from "@/lib/constants/dropdowns";
// import { toast } from "sonner";
// import { AlertCircle, Info } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";

// interface StartupProfile {
//   startupName: string | null;
//   contactName: string | null;
//   contactNumber: string | null;
//   founderName: string | null;
//   founderDesignation: string | null;
//   entityType: string | null;
//   teamSize: number | null;
//   dpiitNumber: string | null;
//   cin: string | null;
//   gstnumber: string | null;
//   secondarycontactname: string | null;
//   secondarycontactdesignation: string | null;
//   secondarycontactnumber: string | null;
//   sector: string | null;
//   industry: string | null;
//   stagecompleted: string | null;
//   startupMailId: string | null;
//   website: string | null;
//   linkedinStartupUrl: string | null;
//   linkedinFounderUrl: string | null;
//   instagramurl: string | null;
//   twitterurl: string | null;
//   lookingFor: string[] | null;
//   address: string | null;
//   city: string | null;
//   state: string | null;
//   pincode: string | null;
//   country: string | null;
//   category: string | null;
//   logoUrl: string | null;
//   bankName: string | null;
//   accountNumber: string | number ;
//   confirmAccountNumber: string | number | null;
//   accountHolderName: string | null;
//   bankBranch: string | null;
//   ifscCode: string | null;
// }

// export default function StartupProfile() {
//   const { data: session } = useSession();
//   const [profile, setProfile] = useState<StartupProfile | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isEditing, setIsEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [completionPercentage, setCompletionPercentage] = useState(0);
//   const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
//   const [accountMismatchError, setAccountMismatchError] = useState(false);
  
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch("/api/startup/profile");
//         if (!response.ok) throw new Error("Failed to fetch profile");
//         const data = await response.json();
//         setProfile(data);
//         calculateProfileCompletion(data);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//         toast.error("Failed to load profile");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const calculateProfileCompletion = (profileData: StartupProfile) => {
//     const requiredFields = [
//       { name: "Logo", value: profileData.logoUrl },
//       { name: "Startup Name", value: profileData.startupName },
//       { name: "Entity Type", value: profileData.entityType },
//       { name: "Team Size", value: profileData.teamSize },
//       { name: "Contact Name", value: profileData.contactName },
//       { name: "Contact Number", value: profileData.contactNumber },
//       { name: "Founder Name", value: profileData.founderName },
//       { name: "Founder Designation", value: profileData.founderDesignation },
//       { name: "Startup Email", value: profileData.startupMailId },
//       { name: "Address", value: profileData.address },
//       { name: "City", value: profileData.city },
//       { name: "State", value: profileData.state },
//       { name: "Pincode", value: profileData.pincode },
//       { name: "Country", value: profileData.country },
//       { name: "Website", value: profileData.website },
//       { name: "LinkedIn Company URL", value: profileData.linkedinStartupUrl },
//       { name: "Founder LinkedIn URL", value: profileData.linkedinFounderUrl },
//       { name: "Instagram URL", value: profileData.instagramurl },
//       { name: "Twitter URL", value: profileData.twitterurl },
//       { name: "Industry", value: profileData.industry },
//       { name: "Sector", value: profileData.sector },
//       { name: "Category", value: profileData.category },
//       { name: "Stage Completed", value: profileData.stagecompleted },
//       { name: "DPIIT Number", value: profileData.dpiitNumber },
//       { name: "CIN", value: profileData.cin },
//       { name: "GST Number", value: profileData.gstnumber },
//       {
//         name: "Secondary Contact Name",
//         value: profileData.secondarycontactname,
//       },
//       {
//         name: "Secondary Contact Designation",
//         value: profileData.secondarycontactdesignation,
//       },
//       {
//         name: "Secondary Contact Number",
//         value: profileData.secondarycontactnumber,
//       },
//     ];

//     const filledFields = requiredFields.filter(
//       (field) =>
//         field.value !== null && field.value !== undefined && field.value !== ""
//     ).length;

//     const percentage = Math.round((filledFields / requiredFields.length) * 100);
//     setCompletionPercentage(percentage);

//     const incomplete = requiredFields
//       .filter((field) => !field.value)
//       .map((field) => field.name);
//     setIncompleteFields(incomplete);
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//   };

//   // Updated validation function - only validates when editing
//   const validateAccountNumbers = (formData: StartupProfile): boolean => {
//     // Only validate if user is currently editing
//     if (!isEditing) {
//       return true;
//     }

//     // If account number is provided, confirm account number must also be provided and match
//     if (formData.accountNumber && formData.accountNumber.toString().trim() !== "") {
//       if (!formData.confirmAccountNumber || formData.confirmAccountNumber.toString().trim() === "") {
//         toast.error("Please re-enter the account number to confirm");
//         setActiveTab("banking"); // Switch to banking tab to show the error
//         return false;
//       }
      
//       if (formData.accountNumber.toString() !== formData.confirmAccountNumber.toString()) {
//         toast.error("Account numbers do not match. Please verify and try again.");
//         setActiveTab("banking"); // Switch to banking tab to show the error
//         setAccountMismatchError(true);
//         return false;
//       }
//     }
    
//     // If confirm account number is provided, account number must also be provided
//     if (formData.confirmAccountNumber && formData.confirmAccountNumber.toString().trim() !== "") {
//       if (!formData.accountNumber || formData.accountNumber.toString().trim() === "") {
//         toast.error("Please enter the account number");
//         setActiveTab("banking"); // Switch to banking tab to show the error
//         return false;
//       }
//     }
    
//     return true;
//   };

//   const handleSave = async (formData: StartupProfile) => {
//     // Validate account numbers before saving
//     if (!validateAccountNumbers(formData)) {
//       return; // Stop execution if validation fails
//     }

//     try {
//       const response = await fetch("/api/startup/profile", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error("Failed to update profile");

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile);
//       calculateProfileCompletion(updatedProfile);
//       setIsEditing(false);
//       setAccountMismatchError(false); // Clear any existing error
//       toast.success("Profile updated successfully");
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       toast.error("Failed to update profile");
//     }
//   };

//   const handleLookingForChange = (option: string) => {
//     if (!profile) return;

//     const currentLookingFor = profile.lookingFor || [];
//     const updatedLookingFor = currentLookingFor.includes(option)
//       ? currentLookingFor.filter((item) => item !== option)
//       : [...currentLookingFor, option];

//     setProfile({ ...profile, lookingFor: updatedLookingFor });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <p className="text-muted-foreground">Profile not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-semibold">My Profile</h1>
//           <p className="mt-2 text-sm text-muted-foreground">
//             Manage your startup profile and settings
//           </p>
//         </div>
//         {!isEditing && <Button onClick={handleEdit}>Edit Profile</Button>}
//       </div>

//       {completionPercentage < 100 && (
//         <Card className="border-amber-200 bg-amber-50">
//           <CardContent className="pt-6">
//             <div className="flex items-start gap-4">
//               <Info className="h-5 w-5 text-amber-500 mt-0.5" />
//               <div className="space-y-2 flex-1">
//                 <div>
//                   <span className="font-medium">Complete your profile: </span>
//                   <span className="text-sm">
//                     {completionPercentage}% complete
//                   </span>
//                 </div>
//                 <Progress value={completionPercentage} className="h-2" />
//                 {incompleteFields.length > 0 && (
//                   <div className="text-sm text-muted-foreground">
//                     <p>
//                       Missing information:{" "}
//                       {incompleteFields.slice(0, 3).join(", ")}
//                       {incompleteFields.length > 3 &&
//                         ` and ${incompleteFields.length - 3} more`}
//                     </p>
//                   </div>
//                 )}
//                 <p className="text-sm text-muted-foreground">
//                   A complete profile helps you connect better with Facility
//                   Partners and access more resources.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid grid-cols-5 w-full">
//           <TabsTrigger value="profile">Basic Info</TabsTrigger>
//           <TabsTrigger value="business">Business Details</TabsTrigger>
//           <TabsTrigger value="banking">Banking Details</TabsTrigger>
//           <TabsTrigger value="social">Social & Contact</TabsTrigger>
//           <TabsTrigger value="preferences">Preferences</TabsTrigger>
//         </TabsList>

//         <TabsContent value="profile" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Picture</CardTitle>
//               <CardDescription>Upload your startup logo</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center space-x-4">
//                 <div className="relative h-32 w-32 overflow-hidden rounded-md border border-gray-200">
//                   <StartupLogoSection
//                     imageUrl={profile.logoUrl}
//                     isEditing={isEditing}
//                     onChange={(url) => handleSave({ ...profile, logoUrl: url })}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <h4 className="text-sm font-medium">Startup Logo</h4>
//                   <p className="text-sm text-muted-foreground">
//                     This will be displayed on your profile and in search
//                     results.
//                   </p>
//                   {isEditing && (
//                     <p className="text-xs text-muted-foreground">
//                       Upload a square image (1:1 ratio) for best results.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Startup Name</Label>
//                   <Input
//                     value={profile.startupName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, startupName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter startup name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Entity Type</Label>
//                   <Select
//                     value={profile.entityType || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, entityType: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select entity type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {ENTITY_TYPES.map((type) => (
//                         <SelectItem key={type} value={type}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Team Size</Label>
//                   <Input
//                     type="number"
//                     value={profile.teamSize?.toString() || ""}
//                     disabled={!isEditing}
//                     onChange={(e) => {
//                       const value = e.target.value
//                         ? parseInt(e.target.value)
//                         : null;
//                       setProfile({ ...profile, teamSize: value });
//                     }}
//                     placeholder={isEditing ? "Enter team size" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>DPIIT Number</Label>
//                   <Input
//                     value={profile.dpiitNumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, dpiitNumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter DPIIT number" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>CIN</Label>
//                   <Input
//                     value={profile.cin || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, cin: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter CIN" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>GST Number</Label>
//                   <Input
//                     value={profile.gstnumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, gstnumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter GST number" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Founder Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Founder Name</Label>
//                   <Input
//                     value={profile.founderName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, founderName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter founder name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Founder Designation</Label>
//                   <Input
//                     value={profile.founderDesignation || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         founderDesignation: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing ? "Enter founder designation" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="business" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Business Classification</CardTitle>
//               <CardDescription>Industry and sector information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Industry</Label>
//                   <Select
//                     value={profile.industry || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, industry: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select industry" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {INDUSTRIES.map((industry) => (
//                         <SelectItem key={industry} value={industry}>
//                           {industry}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Sector</Label>
//                   <Select
//                     value={profile.sector || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, sector: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select sector" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {SECTORS.map((sector) => (
//                         <SelectItem key={sector} value={sector}>
//                           {sector}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Stage Completed</Label>
//                   <Select
//                     value={profile.stagecompleted || ""}
//                     disabled={!isEditing}
//                     onValueChange={(value) =>
//                       setProfile({ ...profile, stagecompleted: value })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select stage completed" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {STAGES_COMPLETED.map((stage) => (
//                         <SelectItem key={stage} value={stage}>
//                           {stage}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Category</Label>
//                   <Input
//                     value={profile.category || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, category: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter category" : "Not provided"}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Address Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Address</Label>
//                   <Input
//                     value={profile.address || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, address: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter address" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>City</Label>
//                   <Input
//                     value={profile.city || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, city: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter city" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>State</Label>
//                   <Input
//                     value={profile.state || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, state: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter state" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Pincode</Label>
//                   <Input
//                     value={profile.pincode || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, pincode: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter pincode" : "Not provided"}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Country</Label>
//                   <Input
//                     value={profile.country || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, country: e.target.value })
//                     }
//                     placeholder={isEditing ? "Enter country" : "Not provided"}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="banking" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Banking Details</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2 mt-4">
//                 <Label>Bank Name</Label>
//                 <Input
//                   value={profile.bankName || ""}
//                   disabled={!isEditing}
//                   onChange={(e) =>
//                     setProfile({ ...profile, bankName: e.target.value })
//                   }
//                   placeholder={isEditing ? "Enter bank name" : "Not provided"}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Account Number</Label>
//                 <Input
//                   value={profile.accountNumber || ""}
//                   disabled={!isEditing}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setProfile((prev) => {
//                       if (!prev) return prev;
//                       const updated = { ...prev, accountNumber: value };
//                       setAccountMismatchError(
//                         Boolean(
//                           updated.confirmAccountNumber &&
//                           updated.confirmAccountNumber !== value
//                         )
//                       );
//                       return updated;
//                     });
//                   }}
//                   placeholder={isEditing ? "Enter account number" : "Not provided"}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Re-Enter Account Number <span className="text-red-500">*</span></Label>
//                 <Input
//                   value={profile.confirmAccountNumber || ""}
//                   disabled={!isEditing}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setProfile((prev) => {
//                       if (!prev) return prev;
//                       const updated: StartupProfile = { ...prev, confirmAccountNumber: value };
//                       setAccountMismatchError(
//                         Boolean(
//                           updated.accountNumber &&
//                           updated.confirmAccountNumber &&
//                           updated.accountNumber !== updated.confirmAccountNumber
//                         )
//                       );
//                       return updated;
//                     });
//                   }}
//                   placeholder={isEditing ? "Re-enter account number" : "Not provided"}
//                 />
//                 {isEditing && accountMismatchError && (
//                   <p className="text-sm text-red-500">Account numbers do not match.</p>
//                 )}
//                 {isEditing && profile.accountNumber && profile.accountNumber.toString().trim() !== "" && (
//                   <p className="text-xs text-muted-foreground">
//                     Required when account number is provided
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label>IFSC Code</Label>
//                 <Input
//                   value={profile.ifscCode || ""}
//                   disabled={!isEditing}
//                   onChange={(e) =>
//                     setProfile({ ...profile, ifscCode: e.target.value })
//                   }
//                   placeholder={isEditing ? "Enter IFSC code" : "Not provided"}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Account Holder Name</Label>
//                 <Input
//                   value={profile.accountHolderName || ""}
//                   disabled={!isEditing}
//                   onChange={(e) =>
//                     setProfile({
//                       ...profile,
//                       accountHolderName: e.target.value,
//                     })
//                   }
//                   placeholder={
//                     isEditing ? "Enter Account Holder Name" : "Not provided"
//                   }
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Bank Branch</Label>
//                 <Input
//                   value={profile.bankBranch || ""}
//                   disabled={!isEditing}
//                   onChange={(e) =>
//                     setProfile({ ...profile, bankBranch: e.target.value })
//                   }
//                   placeholder={
//                     isEditing ? "Enter Bank Branch" : "Not provided"
//                   }
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="social" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Contact Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Contact Name</Label>
//                   <Input
//                     value={profile.contactName || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, contactName: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter contact name" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Contact Number</Label>
//                   <Input
//                     value={profile.contactNumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, contactNumber: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter contact number" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Name</Label>
//                   <Input
//                     value={profile.secondarycontactname || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactname: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact name"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Designation</Label>
//                   <Input
//                     value={profile.secondarycontactdesignation || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactdesignation: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact designation"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Secondary Contact Number</Label>
//                   <Input
//                     value={profile.secondarycontactnumber || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         secondarycontactnumber: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter secondary contact number"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Startup Email</Label>
//                   <Input
//                     type="email"
//                     value={profile.startupMailId || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, startupMailId: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter startup email" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Website</Label>
//                   <Input
//                     value={profile.website || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, website: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter website URL" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Social Links</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>LinkedIn Company URL</Label>
//                   <Input
//                     value={profile.linkedinStartupUrl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         linkedinStartupUrl: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing ? "Enter LinkedIn company URL" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Founder's LinkedIn URL</Label>
//                   <Input
//                     value={profile.linkedinFounderUrl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({
//                         ...profile,
//                         linkedinFounderUrl: e.target.value,
//                       })
//                     }
//                     placeholder={
//                       isEditing
//                         ? "Enter founder's LinkedIn URL"
//                         : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Instagram URL</Label>
//                   <Input
//                     value={profile.instagramurl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, instagramurl: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter Instagram URL" : "Not provided"
//                     }
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Twitter URL</Label>
//                   <Input
//                     value={profile.twitterurl || ""}
//                     disabled={!isEditing}
//                     onChange={(e) =>
//                       setProfile({ ...profile, twitterurl: e.target.value })
//                     }
//                     placeholder={
//                       isEditing ? "Enter Twitter URL" : "Not provided"
//                     }
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="preferences" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Looking For</CardTitle>
//               <CardDescription>
//                 What facilities are you interested in?
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-muted/50 rounded-lg p-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//                   {LOOKING_FOR.map((option) => (
//                     <div key={option} className="flex items-start space-x-3">
//                       <Checkbox
//                         id={`looking-for-${option}`}
//                         checked={profile.lookingFor?.includes(option) || false}
//                         disabled={!isEditing}
//                         onCheckedChange={() =>
//                           isEditing && handleLookingForChange(option)
//                         }
//                         className="mt-0.5"
//                       />
//                       <label
//                         htmlFor={`looking-for-${option}`}
//                         className={`text-sm leading-tight ${!isEditing && "cursor-not-allowed opacity-80"}`}
//                       >
//                         {option}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 {isEditing && (
//                   <p className="text-xs text-muted-foreground mt-3">
//                     Select all that apply to your startup's needs
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//       {isEditing && (
//         <div className="flex justify-end gap-4">
//           <Button variant="outline" onClick={handleCancel}>
//             Cancel
//           </Button>
//           <Button onClick={() => handleSave(profile)}>Save Changes</Button>
//         </div>
//       )}
//     </div>
//   );
// }
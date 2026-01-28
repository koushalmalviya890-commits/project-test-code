"use client";
import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StartupLogoSection } from "@/components/ui/StartupLogoSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_TYPES, SECTORS, LOOKING_FOR } from "@/lib/constants";
import { INDUSTRIES, STAGES_COMPLETED } from "@/lib/constants/dropdowns";
import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

interface StartupProfile {
  startupName: string | null;
  contactName: string | null;
  contactNumber: string | null;
  founderName: string | null;
  founderDesignation: string | null;
  entityType: string | null;
  teamSize: number | null;
  dpiitNumber: string | null;
  cin: string | null;
  gstnumber: string | null;
  secondarycontactname: string | null;
  secondarycontactdesignation: string | null;
  secondarycontactnumber: string | null;
  sector: string | null;
  industry: string | null;
  stagecompleted: string | null;
  startupMailId: string | null;
  website: string | null;
  linkedinStartupUrl: string | null;
  linkedinFounderUrl: string | null;
  instagramurl: string | null;
  twitterurl: string | null;
  lookingFor: string[] | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  category: string | null;
  logoUrl: string | null;
  bankName: string | null;
  accountNumber: string | number ;
  confirmAccountNumber: string | number | null;
  accountHolderName: string | null;
  bankBranch: string | null;
  ifscCode: string | null;
}

export default function StartupProfile() {
  // const { data: session } = useSession();
  const { user } = useAuth();
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [accountMismatchError, setAccountMismatchError] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/startup/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
        calculateProfileCompletion(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const calculateProfileCompletion = (profileData: StartupProfile) => {
    const requiredFields = [
      { name: "Logo", value: profileData.logoUrl },
      { name: "Startup Name", value: profileData.startupName },
      { name: "Entity Type", value: profileData.entityType },
      { name: "Team Size", value: profileData.teamSize },
      { name: "Contact Name", value: profileData.contactName },
      { name: "Contact Number", value: profileData.contactNumber },
      { name: "Founder Name", value: profileData.founderName },
      { name: "Founder Designation", value: profileData.founderDesignation },
      { name: "Startup Email", value: profileData.startupMailId },
      { name: "Address", value: profileData.address },
      { name: "City", value: profileData.city },
      { name: "State", value: profileData.state },
      { name: "Pincode", value: profileData.pincode },
      { name: "Country", value: profileData.country },
      { name: "Website", value: profileData.website },
      { name: "LinkedIn Company URL", value: profileData.linkedinStartupUrl },
      // { name: "Founder LinkedIn URL", value: profileData.linkedinFounderUrl },
      // { name: "Instagram URL", value: profileData.instagramurl },
      // { name: "Twitter URL", value: profileData.twitterurl },
      { name: "Industry", value: profileData.industry },
      { name: "Sector", value: profileData.sector },
      { name: "Category", value: profileData.category },
      { name: "Stage Completed", value: profileData.stagecompleted },
      // DPIIT Number, CIN, and GST Number are now optional
      {
        name: "Secondary Contact Name",
        value: profileData.secondarycontactname,
      },
      {
        name: "Secondary Contact Designation",
        value: profileData.secondarycontactdesignation,
      },
      {
        name: "Secondary Contact Number",
        value: profileData.secondarycontactnumber,
      },
    ];

    const filledFields = requiredFields.filter(
      (field) =>
        field.value !== null && field.value !== undefined && field.value !== ""
    ).length;

    const percentage = Math.round((filledFields / requiredFields.length) * 100);
    setCompletionPercentage(percentage);

    const incomplete = requiredFields
      .filter((field) => !field.value)
      .map((field) => field.name);
    setIncompleteFields(incomplete);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Validation function - validates account numbers during editing
  const validateAccountNumbers = (formData: StartupProfile): boolean => {
    // If account number is provided, confirm account number must also be provided and match
    if (formData.accountNumber && formData.accountNumber.toString().trim() !== "") {
      if (!formData.confirmAccountNumber || formData.confirmAccountNumber.toString().trim() === "") {
        toast.error("Please re-enter the account number to confirm");
        setActiveTab("banking"); // Switch to banking tab to show the error
        return false;
      }
      
      if (formData.accountNumber.toString() !== formData.confirmAccountNumber.toString()) {
        toast.error("Account numbers do not match. Please verify and try again.");
        setActiveTab("banking"); // Switch to banking tab to show the error
        setAccountMismatchError(true);
        return false;
      }
    }
    
    // If confirm account number is provided, account number must also be provided
    if (formData.confirmAccountNumber && formData.confirmAccountNumber.toString().trim() !== "") {
      if (!formData.accountNumber || formData.accountNumber.toString().trim() === "") {
        toast.error("Please enter the account number");
        setActiveTab("banking"); // Switch to banking tab to show the error
        return false;
      }
    }
    
    return true;
  };

  const handleSave = async (formData: StartupProfile) => {
    // Only validate account numbers if user is in editing mode
    if (isEditing && !validateAccountNumbers(formData)) {
      return; // Stop execution if validation fails during editing
    }

    try {
      const response = await fetch("/api/startup/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      calculateProfileCompletion(updatedProfile);
      setIsEditing(false);
      setAccountMismatchError(false); // Clear any existing error
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLookingForChange = (option: string) => {
    if (!profile) return;

    const currentLookingFor = profile.lookingFor || [];
    const updatedLookingFor = currentLookingFor.includes(option)
      ? currentLookingFor.filter((item) => item !== option)
      : [...currentLookingFor, option];

    setProfile({ ...profile, lookingFor: updatedLookingFor });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
   <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">My Profile</h1>
          <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
            Manage your startup profile and settings
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="w-full sm:w-auto">
            Edit Profile
          </Button>
        )}
      </div>

      {completionPercentage < 100 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium text-sm sm:text-base">Complete your profile:</span>
                  <span className="text-sm">
                    {completionPercentage}% complete
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                {incompleteFields.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="break-words">
                      Missing information:{" "}
                      {incompleteFields.slice(0, 2).join(", ")}
                      {incompleteFields.length > 2 &&
                        ` and ${incompleteFields.length - 2} more`}
                    </p>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  A complete profile helps you connect better with Facility
                  Partners and access more resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto sm:h-[70px]">
          <TabsList className="h-[85px] grid grid-cols-3 sm:grid-cols-3 sm:h-[83px] lg:grid-cols-5 lg:h-[50px] w-full min-w-max">
            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs sm:text-sm px-2 sm:px-4">
              Business
            </TabsTrigger>
            <TabsTrigger value="banking" className="text-xs sm:text-sm px-2 sm:px-4">
              Banking
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm px-2 sm:px-4">
              Social
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm px-2 sm:px-4">
              Preferences
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Profile Picture</CardTitle>
              <CardDescription className="text-sm">Upload your startup logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-md border border-gray-200 mx-auto sm:mx-0">
                  <StartupLogoSection
                    imageUrl={profile.logoUrl}
                    isEditing={isEditing}
                    onChange={(url) => handleSave({ ...profile, logoUrl: url })}
                  />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-medium">Startup Logo</h4>
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on your profile and in search results.
                  </p>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Upload a square image (1:1 ratio) for best results.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Startup Name</Label>
                  <Input
                    value={profile.startupName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, startupName: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter startup name" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Entity Type</Label>
                  <Select
                    value={profile.entityType || ""}
                    disabled={!isEditing}
                    onValueChange={(value) =>
                      setProfile({ ...profile, entityType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Team Size</Label>
                  <Input
                    type="number"
                    value={profile.teamSize?.toString() || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value)
                        : null;
                      setProfile({ ...profile, teamSize: value });
                    }}
                    placeholder={isEditing ? "Enter team size" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">DPIIT Number</Label>
                  <Input
                    value={profile.dpiitNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, dpiitNumber: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter DPIIT number" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">CIN</Label>
                  <Input
                    value={profile.cin || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, cin: e.target.value })
                    }
                    placeholder={isEditing ? "Enter CIN" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">GST Number</Label>
                  <Input
                    value={profile.gstnumber || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, gstnumber: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter GST number" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Founder Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Founder Name</Label>
                  <Input
                    value={profile.founderName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, founderName: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter founder name" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Founder Designation</Label>
                  <Input
                    value={profile.founderDesignation || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        founderDesignation: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing ? "Enter founder designation" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Business Classification</CardTitle>
              <CardDescription className="text-sm">Industry and sector information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Industry</Label>
                  <Select
                    value={profile.industry || ""}
                    disabled={!isEditing}
                    onValueChange={(value) =>
                      setProfile({ ...profile, industry: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sector</Label>
                  <Select
                    value={profile.sector || ""}
                    disabled={!isEditing}
                    onValueChange={(value) =>
                      setProfile({ ...profile, sector: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Stage Completed</Label>
                  <Select
                    value={profile.stagecompleted || ""}
                    disabled={!isEditing}
                    onValueChange={(value) =>
                      setProfile({ ...profile, stagecompleted: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select stage completed" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES_COMPLETED.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Input
                    value={profile.category || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, category: e.target.value })
                    }
                    placeholder={isEditing ? "Enter category" : "Not provided"}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <Input
                    value={profile.address || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder={isEditing ? "Enter address" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Input
                    value={profile.city || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                    placeholder={isEditing ? "Enter city" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">State</Label>
                  <Input
                    value={profile.state || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, state: e.target.value })
                    }
                    placeholder={isEditing ? "Enter state" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pincode</Label>
                  <Input
                    value={profile.pincode || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, pincode: e.target.value })
                    }
                    placeholder={isEditing ? "Enter pincode" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Country</Label>
                  <Input
                    value={profile.country || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, country: e.target.value })
                    }
                    placeholder={isEditing ? "Enter country" : "Not provided"}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Banking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Name (optional)</Label>
                  <Input
                    value={profile.bankName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, bankName: e.target.value })
                    }
                    placeholder={isEditing ? "Enter bank name" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Number (optional)</Label>
                  <Input
                    value={profile.accountNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProfile((prev) => {
                        if (!prev) return prev;
                        const updated = { ...prev, accountNumber: value };
                        setAccountMismatchError(
                          Boolean(
                            updated.confirmAccountNumber &&
                            updated.confirmAccountNumber !== value
                          )
                        );
                        return updated;
                      });
                    }}
                    placeholder={isEditing ? "Enter account number" : "Not provided"}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Re-Enter Account Number (optional)
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profile.confirmAccountNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) => {
                      const value = e.target.value;
                      setProfile((prev) => {
                        if (!prev) return prev;
                        const updated = { ...prev, confirmAccountNumber: value };
                        setAccountMismatchError(
                          Boolean(
                            updated.accountNumber &&
                            updated.confirmAccountNumber &&
                            updated.accountNumber !== updated.confirmAccountNumber
                          )
                        );
                        return updated;
                      });
                    }}
                    placeholder={isEditing ? "Re-enter account number" : "Not provided"}
                    className="w-full"
                  />
                  {isEditing && accountMismatchError && (
                    <p className="text-sm text-red-500">Account numbers do not match.</p>
                  )}
                  {isEditing && profile.accountNumber && profile.accountNumber.toString().trim() !== "" && (
                    <p className="text-xs text-muted-foreground">
                      Required when account number is provided
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">IFSC Code (optional)</Label>
                  <Input
                    value={profile.ifscCode || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, ifscCode: e.target.value })
                    }
                    placeholder={isEditing ? "Enter IFSC code" : "Not provided"}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Holder Name (optional)</Label>
                  <Input
                    value={profile.accountHolderName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        accountHolderName: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing ? "Enter Account Holder Name" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Branch (optional)</Label>
                  <Input
                    value={profile.bankBranch || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, bankBranch: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter Bank Branch" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Name</Label>
                  <Input
                    value={profile.contactName || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, contactName: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter contact name" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <Input
                    value={profile.contactNumber || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, contactNumber: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter contact number" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Secondary Contact Name</Label>
                  <Input
                    value={profile.secondarycontactname || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        secondarycontactname: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing
                        ? "Enter secondary contact name"
                        : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Secondary Contact Designation</Label>
                  <Input
                    value={profile.secondarycontactdesignation || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        secondarycontactdesignation: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing
                        ? "Enter secondary contact designation"
                        : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Secondary Contact Number</Label>
                  <Input
                    value={profile.secondarycontactnumber || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        secondarycontactnumber: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing
                        ? "Enter secondary contact number"
                        : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Startup Email</Label>
                  <Input
                    type="email"
                    value={profile.startupMailId || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, startupMailId: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter startup email" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-medium">Website</Label>
                  <Input
                    value={profile.website || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter website URL" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">LinkedIn Company URL</Label>
                  <Input
                    value={profile.linkedinStartupUrl || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        linkedinStartupUrl: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing ? "Enter LinkedIn company URL" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Founder's LinkedIn URL</Label>
                  <Input
                    value={profile.linkedinFounderUrl || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        linkedinFounderUrl: e.target.value,
                      })
                    }
                    placeholder={
                      isEditing
                        ? "Enter founder's LinkedIn URL"
                        : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Instagram URL</Label>
                  <Input
                    value={profile.instagramurl || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, instagramurl: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter Instagram URL" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Twitter URL</Label>
                  <Input
                    value={profile.twitterurl || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setProfile({ ...profile, twitterurl: e.target.value })
                    }
                    placeholder={
                      isEditing ? "Enter Twitter URL" : "Not provided"
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Looking For</CardTitle>
              <CardDescription className="text-sm">
                What facilities are you interested in?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {LOOKING_FOR.map((option) => (
                    <div key={option} className="flex items-start space-x-3">
                      <Checkbox
                        id={`looking-for-${option}`}
                        checked={profile.lookingFor?.includes(option) || false}
                        disabled={!isEditing}
                        onCheckedChange={() =>
                          isEditing && handleLookingForChange(option)
                        }
                        className="mt-0.5 flex-shrink-0"
                      />
                      <label
                        htmlFor={`looking-for-${option}`}
                        className={`text-sm leading-tight break-words ${!isEditing && "cursor-not-allowed opacity-80"}`}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Select all that apply to your startup's needs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {isEditing && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button onClick={() => handleSave(profile)} className="w-full sm:w-auto order-1 sm:order-2">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
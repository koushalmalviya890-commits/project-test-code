"use client";

import React, { useState } from "react";
import { useEventForm } from "../../services/contexts/EventFormContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  X,
  User,
  Phone,
  Mail,
  Globe,
  IdCard,
  FileText,
  CheckSquare,
  Circle,
  List,
  Paperclip,
  Edit,
} from "lucide-react";

interface CustomQuestion {
  _id?: string;
  questionType: "text" | "radio" | "checkbox" | "options" | "website";
  question: string;
  options: string[];
  isRequired: "required" | "optional";
}
//for error handling
interface ValidationErrors {
  [key: string]: string;
}

const RegistrationDetailsTab: React.FC<{
  onNext: () => void;
  isEditMode: boolean;
}> = ({ onNext, isEditMode }) => {
  const { formData, updateFormData } = useEventForm() as {
    formData: {
      collectPersonalInfo: Array<{
        fullName: string;
        email: "required" | "optional";
        phoneNumber: "required" | "optional";
        _id?: string;
      }>;
      collectIdentityProof: Array<{
        idProof: "required" | "optional" | "off";
        idProofType:
          | "Aadhar Card"
          | "PAN Card"
          | "Driving License"
          | "Passport";
        idNumber: "required" | "optional" | "off";
        websiteLink: "required" | "optional" | "off";
        _id?: string;
      }>;
      customQuestions: CustomQuestion[];
      customizeRegistrationEmail: boolean;
      registrationEmailBodyContent: string;
    };
    updateFormData: (field: keyof any, value: any) => void;
  };

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleNext = () => {
    const newErrors: ValidationErrors = {};

    if (
      formData.customizeRegistrationEmail &&
      !formData.registrationEmailBodyContent.trim()
    ) {
      newErrors.registrationEmailBodyContent =
        "Registration email content cannot be empty.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    questionType: "text",
    question: "",
    options: [],
    isRequired: "optional",
  });
  const [showCustomQuestions, setShowCustomQuestions] = useState(
    formData.customQuestions.length > 0
  );

  const [editingId, setEditingId] = useState("");

  // Initialize default personal info and identity proof if not exists
  React.useEffect(() => {
    if (formData.collectPersonalInfo.length === 0) {
      updateFormData("collectPersonalInfo", [
        {
          fullName: "required",
          email: "required",
          phoneNumber: "optional",
        },
      ]);
    }
    if (formData.collectIdentityProof.length === 0) {
      updateFormData("collectIdentityProof", [
        {
          idProof: "optional",
          idProofType: "Aadhar Card",
          idNumber: "optional",
          websiteLink: "optional",
        },
      ]);
    }
  }, []);

  const personalInfo = formData.collectPersonalInfo[0] || {
    fullName: "required",
    email: "required",
    phoneNumber: "optional",
  };

  const identityProof = formData.collectIdentityProof[0] || {
    idProof: "optional",
    idProofType: "Aadhar Card",
    idNumber: "optional",
    websiteLink: "optional",
  };

  const updatePersonalInfo = (field: keyof typeof personalInfo, value: any) => {
    const updated = { ...personalInfo, [field]: value };
    updateFormData("collectPersonalInfo", [updated]);
  };

  const updateIdentityProof = (
    field: keyof typeof identityProof,
    value: any
  ) => {
    const updated = { ...identityProof, [field]: value };
    updateFormData("collectIdentityProof", [updated]);
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      questionType: "text",
      question: "",
      options: [],
      isRequired: "optional",
    });
    setSelectedQuestionType("");
  };

  const handleQuestionTypeSelect = (type: string) => {
    setSelectedQuestionType(type);
    setNewQuestion((prev) => ({
      ...prev,
      questionType: type as CustomQuestion["questionType"],
      options: ["radio", "checkbox", "options"].includes(type) ? [``] : [],
    }));
  };

  const addOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ``],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const removeOption = (index: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const addCustomQuestion = () => {
    if (!newQuestion.question.trim()) return;

    const questionToAdd = {
      ...newQuestion,
      // _id: Date.now().toString(),
    };

    updateFormData("customQuestions", [
      ...formData.customQuestions,
      questionToAdd,
    ]);
    setShowCustomQuestions(true);
    setIsAddQuestionOpen(false);
    resetNewQuestion();
  };

  const deleteCustomQuestion = (id: string) => {
    const updated = formData.customQuestions.filter((q) => q._id !== id);
    updateFormData("customQuestions", updated);
    if (updated.length === 0) {
      setShowCustomQuestions(false);
    }
  };

  const updateCustomQuestion = (
    id: string,
    field: keyof CustomQuestion,
    value: any
  ) => {
    const updated = formData.customQuestions.map((q) =>
      q._id === id ? { ...q, [field]: value } : q
    );
    updateFormData("customQuestions", updated);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-5 h-5" />;
      case "radio":
        return <Circle className="w-5 h-5" />;
      case "checkbox":
        return <CheckSquare className="w-5 h-5" />;
      case "options":
        return <List className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      // case "file":
      //   return <Paperclip className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const questionTypeOptions = [
    { value: "text", label: "Text", description: "Single line text input" },
    { value: "radio", label: "Radio", description: "Company selection" },
    {
      value: "checkbox",
      label: "Checklist",
      description: "Multiple choice selection",
    },
    { value: "website", label: "Website", description: "Website URL input" },
    { value: "options", label: "Options", description: "Dropdown selection" },
    // { value: "file", label: "File", description: "File upload" },
  ];

  return (
    <div className="max-w-5xl  p-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Registration Questions
          </h2>
          <p className="text-sm text-gray-600">
            We will ask questions when they register for event
          </p>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contact */}
            {/* Full Name – Always Required */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  Full Name
                </Label>
              </div>
              <span className="text-xs font-semibold ">Required</span>
            </div>

            {/* Email – Always Required */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  Email
                </Label>
              </div>
              <span className="text-xs font-semibold ">Required</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  Phone
                </Label>
              </div>
              <Select
                value={personalInfo.phoneNumber}
                onValueChange={(value: "required" | "optional") =>
                  updatePersonalInfo("phoneNumber", value)
                }
              >
                <SelectTrigger className="w-24 h-8 border-none text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Identity Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Identity</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Website */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <Globe className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  website
                </Label>
              </div>
              <Select
                value={identityProof.websiteLink}
                onValueChange={(value: "required" | "optional" | "off") =>
                  updateIdentityProof("websiteLink", value)
                }
              >
                <SelectTrigger className="w-24 h-8 border-none text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ID Proof */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <IdCard className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  ID Proof
                </Label>
              </div>
              <Select
                value={identityProof.idProof}
                onValueChange={(value: "required" | "optional" | "off") =>
                  updateIdentityProof("idProof", value)
                }
              >
                <SelectTrigger className="w-24 h-8 border-none text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(identityProof.idProof === "optional" ||
              identityProof.idProof === "required") && (
              <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                <IdCard className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-900">
                    ID Proof Type
                  </Label>
                </div>
                <Select
                  value={identityProof.idProofType}
                  onValueChange={(
                    value:
                      | "Aadhar Card"
                      | "PAN Card"
                      | "Driving License"
                      | "Passport"
                  ) => updateIdentityProof("idProofType", value)}
                >
                  <SelectTrigger className="w-24 h-8 border-none text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                    <SelectItem value="PAN Card">PAN Card</SelectItem>
                    <SelectItem value="Driving License">
                      Driving License
                    </SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ID No */}
            <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-900">
                  ID No
                </Label>
              </div>
              <Select
                value={identityProof.idNumber}
                onValueChange={(value: "required" | "optional" | "off") =>
                  updateIdentityProof("idNumber", value)
                }
              >
                <SelectTrigger className="w-24 h-8 text-xs border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Custom Questions Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Questions
          </h3>

          {!showCustomQuestions && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <div className="text-gray-600">
                  <p className="font-medium">What is your name?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ID may be required
                  </p>
                </div>
                <div className="text-gray-600">
                  <p className="font-medium">What company do you work for?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Company name required
                  </p>
                </div>
                <div className="text-gray-600">
                  <p className="font-medium">Gender?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ○ Select ○ Male ○ Female
                  </p>
                </div>
                <div className="text-gray-600">
                  <p className="font-medium">
                    If you submit you agree our terms and condition
                  </p>
                  <p className="text-sm text-gray-500 mt-1">☐ Check box</p>
                </div>
              </div>
            </div>
          )}

          {/* Added Custom Questions */}
          {showCustomQuestions &&
            formData.customQuestions.map((question, index) => (
              <div
                key={question._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getQuestionTypeIcon(question.questionType)}
                    <div className="flex-1">
                      <Input
                        id={`question-${question._id}`}
                        value={question.question}
                        onChange={(e) =>
                          updateCustomQuestion(
                            question._id!,
                            "question",
                            e.target.value
                          )
                        }
                        placeholder="Enter your question"
                        className="border-0 pl-2 font-medium text-gray-900 focus-visible:ring-0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {question.isRequired === "required"
                          ? "Required"
                          : "Optional"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCustomQuestion(question._id!)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(`question-${question._id}`);
                        setTimeout(() => {
                          document
                            .getElementById(`question-${question._id}`)
                            ?.focus();
                        }, 0);
                      }}
                      className="bg-transparent h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4 text-black" />
                    </Button>
                  )}
                </div>

                {/* Options for radio, checkbox, options */}
                {["radio", "checkbox", "options"].includes(
                  question.questionType
                ) && (
                  <div className="ml-8 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="text-gray-400 text-sm">
                          {question.questionType === "radio"
                            ? "○"
                            : question.questionType === "checkbox"
                              ? "☐"
                              : "•"}
                        </span>
                        <Input
                          id={`option-${question._id}-${optionIndex}`}
                          value={option}
                          onChange={(e) => {
                            const updated = [...question.options];
                            updated[optionIndex] = e.target.value;
                            updateCustomQuestion(
                              question._id!,
                              "options",
                              updated
                            );
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className=" h-12 w-52 border-2 px-4 "
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = question.options.filter(
                              (_, i) => i !== optionIndex
                            );
                            updateCustomQuestion(
                              question._id!,
                              "options",
                              updated
                            );
                          }}
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>

                        {isEditMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(
                                `option-${question._id}-${optionIndex}`
                              );
                              setTimeout(() => {
                                document
                                  .getElementById(
                                    `option-${question._id}-${optionIndex}`
                                  )
                                  ?.focus();
                              }, 0);
                            }}
                            className="bg-transparent h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3 text-black" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updated = [...question.options, ``];
                        updateCustomQuestion(question._id!, "options", updated);
                      }}
                      className="text-green-600 hover:text-green-700 h-8 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
            ))}

          {/* Add Question Button */}
          <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className=" mx-auto h-12 text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => {
                  resetNewQuestion();
                  setIsAddQuestionOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">?</span>
                  </div>
                  Add Question
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Ask guests questions when they register
                </p>
              </DialogHeader>

              {!selectedQuestionType ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {questionTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleQuestionTypeSelect(option.value)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {getQuestionTypeIcon(option.value)}
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label
                      htmlFor="question-input"
                      className="text-sm font-medium mb-2 block"
                    >
                      Question
                    </Label>
                    <Input
                      id="question-input"
                      value={newQuestion.question}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      placeholder="Your question here..."
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    {/* <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Response Length
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={
                            newQuestion.questionType === "text"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              questionType: "text",
                            }))
                          }
                        >
                          Short
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled
                        >
                          Multi-Line
                        </Button>
                      </div>
                    </div> */}

                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Required</Label>
                      <Switch
                        checked={newQuestion.isRequired === "required"}
                        onCheckedChange={(checked) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            isRequired: checked ? "required" : "optional",
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Options section for radio, checkbox, options */}
                  {["radio", "checkbox", "options"].includes(
                    newQuestion.questionType
                  ) && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Options
                      </Label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateOption(index, e.target.value)
                              }
                              placeholder={`Options ${index + 1}`}
                              className="flex-1"
                            />
                            {newQuestion.options.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addOption}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={addCustomQuestion}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!newQuestion.question.trim()}
                  >
                    Add Question
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Customize Registration Email */}
        <div className="space-y-4">
          <div className="flex items-center gap-6 p-4 ">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Customize Registration Email
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Verified addition event message to the next
              </p>
            </div>
            <Switch
              checked={formData.customizeRegistrationEmail}
              onCheckedChange={(checked) =>
                updateFormData("customizeRegistrationEmail", checked)
              }
            />
          </div>

          {formData.customizeRegistrationEmail && (
            <div>
              <Textarea
                value={formData.registrationEmailBodyContent}
                onChange={(e) =>
                  updateFormData("registrationEmailBodyContent", e.target.value)
                }
                className=" w-7/12 h-44 resize-none border-2 border-gray-300 focus:border-green-500 focus:ring-0"
                placeholder="Enter your custom registration email content..."
              />
            </div>
          )}
          {errors.registrationEmailBodyContent && (
            <span className="text-red-500 text-xs mt-1">
              {errors.registrationEmailBodyContent}
            </span>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-12">
          <Button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600 text-white px-16 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Save and Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailsTab;

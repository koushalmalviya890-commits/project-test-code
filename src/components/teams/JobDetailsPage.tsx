"use client";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  CalendarDays,
  Users,
  Briefcase,
  Layers,
  GraduationCap,
  Award,
  Link2,
  Linkedin,
  Twitter,
  Mail,
} from "lucide-react";

interface JobDetails {
  title: string;
  tags: string[];
  salaryRange: string;
  salaryNote: string;
  jobPosted: string;
  workingHours: string;
  workingDays: string;
  vacancy: number;
  jobType: string;
  jobLevel: string;
  education: string;
  experience: string;
  primaryResponsibility: string;
  specifications: string[];
  benefits: {
    title: string;
    description: string;
  }[];
}

const jobDetailsData: JobDetails = {
  title: "Senior UX Designer",
  tags: ["Full-time", "Mid-Level", "1position"],
  salaryRange: "$100,000 - $120,000",
  salaryNote: "Yearly salary",
  jobPosted: "14 Jun, 2025",
  workingHours: "10 AM - 6 PM",
  workingDays: "Weekly 5 days",
  vacancy: 3,
  jobType: "Full Time",
  jobLevel: "Entry Level",
  education: "BE/B.Tech/Design",
  experience: "1-3 Years",
  primaryResponsibility:
    "As a UI/UX Designer, you will be responsible for designing and prototyping intuitive user interfaces for web and mobile applications, creating and maintaining design systems and style guides for consistency, and conducting user research and usability testing to validate design decisions. You'll translate complex requirements into user flows, wireframes, and high-fidelity mockups, while collaborating closely with developers to ensure seamless implementation. Applying accessibility best practices, managing design operations with collaboration tools, and working with cross-functional teams, you'll help deliver user-centered solutions that align with business goals and stay ahead of evolving design trends.",
  specifications: [
    "Proficiency in design and prototyping tools such as Figma, Adobe XD, or Sketch.",
    "Strong understanding of user-centered design principles, information architecture, and interaction design.",
    "Experience in creating wireframes, user flows, mockups, and high-fidelity prototypes.",
    "Ability to build and maintain design systems, style guides, and component libraries.",
    "Knowledge of usability testing methods and tools to validate design solutions.",
    "Familiarity with accessibility standards (WCAG) and inclusive design practices.",
    "Basic understanding of front-end technologies (HTML, CSS, JavaScript) for effective collaboration with developers.",
    "Strong visual design skills, including typography, color theory, and layout.",
    "Excellent collaboration skills for working closely with product managers, developers, and stakeholders.",
    "Ability to present and communicate design concepts clearly to both technical and non-technical audiences.",
  ],
  benefits: [
    {
      title: "Early Friday Wrap",
      description: "Up - Log off early for our end-of-week team catch-up.",
    },
    {
      title: "Flexible Time Off",
      description:
        "24 days holiday (including public holidays) + an extra day on your birthday.",
    },
    {
      title: "Performance Rewards",
      description: "Annual performance bonus tied to impact and growth.",
    },
    {
      title: "Wellness Support",
      description: "Healthcare perks and mental wellness resources.",
    },
    {
      title: "Give Back",
      description:
        "Paid community days to volunteer with causes you care about.",
    },
    {
      title: "Continuous Learning",
      description:
        "₹10,000 annual budget for courses, books, or certifications.",
    },
    {
      title: "Energized Mondays",
      description:
        "Free breakfast on Mondays and healthy snacks stocked throughout the week.",
    },
    {
      title: "Perks Platform",
      description: "Discounts, vouchers, and perks to spend your way.",
    },
    {
      title: "Work Your Way",
      description:
        "Remote/hybrid/onsite flexibility + modern workspace access.",
    },
    {
      title: "Top Gear",
      description:
        "A brand-new MacBook and the tools you need to do your best work.",
    },
    {
      title: "Startup Ecosystem Access",
      description:
        "Join an organization on the cusp of exponential growth and be part of building the startup ecosystem story.",
    },
  ],
};

const JobDetailsPage = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 overflow-hidden">
        <img src="/teams/Jobhero.svg" alt="" />
      </div>
      <div className="max-w-7xl mx-auto mt-12 items-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex mb-12">
          <div className="w-1/2 flex items-start gap-4 mb-4">
            {/* <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div> */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {jobDetailsData.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {jobDetailsData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-1/2 justify-end space-x-4 gap-5">
            <div className="pt-6">
              <div className="flex justify-center gap-2 mb-1">
                <span className="text-sm text-gray-600">Salary (USD)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-xl font-semibold text-green-600 mb-1">
                  {jobDetailsData.salaryRange}
                </div>
                <div className="text-sm text-gray-500">
                  {jobDetailsData.salaryNote}
                </div>
              </div>
            </div>

            <button className="w-[180px] h-[40px] text-[12px] mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header Card */}

            {/* Primary Responsibility */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Primary Responsibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {jobDetailsData.primaryResponsibility}
              </p>
            </div>

            {/* Job Specification */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Job Specification
              </h2>
              <ul className="space-y-4">
                {jobDetailsData.specifications.map((spec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">
                      {spec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Benefits at Cumma
              </h2>
              <div className="space-y-6">
                {jobDetailsData.benefits.map((benefit, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              I'm Interested
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Column - Job Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8">
                Job Overview
              </h2>

              <div className="space-y-8">
                {/* Job Posted */}
                <div className="flex justify-between gap-12">
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        JOB POSTED
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.jobPosted}
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        WORKING HOURS
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.workingHours}
                      </div>
                    </div>
                  </div>

                  {/* Working Days */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        WORKING DAYS
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.workingDays}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-12">
                  {/* Vacancy */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">VACANCY</div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.vacancy}
                      </div>
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">JOB TYPE</div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.jobType}
                      </div>
                    </div>
                  </div>

                  {/* Job Level */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Layers className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        JOB LEVEL
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.jobLevel}
                      </div>
                    </div>
                  </div>
                </div>
               <div className="flex justify-between gap-12">
                  {/* Education */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        EDUCATION
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.education}
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        EXPERIENCE
                      </div>
                      <div className="font-semibold text-gray-900">
                        {jobDetailsData.experience}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Share this To your Friends
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyLink}
                    className={`flex-1 ${
                      copied ? "bg-green-100" : "bg-green-50"
                    } hover:bg-green-100 text-green-600 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    <Link2 className="w-5 h-5" />
                    {copied ? "Copied!" : "Copy Links"}
                  </button>
                  <button className="w-12 h-12 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <Linkedin className="w-5 h-5 text-green-600" />
                  </button>
                  <button className="w-12 h-12 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <Twitter className="w-5 h-5 text-green-600" />
                  </button>
                  <button className="w-12 h-12 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                    <Mail className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View All Jobs Button */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border-2 border-gray-300 transition-colors">
            View All Jobs
            <ArrowRight className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;

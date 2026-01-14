"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
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
import { useSearchParams } from "next/navigation";

interface Job {
  title: string;
  icon?: string;
  jobcategory?: string;
  tags?: string[];
  salary?: string;
  salaryRange?: string;
  salaryNote?: string;
  description?: string;
  jobPosted?: string;
  workingHours?: string;
  workingDays?: string;
  vacancy?: number;
  jobType?: string;
  jobLevel?: string;
  education?: string;
  experience?: string;
  primaryResponsibility?: string;
  specifications?: string[];
  benefits?: {
    title: string;
    description: string;
  }[];
  location?: string;
  zohoJobId?: string;
  isActive?: boolean;
}

const JobDetailsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? JSON.parse(tagsParam) : [];
  const router = useRouter();
  const [zohoJobopeningId, setZohoJobopeningId] = useState("");
    
  useEffect(() => {
   // console.log("Tags received:", tags);
  }, [tags]);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`https://api.cumma.in/api/jobs/${id}`)
      .then((res) => {
        setJob(res.data);
        // store zoho job id from backend into state
        setZohoJobopeningId(res.data?.zohoJobId || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching job:", err);
        setLoading(false);
      });
  }, [id]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyNow = () => {
    const query = zohoJobopeningId
      ? `?zohoJobId=${encodeURIComponent(zohoJobopeningId)}`
      : "";
    router.push(`/jobs/${id}/apply${query}`);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading job details...</p>;
  }

  if (!job) {
    return <p className="text-center mt-10 text-red-500">Job not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="w-full h-[40vh] sm:h-[70vh] overflow-hidden mx-auto flex items-center justify-center">
        <img src="/teams/Jobhero.svg" alt="" className="w-full" />
      </div>
      <div className="max-w-7xl mx-auto mt-6 sm:mt-12 items-center">
        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200 flex flex-col lg:flex-row mb-8 sm:mb-12">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: { label: string; color: string }, idx: number) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-xs font-medium ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full lg:w-1/2 justify-end space-y-4 sm:space-y-0 sm:space-x-4 gap-5 mt-6 lg:mt-0">
            <div className="pt-0 sm:pt-6">
              <div className="flex justify-center sm:justify-start gap-2 mb-1">
                <span className="text-sm text-gray-600">Salary</span>
              </div>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <div className="text-xl font-semibold text-green-600 mb-1">
                 ₹ {job.salaryRange}
                </div>
                <div className="text-sm text-gray-500">{job.salaryNote}</div>
              </div>
            </div>
            <button 
            onClick={handleApplyNow}
            className="w-full sm:w-[180px] h-[40px] text-[12px] sm:mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8 order-2 md:order-1">
            {/* Primary Responsibility */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Primary Responsibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {job.primaryResponsibility}
              </p>
            </div>

            {/* Job Specification */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Job Specification
              </h2>
              <ul className="space-y-4">
                {job.specifications?.map((spec, index) => (
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
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Benefits at Cumma
              </h2>
              <div className="space-y-6">
                {job.benefits?.map((benefit, index) => (
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
          <div className="lg:col-span-2 order-1 md:order-2">
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200 lg:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">
                Job Overview
              </h2>

              <div className="space-y-6 sm:space-y-8">
                {/* First Row - Job Posted, Working Hours, Working Days */}
                <div className="grid grid-cols-2 sm:flex sm:justify-between gap-6 sm:gap-12">
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        JOB POSTED
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.jobPosted}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        WORKING HOURS
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.workingHours}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4 col-span-2 sm:col-span-1">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        WORKING DAYS
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.workingDays}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Second Row - Vacancy, Job Type, Job Level */}
                <div className="grid grid-cols-2 sm:flex sm:justify-between gap-6 sm:gap-12">
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">VACANCY</div>
                      <div className="font-semibold text-gray-900">
                        {job.vacancy}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">JOB TYPE</div>
                      <div className="font-semibold text-gray-900">
                        {job.jobType}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4 col-span-2 sm:col-span-1">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Layers className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        JOB LEVEL
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.jobLevel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Third Row - Education, Experience */}
                <div className="grid grid-cols-2 sm:flex sm:justify-between gap-6 sm:gap-12">
                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        EDUCATION
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.education}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        EXPERIENCE
                      </div>
                      <div className="font-semibold text-gray-900">
                        {job.experience}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
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
        <div className="mt-12 sm:mt-16 text-center">
  <button
  onClick={() => {
    if (window.history.length > 1) {
      router.back(); // Go back if there is a history
    } else {
      router.push("/careers"); // Fallback to the "All Jobs" page
    }
  }}
  className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border-2 border-gray-300 transition-colors"
>
      View All Jobs
      <ArrowRight className="w-5 h-5 text-green-600" />
    </button>
  </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
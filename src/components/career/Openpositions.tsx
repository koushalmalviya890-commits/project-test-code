"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Code, Palette, Headphones } from "lucide-react";
import axios from "axios";
import { useRouter } from 'next/navigation';

interface JobTag {
  label: string;
  color: string;
}

interface JobCard {
  _id: string;
  title: string;
  icon: string;
  jobcategory: string;
  primaryResponsibility: string;
  tags: JobTag[];
  salary: string;
  description: string;
  zohoJobId?: string;
}

const getTagColor = (label: string): string => {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("position")) return "bg-teal-50 text-teal-600";
  if (
    lowerLabel.includes("fresher") ||
    lowerLabel.includes("mid-level") ||
    lowerLabel.includes("senior") ||
    lowerLabel.includes("junior") ||
    lowerLabel.includes("entry")
  )
    return "bg-orange-50 text-orange-600";
  if (
    lowerLabel.includes("wfo") ||
    lowerLabel.includes("wfh") ||
    lowerLabel.includes("remote") ||
    lowerLabel.includes("hybrid") ||
    lowerLabel.includes("office")
  )
    return "bg-red-50 text-red-600";
  if (
    lowerLabel.includes("full time") ||
    lowerLabel.includes("part time") ||
    lowerLabel.includes("contract") ||
    lowerLabel.includes("fulltime") ||
    lowerLabel.includes("full-time")
  )
    return "bg-yellow-50 text-yellow-600";

  return "bg-gray-50 text-gray-600";
};

const iconMap: Record<string, React.ComponentType<any>> = {
  Development: Code,
  Design: Palette,
  Management: Headphones,
};

const getIconForCategory = (category: string): React.ComponentType<any> =>
  iconMap[category] || Code;

const JobCardComponent: React.FC<{ job: JobCard; expanded: boolean; onToggle: () => void }> = ({ job, expanded, onToggle }) => {
  const IconComponent = getIconForCategory(job.jobcategory);
  const router = useRouter();

  const handleApply = () => {
    if (!job.zohoJobId) {
      alert("Job ID not available. Please try again.");
      return;
    }

    const zohoJobUrl = `https://cumma.zohorecruit.in/jobs/Careers/${job.zohoJobId}/${job.title?.replace(/\s+/g, "-")}`;
    window.open(zohoJobUrl, '_blank');
  };

  const descriptionSource = job.primaryResponsibility || job.description || "";
  const paragraphs = descriptionSource
    .split(/\r?\n\r?\n+/)
    .filter(Boolean);

  const truncate = (text: string, limit = 220) =>
    text.length > limit ? text.slice(0, limit).trimEnd() + "…" : text;

  const shouldShowToggle =
    paragraphs.length > 1 || (paragraphs[0] && paragraphs[0].length > 220);

  const content = expanded
    ? paragraphs
    : paragraphs.length
    ? [truncate(paragraphs[0])]
    : [];

  return (
    <div className="mx-auto w-full max-w-[420px] bg-white rounded-3xl px-5 py-5 sm:px-6 sm:py-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-400 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pt-1 sm:pt-2">
          {job.title}
        </h3>
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.map((tag, index) => (
          <span
            key={index}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium ${tag.color}`}
          >
            {tag.label}
          </span>
        ))}
      </div>
      )}

      {/* Salary */}
      <div className="mb-4">
        <span className="inline-block px-2.5 sm:px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs sm:text-sm font-medium">
          {job.salary}
        </span>
      </div>

      {/* Description (truncated + toggle) */}
      <div>
        {content.map((para, idx) => (
          <p
            key={idx}
            className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed"
          >
            {para}
          </p>
        ))}

        {shouldShowToggle && (
          <button
            onClick={onToggle}
            className="text-green-600 font-medium text-sm hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Apply Button */}
      <div className="mt-4">
        <button
          onClick={handleApply}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors group"
        >
          Apply Now
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const Openpositions = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    axios
      .get("https://api.cumma.in/api/jobs")
      .then((response) => {
        const data = response.data.data;

        const transformed = data.map((job: any) => ({
          ...job,
          tags: job.tags.map((label: string) => ({
            label,
            color: getTagColor(label),
          })),
        }));

        setJobs(transformed);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
  }, []);

  const categories = [
    "All",
    "Development",
    "Design",
    "Content Writing",
    "Management",
    "Marketing",
    "Operations"
  ];

  const filteredJobs =
    activeCategory === "All"
      ? jobs
      : jobs.filter((job) => job.jobcategory === activeCategory);

  return (
    <div id="open-positions" className="relative bg-white pb-12 mt-[10px] sm:pb-16 md:pb-24 overflow-hidden md:-mt-[55px]">
      {/* Category Filter - Desktop */}
      <div className="hidden lg:block w-full max-w-[1100px] h-[100px] border-2 border-gray-500 rounded-full mx-auto px-8">
        <div className="flex items-center justify-between h-full">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 xl:px-8 py-3 rounded-full text-base xl:text-lg font-medium transition-colors duration-200 ${
                activeCategory === category
                  ? "bg-green-500 text-white shadow-lg scale-105"
                  : "text-gray-700 hover:text-green-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter - Mobile & Tablet */}
      <div className="lg:hidden px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-colors duration-200 border-2 ${
                activeCategory === category
                  ? "bg-green-500 text-white border-green-500 shadow-lg"
                  : "text-gray-700 border-gray-300 hover:text-green-600 hover:border-green-400"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 px-4 sm:px-6 md:max-w-[1300px] mx-auto items-stretch">
        {loading ? (
          <p className="text-gray-500 col-span-3 text-center">
            Loading jobs...
          </p>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCardComponent
              key={job._id}
              job={job}
              expanded={allExpanded}
              onToggle={() => setAllExpanded((s) => !s)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500 text-base sm:text-lg">
              No positions available in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Openpositions;
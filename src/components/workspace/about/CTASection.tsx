import { Mode } from "@/app/(landing)/offices/about/page";
import { useRouter } from "next/navigation";

interface CTASectionProps {
  mode: Mode;
}

export default function CTASection({ mode }: CTASectionProps) {
  const router = useRouter();

  const handleCTAClick = () => {
    if (mode === "startup") {
      router.push("/SearchPage");
    } else {
      router.push("/sign-up/service-provider");
    }
  };

  return (
    <section className="bg-gradient-to-r from-green-400 via-green-600 to-green-800 text-white text-center flex flex-col md:flex-row items-center justify-center min-h-[300px] md:h-[400px] py-8 md:py-0">
      <div className="max-w-2xl mx-auto mb-6 md:mb-0 md:mr-8 px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 md:mb-4">
          {mode === "startup"
            ? "Ready to Work Smarter?"
            : "Ready to Enable Smarter Workspaces?"}
        </h2>
        <p className="max-w-xl mx-auto mb-5 md:mb-6 text-sm sm:text-base md:text-lg">
          {mode === "startup"
            ? "Cumma workspaces scale with you. Work faster. Collaborate better. Grow bigger."
            : "Cumma helps you onboard seamlessly. Reach startups faster. Manage smarter. Grow bigger."}
        </p>
        <button
          onClick={handleCTAClick}
          className="bg-white text-green-600 px-6 sm:px-7 py-2.5 sm:py-3 rounded font-semibold shadow-md hover:bg-green-50 transition text-sm sm:text-base"
        >
          {mode === "startup" ? "Book Now" : "List Now"}
        </button>
      </div>
      <div className="flex-shrink-0 w-full md:w-auto h-48 sm:h-56 md:h-full max-w-xs md:max-w-none">
        <img
          src={mode === "startup" ? "/workspace/rocket.svg" : "/workspace/corporate.svg"}
          alt={mode === "startup" ? "Rocket" : "Workspace"}
          className="w-full h-full object-contain md:object-cover mx-auto"
        />
      </div>
    </section>
  );
}
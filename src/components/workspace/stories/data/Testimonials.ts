export type TestimonialsMode = "users" | "enablers";

type Highlight = {
  title: string;
  desc?: string;
  button?: string;
  icon: string;
};

type TestimonialConfig = {
  title: string;
  subtitle: string;
  video: string;
  person: string;
  role: string;
  highlights: Highlight[];
};

export const testimonials: Record<TestimonialsMode, TestimonialConfig[]> = {
  users: [
    {
      title: "Why Users Trust Cumma?",
      subtitle:
        "Cumma gave us the right space at the right time. From flexible bookings to real-time support...",
      video: "/videos/user1.mp4",
      person: "Prethi",
      role: "Startup Founder",
      highlights: [
        { title: "Seamless Workspace Access", desc: "Find & book workspace easily.", icon: "💼" },
        { title: "100+ Active Facilities", icon: "🏢" },
        { title: "Cool Customer Support", icon: "💬" },
        { title: "Built for Startups", desc: "Save cost & scale faster.", icon: "⚙️", button: "Explore Now" },
      ],
    },
  ],
  enablers: [
    {
      title: "Why Enablers Trust Cumma?",
      subtitle:
        "Cumma helps us showcase spaces to the right startups with real-time tracking and insights.",
      video: "/videos/enabler1.mp4",
      person: "Priya S",
      role: "Incubation Manager",
      highlights: [
        { title: "Visibility Boost", desc: "Manage everything from one dashboard.", icon: "📊" },
        { title: "Partner Access", desc: "Find & attract investors easily.", icon: "🤝" },
      ],
    },
  ],
};

// pages/career.tsx

import TestimonialsCarousel from "@/components/career/TestimonialsCarousel";

// import HeroSection from "./HeroSection";

export default function CareerPage() {
  return (
    <main>
    <section className="py-0">

        <TestimonialsCarousel />
{/* <HeroSection /> */}
      </section>
    </main>
  );
}

// pages/careers.tsx or pages/teams.tsx
// import { TeamCarousel } from './TeamCarousel';

// const teamMembers = [
//   {
//     name: "Sivashankar V",
//     role: "Product Designer",
//     testimonial: "I do admire the culture at Cumma, and I truly like that. It’s a place where passion blends with purpose...",
//     image: "/abhishek.jpg"
//   },
//   {
//     name: "Nisath Moorthi",
//     role: "Business Development",
//     testimonial: "I do admire the culture at Cumma, and I truly like that. It’s a place where passion blends with purpose...",
//     image: "/abhishek.jpg"
//   },
//    {
//     name: "Nisath Moorthi",
//     role: "Business Development",
//     testimonial: "I do admire the culture at Cumma, and I truly like that. It’s a place where passion blends with purpose...",
//     image: "/abhishek.jpg"
//   },
//   // Add more members as needed
// ];

// export default function CareersPage() {
//   return (
//     <main>
//       <h2 className="text-3xl font-bold mb-12">Team Testimonials</h2>
//       <TeamCarousel members={teamMembers} />
//     </main>
//   );
// }

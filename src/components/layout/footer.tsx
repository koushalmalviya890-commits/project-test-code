import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  // Support section data
  const supportData = {
    title: "Support",
    sections: [
      {
        label: "Need Free Customer Care?",
        value: "+91 87549 47666",
      },
      {
        label: "Need Live support?",
        value: "support@cumma.in",
      },
    ],
  };

  // Quick Links data
  const quickLinksData = {
    title: "Quick Links",
    links: [
      {
        name: "Co-Working Spaces",
        href: "/SearchPage?propertyTypes=Coworking space",
      },
      {
        name: "Research Facilities & Equipment",
        href: "/SearchPage?category=Equipment",
      },
      // { name: "Studio", href: "/SearchPage?type=Studio" },
      { name: "Bio-Labs", href: "/SearchPage?propertyTypes=Bio Allied" },
      {
        name: "Meeting Areas",
        href: "/SearchPage?propertyTypes=Meeting Room",
      },
    ],
  };

  // Popular Search data
  const popularSearchData = {
    title: "Enquiries",
    searches: [
      {
        name: "Startups Space Enquiry",
        href: "https://cumma.fillout.com/facility",
      },
      {
        name: "Suggest a New Space",
        href: "https://cumma.fillout.com/suggest",
      },
      // { name: "Incubation Centres", href: "/SearchPage?type=Incubation Centres" },
      // { name: "Studio Near Me", href: "/SearchPage?type=Studio" },
    ],
  };

  // Legal link data
  const legalData = {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms and Conditions", href: "/terms-and-conditions" },
      { name: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  };

  const companyData = {
    title: "Company",
    links: [
      { name: "About Us", href: "/about-us" },
      { name: "Careers", href: "/careers" },
      { name: "Teams", href: "/teams" },
    ],
  };

  // Social media icons with actual links (to be updated with real URLs)
  const socialIcons = [
    {
      icon: <Linkedin className="text-[#26bb4e] w-4 h-4" />,
      id: "linkedin",
      href: "https://www.linkedin.com/company/cummaindia/",
    },
    {
      icon: <Instagram className="text-[#26bb4e] w-4 h-4" />,
      id: "instagram",
      href: "https://www.instagram.com/cumma_india/",
    },
  ];

  return (
    <footer className="w-full bg-[#f7f7f7] py-10">
      <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Support Section */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start">
              <div className="flex flex-col gap-5 text-center md:text-left">
                <h2 className="font-extrabold text-2xl tracking-[0.32px] text-[#222222]">
                  {supportData.title}
                </h2>

                <div className="flex flex-col gap-5">
                  {supportData.sections.map((section, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <p className="text-base tracking-[0.20px] italic opacity-60 text-[#222222]">
                        {section.label}
                      </p>
                      {index === 0 ? (
                        <a
                          href={`tel:${section.value.replace(/\s+/g, "")}`}
                          className="text-base tracking-[0.20px] font-extrabold text-[#222222]"
                        >
                          {section.value}
                        </a>
                      ) : (
                        <a
                          href={`mailto:${section.value}`}
                          className="text-base tracking-[0.20px] font-extrabold text-[#222222]"
                        >
                          {section.value}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Section */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start">
              <div className="flex flex-col gap-[15px] text-center md:text-left">
                <h2 className="font-extrabold text-2xl tracking-[0.32px] text-[#222222]">
                  {quickLinksData.title}
                </h2>

                <div className="flex flex-col gap-[10px]">
                  {quickLinksData.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-sm tracking-[0.16px] font-normal text-[#222222] hover:text-[#26bb4e] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start">
              <div className="flex flex-col gap-[15px] text-center md:text-left">
                <h2 className="font-extrabold text-2xl tracking-[0.32px] text-[#222222]">
                  {companyData.title}
                </h2>

                <div className="flex flex-col gap-[10px]">
                  {companyData.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-sm tracking-[0.16px] font-normal text-[#222222] hover:text-[#26bb4e] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Search Section */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start">
              <div className="flex flex-col gap-[15px] text-center md:text-left">
                <h2 className="font-extrabold text-2xl tracking-[0.32px] text-[#222222]">
                  {popularSearchData.title}
                </h2>

                <div className="flex flex-col gap-[10px]">
                  {popularSearchData.searches.map((search, index) => (
                    <Link
                      key={index}
                      href={search.href}
                      className="text-sm tracking-[0.16px] font-normal text-[#222222] hover:text-[#26bb4e] transition-colors"
                    >
                      {search.name}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Section */}
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start">
              <div className="flex flex-col gap-[15px] text-center md:text-left">
                <h2 className="font-extrabold text-2xl tracking-[0.32px] text-[#222222]">
                  {legalData.title}
                </h2>

                <div className="flex flex-col gap-[10px]">
                  {legalData.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-sm tracking-[0.16px] font-normal text-[#222222] hover:text-[#26bb4e] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo and Social Media */}
        <div className="flex flex-col items-center mt-10 mb-6">
          <div className="relative w-[300px] h-[160px] scale-110">
            <Image
              src="/logo-green.png"
              alt="Cumma Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex gap-5 mt-2">
            {socialIcons.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#26bb4e] hover:opacity-80 transition-opacity"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs tracking-[3.5px] leading-[22px] text-[#222222]">
            ©️ 2025 by (cumma) IDAMUMAI TECHNOLOGIES PRIVATE LIMITED
          </p>
        </div>
      </div>
    </footer>
  );
}

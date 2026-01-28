// components/IncubationDevices.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react"; // Assuming you use lucide-react, or replace with your SVG
// import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Rocket } from "lucide-react";

const devices = [
  {
    label: "LabEquipment",
    icon: "/icons/categories/labspace.svg",
    side: "left",
    top: "10%",
  },
  {
    label: "Machines",
    icon: "/icons/categories/machine.svg",
    side: "left",
    top: "40%",
  },
  {
    label: "Studio",
    icon: "/icons/categories/video.svg",
    side: "left",
    top: "70%",
  },
  {
    label: "Equipment",
    icon: "/icons/categories/equipment.svg",
    side: "right",
    top: "10%",
  },
  {
    label: "Production",
    icon: "/icons/categories/production.svg",
    side: "right",
    top: "40%",
  },
  {
    label: "Podcasts",
    icon: "/icons/categories/podcast.svg",
    side: "right",
    top: "70%",
  },
];

interface IncubationDevicesProps {
  role?: "enabler" | "user";
  onRoleChange?: (role: "enabler" | "user") => void;
}

export default function IncubationDevices({
  role: roleProp,
  onRoleChange,
}: IncubationDevicesProps) {
  const [localRole, setLocalRole] = useState<"enabler" | "user">(
    roleProp ?? "enabler"
  );

  useEffect(() => {
    if (typeof roleProp !== "undefined") setLocalRole(roleProp);
  }, [roleProp]);

  const currentRole = roleProp ?? localRole;
  const setRoleHandler = (r: "enabler" | "user") => {
    if (onRoleChange) onRoleChange(r);
    else setLocalRole(r);
  };

  //  const { data: session } = useSession();
  const { user } = useAuth();
     const router = useRouter();


  return (
    <section className="relative w-full overflow-hidden py-4 md:py-10 bg-white isolate">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-green-400/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center w-[220px] sm:w-[300px] bg-white p-1.5 justify-between rounded-full shadow-sm border border-gray-300">
            <button
              onClick={() => setRoleHandler("user")}
              aria-pressed={currentRole === "user"}
              className={`hidden sm:flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2 text-sm font-medium rounded-full w-[130px] transition-colors ${currentRole === "user" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-2">
                I'm a User{" "}
                {currentRole === "user" && <ArrowUpRight className="w-4 h-4" />}
              </span>
            </button>
            <button
              onClick={() => setRoleHandler("user")}
              aria-pressed={currentRole === "user"}
              className={`block sm:hidden flex items-center gap-2 whitespace-nowrap px-6 py-2 text-sm font-medium rounded-full transition-colors ${currentRole === "user" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              User
              {currentRole === "user" && <ArrowUpRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRoleHandler("enabler")}
              aria-pressed={currentRole === "enabler"}
              className={`hidden sm:flex items-center gap-2 whitespace-nowrap px-6 py-2 ml-2 text-sm font-medium rounded-full transition-colors ${currentRole === "enabler" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <span className="flex items-center gap-2">
                I'm an Enabler{" "}
                {currentRole === "enabler" && (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </span>
            </button>
            <button
              onClick={() => setRoleHandler("enabler")}
              aria-pressed={currentRole === "enabler"}
              className={`block sm:hidden flex items-center gap-2 whitespace-nowrap px-6 py-2 ml-2 text-sm font-medium rounded-full transition-colors ${currentRole === "enabler" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Enabler
              {currentRole === "enabler" && (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="text-center mb-20">
          <span className="text-green-500 font-medium mb-2 block">
            {currentRole === "enabler" ? "You can list" : "You book"}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            {currentRole === "enabler" ? (
              <>
                Turn Your Facility into a{" "}
                <span className="text-green-500">Growth Hub</span>
              </>
            ) : (
              <>
                Find <span className="text-green-500">Facilities</span> That
                Fuel Your Next Big Idea
              </>
            )}{" "}
          </h2>
        </div>

        <div className="relative flex items-center justify-center ml-10 sm:ml-0min-h-[500px]">
          <div className="absolute inset-0 w-full hidden md:block max-w-5xl mx-auto pointer-events-none">
            {devices.map((d) => (
              <div
                key={d.label}
                className={`absolute ${d.side === "left" ? "left-0 lg:left-10" : "right-0 lg:right-10"}`}
                style={{ top: d.top }}
              >
                <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-3 shadow-lg shadow-green-100/50 backdrop-blur-md border border-white/50 transition-transform hover:scale-105">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-500">
                    <Image src={d.icon} alt={d.label} width={24} height={24} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {d.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* iPad Stack */}
          <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
            {/* Back iPad layer */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[520px] h-[380px]">
                <Image
                  src="/facility/shadow3.png"
                  alt="Back shadow"
                  fill
                  className="object-contain"
                />
                <Image
                  src="/facility/ipad3.png"
                  alt="Back iPad"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Middle iPad + shadow + rotated graph */}
            <div className="absolute inset-0 flex items-center justify-center translate-x-[-8%] translate-y-[-7%] rotate-[8deg] z-10">
              <div className="relative w-[300px] sm:w-[400px] h-[240px] sm:h-[300px]">
                <Image
                  src="/facility/shadow2.png"
                  alt="Middle shadow"
                  fill
                  className="object-contain"
                />
                <Image
                  src="/facility/ipad4.png"
                  alt="Middle iPad"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <img
              src="/facility/pencil.svg"
              alt="Decorative Pen"
              className="absolute z-50 -top-14 left-28 sm:left-48 w-20 h-40 pointer-events-none"
            />
            {/* Front iPad + shadow layer */}
            <div className="absolute inset-0 flex items-center justify-center translate-x-[-24%] rotate-[5deg] sm:rotate-[0deg] sm:translate-x-[-22%] translate-y-[-20%] z-20">
              <div className="relative w-[300px] sm:w-[400px] h-[240px] sm:h-[300px]">
                <Image
                  src="/facility/shadow1.png"
                  alt="Front shadow"
                  fill
                  className="object-contain"
                />
                <Image
                  src="/facility/ipad1.png"
                  alt="Front iPad"
                  fill
                  className="object-contain"
                />
                {/* Dashboard Image inside Front iPad */}
                <div
                  className={`absolute left-[70px] sm:left-[97px] top-[14px] h-[87%] sm:h-[90%] w-[52%] overflow-hidden rounded-3xl relative ${currentRole === "enabler" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  {/* Enabler image wrapper - different dimensions/fit */}
                  <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
                    <div className="relative w-full h-full">
                      <Image
                        src="/facility/graph.png"
                        alt="Dashboard preview enabler"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`absolute rotate-[8deg] left-[86px] sm:left-[110px] -top-[260px] sm:-top-[260px] h-[320px] sm:h-[280px] w-[45%] overflow-hidden rounded-3xl relative ${currentRole === "user" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src="/facility/picture2.png"
                        alt="Dashboard preview user"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <div className="block md:hidden mb-8">
          <div className="flex flex-col items-center gap-3 max-w-lg">
            {/* First row - 2 items */}
            <div className="flex gap-3 w-full justify-center">
              {devices.slice(0, 2).map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md border border-gray-200 transition-transform active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    <Image src={d.icon} alt={d.label} width={24} height={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Second row - 3 items */}
            <div className="flex gap-3 w-full justify-center flex-wrap">
              {devices.slice(2, 5).map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md border border-gray-200 transition-transform active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    <Image src={d.icon} alt={d.label} width={24} height={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Third row - 1 item centered */}
            <div className="flex gap-3 w-full justify-center">
              {devices.slice(5, 6).map((d) => (
                <div
                  key={d.label}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-md border border-gray-200 transition-transform active:scale-95"
                >
                  <div className="flex h-8 w-8 items-center justify-center">
                    <Image src={d.icon} alt={d.label} width={24} height={24} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom CTA Button (From Image) --- */}
        <div className="flex justify-center mt-12">
         {currentRole === "enabler" ? (
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-green-200 transition-all"
           onClick={() => {
                        // if (!session) {
                        if (!user) {
                          router.push("/sign-up/service-provider");
                        } else if (
                          // session.user?.userType === "Service Provider"
                          user?.userType === "Service Provider"
                        ) {
                          router.push("/service-provider/my-facilities");
                        } else {
                          toast.error(
                            "A Service Provider account is required to list facilities",
                            {
                              duration: 5000,
                              icon: (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              ),
                            }
                          );
                        }
                      }}
          
          >
            List Your Facility
          </button>
         ):(
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-green-200 transition-all"
           onClick={() => {
                        // if (!session) {
                        if (!user) {
                          router.push("/sign-up/startup");
                        } else if (
                          // session.user?.userType === "startup"
                        user?.userType === "startup"
                        ) {
                          router.push("/SearchPage");
                        } else {
                          toast.error(
                            "A Startup account is required to book facilities",
                            {
                              duration: 5000,
                              icon: (
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              ),
                            }
                          );
                        }
                      }}
          
          >
            Book a Facility
          </button>
         )}
        </div>
      </div>
    </section>
  );
}

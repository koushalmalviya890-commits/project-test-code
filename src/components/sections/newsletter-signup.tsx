"use client"
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const apiUrl = "http://localhost:3001";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${apiUrl}/api/newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message); // replace with toast later
        setEmail("");
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      alert("Failed to subscribe");
    }
  };

  return (
    <div className="w-full px-4 py-8 md:py-12 flex justify-center">
      <div className="w-full max-w-[1200px]">
        <Card className="w-full sm:h-[180px] md:h-[235px] bg-[#23BB4E] rounded-3xl shadow-none border-none px-8 md:px-16 py-6 md:py-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Keep yourself
            </h2>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              upto date
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-[400px]">
                <Input
                  type="email"
                  placeholder="Enter Your Email Id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 md:h-14 px-4 py-2 bg-transparent text-white placeholder:text-white/80 border-white rounded-xl w-full"
                />
              </div>
              <Button 
                type="submit"
                className="h-12 md:h-14 px-6 py-2 bg-white text-[#58b571] hover:bg-white/90 rounded-xl font-medium w-full md:w-auto"
              >
                Subscribe
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 
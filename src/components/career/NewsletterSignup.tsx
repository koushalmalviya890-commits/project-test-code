"use client"
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import React, { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
   // console.log("Subscribing email:", email);
    // Reset the form
    setEmail("");
    // You could add success notification here
  };

  return (
    <div className="w-full px-4 py-8 md:py-12 flex justify-center">
      <div className="w-full max-w-[1200px]">
        <Card className="w-full sm:h-[180px] md:h-[235px] bg-[#23BB4E] rounded-3xl shadow-none border-none px-8 md:px-16 py-6 md:py-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Get latest
            </h2>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
             job updates
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
                  className="h-12 md:h-14 px-4 py-2 bg-transparent text-white placeholder:text-white border-white rounded-xl w-full"
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
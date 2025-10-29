"use client";

import { RoleLayout } from "@/components/role-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Radio } from "lucide-react";

export default function ChaserChatPage() {
  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Communications
            </h1>
            <Badge className="bg-[#34C759] hover:bg-[#34C759] text-white">
              Online
            </Badge>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <MessageCircle
            className="h-32 w-32 text-gray-300 mb-6"
            strokeWidth={1}
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Chat Feature Coming Soon
          </h2>
          <p className="text-gray-500 mb-12 max-w-sm text-center">
            Real-time chat with supervisors and team members will be available
            in the next update
          </p>

          {/* Emergency Communication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              className="flex-1 bg-[#FF3B30] hover:bg-[#D32F2F] text-white py-8 text-lg font-semibold rounded-xl shadow-lg"
              onClick={() => {
                // In production, this would trigger the emergency call
                window.location.href = "tel:911";
              }}
            >
              <Phone className="h-6 w-6 mr-3" />
              Emergency Call
            </Button>
            <Button
              className="flex-1 bg-[#FF3B30] hover:bg-[#D32F2F] text-white py-8 text-lg font-semibold rounded-xl shadow-lg"
              onClick={() => {
                // In production, this would open push-to-talk
                console.log("Push to Talk activated");
              }}
            >
              <Radio className="h-6 w-6 mr-3" />
              Push to Talk
            </Button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check } from "lucide-react";

// Firefighter-themed avatar collection
// Will be populated with actual images once formatted
export const FIREFIGHTER_AVATARS = [
  // Cartoon Firefighters
  { id: "ff-hero-1", name: "Hero", category: "cartoon", path: "/avatars/hero-1.png" },
  { id: "ff-hero-2", name: "Chief", category: "cartoon", path: "/avatars/hero-2.png" },
  { id: "ff-hero-3", name: "Rookie", category: "cartoon", path: "/avatars/hero-3.png" },
  { id: "ff-hero-4", name: "Veteran", category: "cartoon", path: "/avatars/hero-4.png" },
  
  // Equipment
  { id: "ff-helmet", name: "Helmet", category: "equipment", path: "/avatars/helmet.png" },
  { id: "ff-axe", name: "Axe", category: "equipment", path: "/avatars/axe.png" },
  { id: "ff-truck", name: "Truck", category: "equipment", path: "/avatars/truck.png" },
  { id: "ff-hydrant", name: "Hydrant", category: "equipment", path: "/avatars/hydrant.png" },
  
  // Badges
  { id: "ff-badge-1", name: "Badge", category: "badge", path: "/avatars/badge-1.png" },
  { id: "ff-maltese", name: "Maltese", category: "badge", path: "/avatars/maltese.png" },
  { id: "ff-star", name: "Star", category: "badge", path: "/avatars/star.png" },
  
  // Mascots
  { id: "ff-dalmatian", name: "Dalmatian", category: "mascot", path: "/avatars/dalmatian.png" },
  { id: "ff-phoenix", name: "Phoenix", category: "mascot", path: "/avatars/phoenix.png" },
  
  // Action
  { id: "ff-action-1", name: "Rescue", category: "action", path: "/avatars/action-1.png" },
  { id: "ff-action-2", name: "Victory", category: "action", path: "/avatars/action-2.png" },
];

const CATEGORIES = [
  { id: "all", name: "All", emoji: "🔥" },
  { id: "cartoon", name: "Characters", emoji: "🧑‍🚒" },
  { id: "equipment", name: "Equipment", emoji: "🚒" },
  { id: "badge", name: "Badges", emoji: "🎖️" },
  { id: "mascot", name: "Mascots", emoji: "🐶" },
  { id: "action", name: "Action", emoji: "💪" },
];

interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

export function AvatarPicker({ currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");

  const filteredAvatars =
    selectedCategory === "all"
      ? FIREFIGHTER_AVATARS
      : FIREFIGHTER_AVATARS.filter((avatar) => avatar.category === selectedCategory);

  const handleSelect = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onClose();
    }
  };

  return (
    <Card className="border-0 shadow-2xl max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Choose Your Avatar</CardTitle>
            <CardDescription>
              Pick a firefighter-themed avatar for your profile
            </CardDescription>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-500">
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="h-10 px-4"
            >
              <span className="mr-2">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
          {filteredAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`relative w-full aspect-square rounded-xl transition-all hover:scale-105 ${
                selectedAvatar === avatar.id
                  ? "ring-4 ring-blue-600 shadow-xl"
                  : "ring-2 ring-gray-200 hover:ring-blue-400"
              }`}
            >
              {/* Placeholder - will be replaced with actual image */}
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center text-4xl">
                {CATEGORIES.find((c) => c.id === avatar.category)?.emoji || "🔥"}
              </div>

              {/* Selected Check */}
              {selectedAvatar === avatar.id && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}

              {/* Avatar Name */}
              <p className="text-xs font-medium text-gray-700 mt-2 text-center">
                {avatar.name}
              </p>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> Your avatar will appear in chat, on your profile,
            and in the team directory. Choose one that represents you!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSelect}
            disabled={!selectedAvatar}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
          >
            Save Avatar
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 border-2 font-semibold rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


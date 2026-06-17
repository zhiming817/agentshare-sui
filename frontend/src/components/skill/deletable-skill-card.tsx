"use client";

import { SkillCard } from "./skill-card";
import { DeleteButton } from "@/components/social/delete-button";

interface DeletableSkillCardProps {
  skill: {
    id: string;
    name: string;
    description: string | null;
    likeCount: number;
  };
  isOwnProfile: boolean;
}

export function DeletableSkillCard({
  skill,
  isOwnProfile,
}: DeletableSkillCardProps) {
  if (!isOwnProfile) {
    return <SkillCard skill={skill} />;
  }

  return (
    <div className="group relative">
      <SkillCard skill={skill} />
      <div className="absolute right-2 top-2">
        <DeleteButton targetType="skill" targetId={skill.id} />
      </div>
    </div>
  );
}

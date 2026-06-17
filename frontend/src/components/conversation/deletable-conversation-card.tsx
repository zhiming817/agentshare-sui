"use client";

import { ConversationCard } from "./conversation-card";
import { DeleteButton } from "@/components/social/delete-button";

interface DeletableConversationCardProps {
  conversation: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    bookmarkCount: number;
    commentCount: number;
    messageCount: number;
    tags: string[];
    createdAt: string;
    sourceType: string;
    user: {
      id: string;
      nickname: string;
      avatar: string | null;
    };
  };
  isOwnProfile: boolean;
}

export function DeletableConversationCard({
  conversation,
  isOwnProfile,
}: DeletableConversationCardProps) {
  if (!isOwnProfile) {
    return <ConversationCard conversation={conversation} />;
  }

  return (
    <div className="group relative">
      <ConversationCard conversation={conversation} />
      <div className="absolute right-2 top-2">
        <DeleteButton targetType="conversation" targetId={conversation.id} />
      </div>
    </div>
  );
}

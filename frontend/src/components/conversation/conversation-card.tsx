import Link from "next/link";
import { SourceBadge } from "./source-badge";

interface ConversationCardProps {
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
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  return (
    <Link href={`/conversation/${conversation.id}`}>
      <div className="border border-border rounded-lg p-4 hover:border-foreground/20 transition-colors">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">
          {conversation.title}
        </h3>
        {conversation.description && (
          <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
            {conversation.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="font-medium text-foreground">
            {conversation.user.nickname}
          </span>
          <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{conversation.likeCount} likes</span>
          <span>{conversation.viewCount} views</span>
          <span>{conversation.messageCount} messages</span>
          <SourceBadge sourceType={conversation.sourceType} size="sm" />
          {conversation.price > 0 && (
            <span className="text-foreground font-medium">
              {conversation.price} AGT
            </span>
          )}
          {conversation.price === 0 && (
            <span className="text-green-600">Free</span>
          )}
        </div>
        {conversation.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {conversation.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

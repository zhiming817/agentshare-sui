interface SkillCardProps {
  skill: {
    id: string;
    name: string;
    description: string | null;
    likeCount: number;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium">{skill.name}</h3>
      {skill.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {skill.description}
        </p>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        {skill.likeCount} likes
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import Link from "next/link";

export default async function SkillsPage() {
  const skills = await db.skill.findMany({
    orderBy: { likeCount: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, nickname: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Skills</h1>
        <p className="text-muted-foreground text-sm">
          Browse agent skills shared by the community.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
          No skills shared yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="border border-border rounded-lg p-4"
            >
              <h3 className="font-medium text-sm mb-1">{skill.name}</h3>
              {skill.description && (
                <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                  {skill.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Link
                  href={`/user/${skill.user.id}`}
                  className="hover:text-foreground"
                >
                  {skill.user.nickname}
                </Link>
                <span>{skill.likeCount} likes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

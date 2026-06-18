import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadClient } from "./upload-client";

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      apiKey: true,
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">上传对话</h1>
      <UploadClient apiKey={user.apiKey} />
    </div>
  );
}

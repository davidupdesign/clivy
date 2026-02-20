// @ts-nocheck

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

//
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    include: {
      entries: {
        orderBy: { createdAt: "desc" },
        include: {
          tags: true,
          _count: {
            select: { pageViews: true },
          },
        },
      },
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">/{project.slug}</p>
        </div>
        <Link href={`/dashboard/${projectId}/new`}>
          <Button>New Entry</Button>
        </Link>
      </div>

      {project.entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No changelog entries yet.
            </p>
            <Link href={`/dashboard/${projectId}/new`}>
              <Button>Create your first entry</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {project.entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/dashboard/${projectId}/${entry.id}/edit`}
            >
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        entry.status === "published"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <CardDescription>
                    v{entry.version} &middot;{" "}
                    {new Date(entry.createdAt).toLocaleDateString()} &middot;{" "}
                    {entry._count.pageViews} views
                  </CardDescription>
                </CardHeader>
                {entry.tags.length > 0 && (
                  <CardContent>
                    <div className="flex gap-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// @ts-nocheck

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectDetail from "./project-detail";

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
      subscribers: {
        where: { active: true },
        orderBy: { subscribedAt: "desc" },
      },
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  // Serialize dates for client component
  const serialized = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    entries: project.entries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      publishedAt: entry.publishedAt?.toISOString() ?? null,
    })),
    subscribers: project.subscribers.map((sub) => ({
      ...sub,
      subscribedAt: sub.subscribedAt.toISOString(),
    })),
  };

  return <ProjectDetail project={serialized} />;
}

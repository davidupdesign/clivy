// @ts-nocheck

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Eye } from "lucide-react";
import ProjectSort from "@/components/project-sort";
import AnimatedCard from "@/components/animated-card";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { sort = "modified" } = await searchParams;

  const projects = await prisma.project.findMany({
    where: { userId: session!.user.id },
    include: {
      _count: {
        select: {
          entries: true,
          subscribers: true,
        },
      },
      entries: {
        select: {
          updatedAt: true,
          _count: {
            select: { pageViews: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Sum up total views + find latest entry date per project
  const projectsWithViews = projects.map((project) => {
    const latestEntryDate = project.entries.reduce((latest, entry) => {
      const d = new Date(entry.updatedAt);
      return d > latest ? d : latest;
    }, new Date(project.createdAt));

    return {
      ...project,
      totalViews: project.entries.reduce(
        (sum, entry) => sum + entry._count.pageViews,
        0,
      ),
      lastModified: latestEntryDate,
    };
  });

  // Sort based on query param
  const sorted = [...projectsWithViews].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "modified":
      default:
        return b.lastModified.getTime() - a.lastModified.getTime();
    }
  });

  return (
    <div>
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage your changelog projects
          </p>
        </div>
        <Link href="/dashboard/new-project">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="border border-dashed rounded-xl py-16 text-center">
          <p className="text-muted-foreground mb-1">
            No projects yet
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first project to get started.
          </p>
          <Link href="/dashboard/new-project">
            <Button>
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end mb-4">
            <ProjectSort />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((project, index) => (
              <AnimatedCard key={project.id} index={index}>
                <Link href={`/dashboard/${project.id}`}>
                  <div className="border rounded-xl p-7 hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-lg font-semibold group-hover:text-foreground transition-colors">
                          {project.name}
                        </p>
                        <p className="text-base text-muted-foreground">
                          {project.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-5 text-base text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        {project._count.entries}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {project._count.subscribers}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {project.totalViews.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

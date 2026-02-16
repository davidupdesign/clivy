// @ts-nocheck

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  //login check
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug } = await request.json();

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Name and slug are required" },
      { status: 400 },
    );
  }

  //slug availability check
  const existingProject = await prisma.project.findFirst({
    where: { slug },
  });

  if (existingProject) {
    return NextResponse.json(
      { error: "A project with this slug already exists" },
      { status: 409 },
    );
  }

  //creating and linking to the user
  const project = await prisma.project.create({
    data: {
      name,
      slug,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}

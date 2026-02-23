import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

// strip markdown to create a plain text snippet for the email preview
function createSnippet(body: string, maxLength = 200): string {
  const plain = body
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return plain.length > maxLength
    ? plain.slice(0, maxLength) + "..."
    : plain;
}

function buildEmailHtml(params: {
  projectName: string;
  entryTitle: string;
  version: string;
  snippet: string;
  changelogUrl: string;
}): string {
  const { projectName, entryTitle, version, snippet, changelogUrl } = params;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0; font-size: 20px; color: #111;">${projectName}</h2>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
        <div style="margin-bottom: 8px;">
          <span style="display: inline-block; background: #f3f4f6; color: #374151; font-size: 13px; font-weight: 600; padding: 2px 10px; border-radius: 9999px;">${version}</span>
        </div>
        <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #111;">${entryTitle}</h1>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4b5563;">${snippet}</p>
        <a href="${changelogUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">Read full update</a>
      </div>
      <div style="text-align: center; margin-top: 32px;">
        <p style="font-size: 12px; color: #9ca3af;">You're receiving this because you subscribed to ${projectName} updates.</p>
      </div>
    </div>
  `;
}

export async function sendPublishNotification(entryId: string): Promise<void> {
  // skip if resend is not configured
  if (!process.env.RESEND_API_KEY) return;

  try {
    // fetch entry with project info
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: { project: true },
    });

    if (!entry) return;

    // guard: already sent or not published
    if (entry.emailNotificationSent || entry.status !== "published") return;

    // fetch active email subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: {
        projectId: entry.projectId,
        active: true,
        channel: "email",
        email: { not: null },
      },
    });

    if (subscribers.length === 0) {
      await prisma.entry.update({
        where: { id: entryId },
        data: { emailNotificationSent: true },
      });
      return;
    }

    // build email content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const changelogUrl = `${baseUrl}/changelog/${entry.project.slug}`;
    const snippet = createSnippet(entry.body);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const html = buildEmailHtml({
      projectName: entry.project.name,
      entryTitle: entry.title,
      version: entry.version,
      snippet,
      changelogUrl,
    });

    // send in batches of 100 (resend batch limit)
    const emails = subscribers
      .filter((s) => s.email)
      .map((s) => ({
        from: `${entry.project.name} via Clivy <${fromEmail}>`,
        to: s.email!,
        subject: `${entry.title} — ${entry.project.name}`,
        html,
      }));

    const BATCH_SIZE = 100;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      await resend.batch.send(batch);
    }

    // mark as sent to prevent duplicates
    await prisma.entry.update({
      where: { id: entryId },
      data: { emailNotificationSent: true },
    });
  } catch (error) {
    console.error(`Failed to send notification for entry ${entryId}:`, error);
    // don't mark as sent on failure so it can be retried
  }
}

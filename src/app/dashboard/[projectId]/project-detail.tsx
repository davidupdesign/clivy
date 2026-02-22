// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import DashboardTabs from "@/components/dashboard-tabs";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  Users,
  TrendingUp,
} from "lucide-react";

const TABS = [
  { key: "entries", label: "Entries" },
  { key: "subscribers", label: "Subscribers" },
  { key: "analytics", label: "Analytics" },
];

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scheduled: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center text-sm font-medium px-2.5 py-1 rounded-md border capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

export default function ProjectDetail({ project }: { project: any }) {
  const [activeTab, setActiveTab] = useState("entries");
  const [subscribers, setSubscribers] = useState(project.subscribers);
  const router = useRouter();

  const totalViews = project.entries.reduce(
    (sum, e) => sum + e._count.pageViews,
    0,
  );

  const topEntry = project.entries.length
    ? project.entries.reduce((top, e) =>
        e._count.pageViews > top._count.pageViews ? e : top,
      )
    : null;

  const maxViews = topEntry ? topEntry._count.pageViews : 1;

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    const response = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
    if (response.ok) router.refresh();
  };

  const handleRemoveSubscriber = async (subscriberId: string) => {
    const response = await fetch(`/api/subscribers/${subscriberId}`, { method: "DELETE" });
    if (response.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Projects
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-base text-muted-foreground mt-1">{project.slug}</p>
          </div>
          <a
            href={`/changelog/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              View Changelog
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <DashboardTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ========== Entries Tab ========== */}
        {activeTab === "entries" && (
          <motion.div
            key="entries"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-6">
              <Link href={`/dashboard/${project.id}/new`}>
                <Button size="lg">
                  <Plus className="h-4 w-4" />
                  New Entry
                </Button>
              </Link>
            </div>

            {project.entries.length === 0 ? (
              <div className="border border-dashed rounded-xl py-20 text-center">
                <p className="text-lg text-muted-foreground mb-1">No entries yet</p>
                <p className="text-base text-muted-foreground mb-6">
                  Create your first changelog entry.
                </p>
                <Link href={`/dashboard/${project.id}/new`}>
                  <Button size="lg">
                    <Plus className="h-4 w-4" />
                    Create entry
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Title</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Version</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Tags</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-muted-foreground">Views</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-muted-foreground w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.entries.map((entry, index) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/${project.id}/${entry.id}/edit`)
                        }
                      >
                        <td className="px-5 py-4 text-base font-medium w-[40%]">
                          <div className="truncate" style={{ maskImage: "linear-gradient(to right, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)" }}>
                            {entry.title}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-base font-bold text-muted-foreground w-[90px]">
                          v{entry.version}
                        </td>
                        <td className="px-5 py-4 w-[130px]">
                          <div className="flex gap-2 items-center">
                            {entry.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="text-sm font-medium px-2.5 py-0.5 rounded-md whitespace-nowrap uppercase"
                                style={{
                                  backgroundColor: tag.color + "15",
                                  color: tag.color,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {entry.tags.length > 2 && (
                              <span className="text-sm text-muted-foreground font-medium">
                                +{entry.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="px-5 py-4 text-base text-muted-foreground">
                          {entry.publishedAt
                            ? new Date(entry.publishedAt).toLocaleDateString()
                            : new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right text-base text-muted-foreground">
                          {entry._count.pageViews}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div
                            className="flex gap-1.5 justify-end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/dashboard/${project.id}/${entry.id}/edit`}>
                              <button
                                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              title="Delete"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ========== Subscribers Tab ========== */}
        {activeTab === "subscribers" && (
          <motion.div
            key="subscribers"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {subscribers.length === 0 ? (
              <div className="border border-dashed rounded-xl py-20 text-center">
                <p className="text-lg text-muted-foreground mb-1">No subscribers yet</p>
                <p className="text-base text-muted-foreground">
                  Subscribers will appear here once people subscribe to your changelog.
                </p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Channel</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">Subscribed</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-muted-foreground w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub, index) => (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-4 text-base font-medium">{sub.email || sub.phone}</td>
                        <td className="px-5 py-4 text-base text-muted-foreground capitalize">
                          {sub.channel}
                        </td>
                        <td className="px-5 py-4 text-base text-muted-foreground">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                            onClick={() => handleRemoveSubscriber(sub.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ========== Analytics Tab ========== */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
              {[
                { icon: Eye, label: "Total views", value: totalViews.toLocaleString(), large: true },
                { icon: Users, label: "Subscribers", value: subscribers.length, large: true },
                { icon: TrendingUp, label: "Top entry", value: topEntry ? topEntry.title : "—", large: false },
              ].map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.08 }}
                  className="border rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 text-base text-muted-foreground mb-3">
                    <card.icon className="h-5 w-5" />
                    {card.label}
                  </div>
                  <p className={`font-bold tracking-tight truncate ${card.large ? "text-4xl" : "text-xl font-semibold"}`}>
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Entries by views */}
            {project.entries.length === 0 ? (
              <div className="border border-dashed rounded-xl py-20 text-center">
                <p className="text-base text-muted-foreground">No entries to analyze yet.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-medium text-muted-foreground mb-6">
                  Views by entry
                </h3>
                <div className="space-y-4">
                  {[...project.entries]
                    .sort((a, b) => b._count.pageViews - a._count.pageViews)
                    .map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.05 }}
                        className="flex items-center gap-5"
                      >
                        <span className="text-base w-56 truncate shrink-0">
                          {entry.title}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className="bg-foreground h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${maxViews > 0 ? (entry._count.pageViews / maxViews) * 100 : 0}%`,
                            }}
                            transition={{ duration: 0.5, delay: index * 0.05 + 0.2, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-base text-muted-foreground w-14 text-right shrink-0 tabular-nums">
                          {entry._count.pageViews}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

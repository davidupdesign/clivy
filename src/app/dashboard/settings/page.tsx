// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardTabs from "@/components/dashboard-tabs";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
};

type Subscriber = {
  id: string;
  email: string | null;
  phone: string | null;
  channel: string;
  active: boolean;
  subscribedAt: string;
};

const TABS = [
  { key: "account", label: "Account" },
  { key: "projects", label: "Projects" },
  { key: "subscribers", label: "Subscribers" },
];

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();

  // tab state — reads ?tab= from url so links can open a specific tab directly
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "account");

  // account state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editWebsite, setEditWebsite] = useState("");

  // subscribers state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  // populate name and email once session loads
  useEffect(() => {
    if (session?.user) {
      queueMicrotask(() => {
        setName(session.user.name || "");
        setEmail(session.user.email || "");
      });
    }
  }, [session]);

  // loading projects on mount
  useEffect(() => {
    async function fetchProjects() {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    }
    fetchProjects();
  }, []);

  // loading subscribers when a project is selected
  useEffect(() => {
    if (!selectedProjectId) return;

    async function fetchSubscribers() {
      const response = await fetch(
        `/api/subscribers?projectId=${selectedProjectId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers);
      }
    }
    fetchSubscribers();
  }, [selectedProjectId]);

  // --- account handlers ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error);
      return;
    }

    toast.success("Profile updated successfully");

    await update({
      name,
      email,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Both password fields are required");
      return;
    }

    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error);
      return;
    }

    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account and all data.",
      )
    ) {
      return;
    }

    const typed = window.prompt('Type "DELETE" to confirm');
    if (typed !== "DELETE") return;

    const response = await fetch("/api/user", {
      method: "DELETE",
    });

    if (response.ok) {
      signOut({ callbackUrl: "/" });
    }
  };

  // --- project handlers ---

  const handleStartEdit = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setEditSlug(project.slug);
    setEditWebsite(project.website || "");
  };

  const handleSaveProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug, website: editWebsite || null }),
    });

    const data = await response.json();

    if (response.ok) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, name: editName, slug: editSlug, website: editWebsite || null } : p,
        ),
      );
      setEditingProject(null);
      toast.success("Project updated");
    } else {
      toast.error(data.error || "Failed to save");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Delete this project and all its entries?")) return;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    }
  };

  // --- subscriber handlers ---

  const handleRemoveSubscriber = async (subscriberId: string) => {
    const response = await fetch(`/api/subscribers/${subscriberId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
      toast.success("Subscriber removed");
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">
          Manage your account, projects, and subscribers
        </p>
      </div>

      <DashboardTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {/* ========== Account Tab ========== */}
        {activeTab === "account" && (
          <motion.div
            key="account"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-lg space-y-0"
          >
            {/* Profile section */}
            <section>
              <h2 className="text-lg font-medium mb-5">Profile information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <Button type="submit" size="lg">
                  Save
                </Button>
              </form>
            </section>

            <hr className="my-10" />

            {/* Password section */}
            <section>
              <h2 className="text-lg font-medium mb-5">Change password</h2>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-base">
                    Current password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-base">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                <Button type="submit" size="lg">
                  Update password
                </Button>
              </form>
            </section>

            <hr className="my-10" />

            {/* Danger zone */}
            <section>
              <h2 className="text-lg font-medium text-red-600 mb-2">
                Danger zone
              </h2>
              <p className="text-base text-muted-foreground mb-5">
                Delete your account and all data permanently.
              </p>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </section>
          </motion.div>
        )}

        {/* ========== Projects Tab ========== */}
        {activeTab === "projects" && (
          <motion.div
            key="projects"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {projects.length === 0 ? (
              <div className="border border-dashed rounded-xl py-20 text-center">
                <p className="text-lg text-muted-foreground mb-1">
                  No projects yet
                </p>
                <p className="text-base text-muted-foreground">
                  Create a project from the Projects page.
                </p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">
                        Project
                      </th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-muted-foreground w-40">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <AnimatePresence mode="wait">
                            {editingProject === project.id ? (
                              <motion.div
                                key="editing"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="flex gap-3"
                              >
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Project name"
                                  className="h-10 text-base"
                                />
                                <Input
                                  value={editSlug}
                                  onChange={(e) => setEditSlug(e.target.value)}
                                  placeholder="project-slug"
                                  className="h-10 text-base"
                                />
                                <Input
                                  value={editWebsite}
                                  onChange={(e) => setEditWebsite(e.target.value)}
                                  placeholder="https://yoursite.com"
                                  className="h-10 text-base"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="viewing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <p className="text-base font-medium">
                                  {project.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {project.slug}
                                </p>
                                {project.website && (
                                  <a
                                    href={project.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {project.website}
                                  </a>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <AnimatePresence mode="wait">
                            {editingProject === project.id ? (
                              <motion.div
                                key="edit-actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex gap-2 justify-end"
                              >
                                <Button
                                  type="button"
                                  onClick={() => handleSaveProject(project.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingProject(null)}
                                >
                                  Cancel
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="view-actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex gap-3 justify-end"
                              >
                                <button
                                  className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  onClick={() => handleStartEdit(project)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-base text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                  onClick={() => handleDeleteProject(project.id)}
                                >
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
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
            {/* Project selector */}
            <div className="space-y-2 mb-8 max-w-sm">
              <Label className="text-base">Select Project</Label>
              <select
                className="w-full border rounded-lg px-3 py-2.5 bg-background text-base cursor-pointer"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Choose a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subscriber list */}
            <AnimatePresence mode="wait">
              {selectedProjectId && (
                <motion.div
                  key={selectedProjectId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {subscribers.length === 0 ? (
                    <div className="border border-dashed rounded-xl py-20 text-center">
                      <p className="text-lg text-muted-foreground mb-1">
                        No subscribers yet
                      </p>
                      <p className="text-base text-muted-foreground">
                        Subscribers will appear here once people subscribe to your
                        changelog.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">
                              Email
                            </th>
                            <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">
                              Channel
                            </th>
                            <th className="text-left px-5 py-4 text-sm font-medium text-muted-foreground">
                              Subscribed
                            </th>
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
                              <td className="px-5 py-4 text-base font-medium">
                                {sub.email || sub.phone}
                              </td>
                              <td className="px-5 py-4 text-base text-muted-foreground capitalize">
                                {sub.channel}
                              </td>
                              <td className="px-5 py-4 text-base text-muted-foreground">
                                {new Date(sub.subscribedAt).toLocaleDateString()}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  className="text-base text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

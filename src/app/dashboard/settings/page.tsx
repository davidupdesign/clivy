// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  slug: string;
};

type Subscriber = {
  id: string;
  email: string | null;
  phone: string | null;
  channel: string;
  active: boolean;
  subscribedAt: string;
};

export default function SettingsPage() {
  const { data: session, update } = useSession();

  // tab state — controls which section is shown
  const [activeTab, setActiveTab] = useState<
    "account" | "projects" | "subscribers"
  >("account");

  // acc state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");

  // projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [projectMessage, setProjectMessage] = useState("");

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

  // --- acc handlers ---

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMessage("");
    setAccountError("");

    const response = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAccountError(data.error);
      return;
    }

    setAccountMessage("Profile updated successfully");

    //refreshing session token with new name/email
    await update({
      name,
      email,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountMessage("");
    setAccountError("");

    if (!currentPassword || !newPassword) {
      setAccountError("Both password fields are required");
      return;
    }

    const response = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAccountError(data.error);
      return;
    }

    setAccountMessage("Password changed successfully");
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

    // double confirmation for destructive action
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
  };

  const handleSaveProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, slug: editSlug }),
    });

    if (response.ok) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, name: editName, slug: editSlug } : p,
        ),
      );
      setEditingProject(null);
      setProjectMessage("Project updated");
      setTimeout(() => setProjectMessage(""), 3000);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Delete this project and all its entries?")) return;

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  // --- sub handlers ---

  const handleRemoveSubscriber = async (subscriberId: string) => {
    const response = await fetch(`/api/subscribers/${subscriberId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
    }
  };

  // tab button styling helper
  const tabClass = (tab: string) =>
    `px-4 py-2 text-sm rounded-md transition-colors ${
      activeTab === tab
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted"
    }`;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* tab nav */}
      <div className="flex gap-2 mb-8">
        <button
          className={tabClass("account")}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
        <button
          className={tabClass("projects")}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={tabClass("subscribers")}
          onClick={() => setActiveTab("subscribers")}
        >
          Subscribers
        </button>
        <button
          className="px-4 py-2 text-sm rounded-md hover:bg-muted text-red-600"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </button>
      </div>

      {/* ========== acc tab ========== */}
      {activeTab === "account" && (
        <div className="space-y-8 max-w-lg">
          {/* Profile form */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your name and email</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          {/* changing password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* messages */}
          {accountMessage && (
            <p className="text-sm text-green-600">{accountMessage}</p>
          )}
          {accountError && (
            <p className="text-sm text-red-500">{accountError}</p>
          )}

          {/* danger zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========== projects tab ========== */}
      {activeTab === "projects" && (
        <div className="space-y-4 max-w-lg">
          {projectMessage && (
            <p className="text-sm text-green-600">{projectMessage}</p>
          )}

          {projects.length === 0 ? (
            <p className="text-muted-foreground">No projects yet.</p>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="pt-6">
                  {editingProject === project.id ? (
                    // edit mode
                    <div className="space-y-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Project name"
                      />
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        placeholder="project-slug"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveProject(project.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // display mode
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          /{project.slug}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(project)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ========== subscribers tab ========== */}
      {activeTab === "subscribers" && (
        <div className="space-y-4 max-w-lg">
          {/* project selector */}
          <div className="space-y-2">
            <Label>Select Project</Label>
            <select
              className="w-full border rounded-md p-2 bg-background"
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

          {/* sub list */}
          {selectedProjectId && (
            <>
              <p className="text-sm text-muted-foreground">
                {subscribers.length} subscriber{subscribers.length !== 1 && "s"}
              </p>

              {subscribers.length === 0 ? (
                <p className="text-muted-foreground">
                  No subscribers for this project yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {subscribers.map((sub) => (
                    <Card key={sub.id}>
                      <CardContent className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm">{sub.email || sub.phone}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.channel} &middot;{" "}
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveSubscriber(sub.id)}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

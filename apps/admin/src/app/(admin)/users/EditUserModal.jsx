"use client";

import { useRef, useState } from "react";
import { Camera, ExternalLink, Mail, MapPin, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";
const initialForm = {
  fullName: "",
  username: "",
  email: "",
  location: "",
  bio: "",
  website: "",
  twitter: "",
  linkedin: "",
  github: "",
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const cleanHandle = (value = "") => value.trim().replace(/^@/, "");

export function EditUserModal({ isOpen, onClose, user, onUpdate, submitting }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    fullName: user?.fullName || "",
    username: user?.username || "",
    email: user?.email || "",
    location: user?.location || "",
    bio: user?.bio || "",
    website: user?.socials?.website || "",
    twitter: cleanHandle(user?.socials?.twitter),
    linkedin: cleanHandle(user?.socials?.linkedin),
    github: cleanHandle(user?.socials?.github),
  }));
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(() =>
    user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${STORAGE_URL}${user.avatar}`
      : "",
  );
  const inputRef = useRef(null);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("fullName", form.fullName.trim());
    data.append("username", form.username.trim().toLowerCase());
    data.append("email", form.email.trim().toLowerCase());
    data.append("location", form.location.trim());
    data.append("bio", form.bio.trim());
    data.append(
      "socials",
      JSON.stringify({
        website: form.website.trim(),
        twitter: cleanHandle(form.twitter),
        linkedin: cleanHandle(form.linkedin),
        github: cleanHandle(form.github),
      }),
    );
    if (avatarFile) data.append("avatar", avatarFile);
    await onUpdate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-2xl">
        <form onSubmit={submit} className="flex max-h-[92vh] flex-col">
          <div className="border-b border-zinc-100 px-6 py-6 dark:border-zinc-900 sm:px-8">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
                Update user
              </DialogTitle>
              <DialogDescription>
                Change public profile information for @{user?.username}. Role
                and account status are managed separately.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="overflow-y-auto px-6 py-6 sm:px-8">
            <section className="flex flex-col gap-5 border-b border-zinc-100 pb-6 dark:border-zinc-900 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 border border-zinc-200 dark:border-zinc-800">
                <AvatarImage
                  src={preview}
                  alt={form.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-black">
                  {initials(form.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={chooseAvatar}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" /> Change photo
                </Button>
                <p className="mt-2 text-xs text-zinc-400">
                  PNG, JPG or WebP. Keep files reasonably small.
                </p>
              </div>
            </section>

            <section className="space-y-4 py-6">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Identity
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Core account and public profile information.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" icon={UserRound}>
                  <Input
                    required
                    value={form.fullName}
                    onChange={updateField("fullName")}
                  />
                </Field>
                <Field label="Username">
                  <Input
                    required
                    minLength={3}
                    value={form.username}
                    onChange={updateField("username")}
                  />
                </Field>
                <Field label="Email" icon={Mail}>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                  />
                </Field>
                <Field label="Location" icon={MapPin}>
                  <Input
                    value={form.location}
                    onChange={updateField("location")}
                    placeholder="City, country"
                  />
                </Field>
              </div>
              <Field label="Bio">
                <Textarea
                  value={form.bio}
                  maxLength={500}
                  onChange={updateField("bio")}
                  placeholder="Short public biography"
                  className="min-h-24 resize-y"
                />
                <p className="text-right text-[10px] text-zinc-400">
                  {form.bio.length}/500
                </p>
              </Field>
            </section>

            <section className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-900">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Links
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Optional public website and professional profiles.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Website" icon={ExternalLink}>
                  <Input
                    type="url"
                    value={form.website}
                    onChange={updateField("website")}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="GitHub">
                  <Input
                    value={form.github}
                    onChange={updateField("github")}
                    placeholder="username"
                  />
                </Field>
                <Field label="LinkedIn">
                  <Input
                    value={form.linkedin}
                    onChange={updateField("linkedin")}
                    placeholder="username"
                  />
                </Field>
                <Field label="X / Twitter">
                  <Input
                    value={form.twitter}
                    onChange={updateField("twitter")}
                    placeholder="username"
                  />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter className="flex-row border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 dark:border-zinc-900 dark:bg-zinc-900/40 sm:px-8">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting || !form.fullName.trim() || !form.email.trim()
              }
            >
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {Icon && <Icon className="h-3.5 w-3.5 text-zinc-400" />}
        {label}
      </span>
      {children}
    </label>
  );
}

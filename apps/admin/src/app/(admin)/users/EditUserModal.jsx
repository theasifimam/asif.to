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
      <DialogContent className="max-h-[calc(100dvh-2.5rem)] w-[calc(100%-1.5rem)] overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-2xl">
        <form
          onSubmit={submit}
          className="flex h-full max-h-[calc(100dvh-2.5rem)] min-h-0 flex-col overflow-hidden"
        >
          <div className="shrink-0 border-b border-zinc-100 px-4 py-5 dark:border-zinc-900 sm:px-8 sm:py-6">
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

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
            <section className="mb-6 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 sm:p-5">
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={chooseAvatar}
              />
              <div className="flex items-center gap-4 sm:gap-5">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="group relative h-16 w-16 shrink-0 cursor-pointer rounded-full focus:outline-none sm:h-18 sm:w-18"
                  title="Click to change profile picture"
                  aria-label="Change profile picture"
                >
                  <Avatar className="h-full w-full rounded-full border border-zinc-200/80 ring-2 ring-transparent transition-all group-hover:ring-blue-500 dark:border-zinc-700/80">
                    <AvatarImage
                      src={preview}
                      alt={form.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-base font-black">
                      {initials(form.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
                    <Camera className="h-4 w-4" />
                    <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider">
                      Upload
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs ring-2 ring-white transition-transform group-hover:scale-110 dark:ring-zinc-900">
                    <Camera className="h-3 w-3" />
                  </div>
                </button>

                <div className="flex flex-col justify-center">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Click avatar to upload a new picture.
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                    PNG, JPG or WebP up to 5MB.
                  </p>
                </div>
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

          <DialogFooter className="shrink-0 grid grid-cols-2 border-t border-zinc-100 bg-zinc-50/70 px-2 py-2 dark:border-zinc-900 dark:bg-zinc-900/40 sm:flex sm:px-4 sm:py-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting || !form.fullName.trim() || !form.email.trim()
              }
              className="flex-1 md:flex-none"
            >
              {submitting ? "Saving…" : "Save"}
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

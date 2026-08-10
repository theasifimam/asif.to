"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input, Button } from "@/components/ui";

export function AddUserModal({ isOpen, onClose, onAdd, submitting }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reader");

  const handleReset = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("reader");
  };

  const handleSubmit = async () => {
    await onAdd({ fullName, username, email, password, role });
    handleReset();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          handleReset();
        }
      }}
    >
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-4xl p-10 sm:max-w-125 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-black font-outfit uppercase tracking-tighter">
            Provision Access.
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
            Create a new editorial personnel account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {[
            {
              label: "Full Name",
              value: fullName,
              set: setFullName,
              placeholder: "John Doe",
              type: "text",
            },
            {
              label: "Username",
              value: username,
              set: setUsername,
              placeholder: "johndoe",
              type: "text",
            },
            {
              label: "Email Address",
              value: email,
              set: setEmail,
              placeholder: "john@asif.to",
              type: "email",
            },
            {
              label: "Initial Password",
              value: password,
              set: setPassword,
              placeholder: "Min 8 characters",
              type: "password",
            },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {field.label}
              </label>
              <Input
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-white transition-colors"
              />
            </div>
          ))}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Clearance Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl h-12 text-sm font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-999">
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-6 gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Provision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

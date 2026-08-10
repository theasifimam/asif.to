"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Loader2, Camera, Twitter, Linkedin, Globe, Github, Instagram, Phone } from 'lucide-react';
import { Input, Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:5000';

export function EditUserModal({ isOpen, onClose, user, onUpdate, submitting }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mNumber, setMNumber] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Social Handles State
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const cleanHandle = (val) => {
    if (!val) return "";
    let s = val.trim();
    s = s.replace(/^@/, "");
    try {
      if (s.startsWith("http://") || s.startsWith("https://")) {
        const url = new URL(s);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[0] || "";
      }
    } catch (e) {
      // fallback
    }
    return s;
  };

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setMNumber(user.mNumber || '');
      setLocation(user.location || '');
      setBio(user.bio || '');

      setTwitter(cleanHandle(user.socials?.twitter || ''));
      setLinkedin(cleanHandle(user.socials?.linkedin || ''));
      setWebsite(user.socials?.website || '');
      setGithub(cleanHandle(user.socials?.github || ''));
      setInstagram(cleanHandle(user.socials?.instagram || ''));

      const avatarUrl = user.avatar ?
        (user.avatar.startsWith('http') ? user.avatar : `${STORAGE_URL}${user.avatar}`) :
        user?.profilePicture?.url || null;
      setPreviewUrl(avatarUrl);
      setSelectedImage(null);
    }
  }, [user, isOpen]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('mNumber', mNumber);
    formData.append('location', location);
    formData.append('bio', bio);
    formData.append('socials', JSON.stringify({
      twitter: cleanHandle(twitter),
      linkedin: cleanHandle(linkedin),
      website: website.trim(),
      github: cleanHandle(github),
      instagram: cleanHandle(instagram)
    }));

    if (selectedImage) {
      formData.append('avatar', selectedImage);
    }

    await onUpdate(formData);
  };

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || "?";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o && !submitting) onClose(); }}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2rem] p-0 sm:max-w-[580px] shadow-2xl overflow-hidden focus:outline-none">
        <div className="max-h-[85vh] overflow-y-auto px-8 py-8 scrollbar-hide">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black font-outfit uppercase tracking-tighter">Edit Personnel Profile</DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
              Modify profile details and social media usernames.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-zinc-100 dark:border-zinc-900 shadow-xl overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={previewUrl || ""} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-zinc-900">
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={submitting} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile Photo</span>
            </div>

            {/* Basic Info */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-bold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Username</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-bold" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <Input
                      value={mNumber}
                      onChange={(e) => setMNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-11 pl-9 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Location Node</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="New York, USA"
                  className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-xs font-bold" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Biography / Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself or author narrative..."
                  rows={3}
                  className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none scrollbar-hide" />
              </div>

              {/* Social Handles Header */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social Media Usernames (Handles Only)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Twitter / X */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Twitter size={12} className="text-sky-400" /> Twitter / X
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden text-xs font-bold focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <span className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-[11px] font-mono shrink-0 select-none">
                      x.com/
                    </span>
                    <Input
                      value={twitter}
                      onChange={(e) => setTwitter(cleanHandle(e.target.value))}
                      placeholder="username"
                      className="border-0 bg-transparent h-10 px-3 focus:ring-0 text-xs font-bold shadow-none" />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Linkedin size={12} className="text-blue-500" /> LinkedIn
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden text-xs font-bold focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <span className="px-2.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-[10px] font-mono shrink-0 select-none">
                      linkedin.com/in/
                    </span>
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(cleanHandle(e.target.value))}
                      placeholder="username"
                      className="border-0 bg-transparent h-10 px-3 focus:ring-0 text-xs font-bold shadow-none" />
                  </div>
                </div>

                {/* GitHub */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Github size={12} /> GitHub
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden text-xs font-bold focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <span className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-[11px] font-mono shrink-0 select-none">
                      github.com/
                    </span>
                    <Input
                      value={github}
                      onChange={(e) => setGithub(cleanHandle(e.target.value))}
                      placeholder="username"
                      className="border-0 bg-transparent h-10 px-3 focus:ring-0 text-xs font-bold shadow-none" />
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Instagram size={12} className="text-pink-500" /> Instagram
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden text-xs font-bold focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <span className="px-2.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-[10px] font-mono shrink-0 select-none">
                      instagram.com/
                    </span>
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(cleanHandle(e.target.value))}
                      placeholder="username"
                      className="border-0 bg-transparent h-10 px-3 focus:ring-0 text-xs font-bold shadow-none" />
                  </div>
                </div>

                {/* Website */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Globe size={12} className="text-emerald-500" /> Personal Website
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden text-xs font-bold focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
                    <span className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 text-[11px] font-mono shrink-0 select-none">
                      https://
                    </span>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="yourdomain.com"
                      className="border-0 bg-transparent h-10 px-3 focus:ring-0 text-xs font-bold shadow-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
            <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1 px-6 py-5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-5 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-none">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Save Profile Shift"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
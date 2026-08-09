"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
"@/components/ui/dialog";
import { Loader2, Camera } from 'lucide-react';
import { Input, Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';









const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:5000';

export function EditUserModal({ isOpen, onClose, user, onUpdate, submitting }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setLocation(user.location || '');
      setBio(user.bio || '');

      // Handle profile picture URL correctly
      const avatarUrl = user.avatar ?
      user.avatar.startsWith('http') ? user.avatar : `${STORAGE_URL}${user.avatar}` :
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
    formData.append('location', location);
    formData.append('bio', bio);
    if (selectedImage) {
      formData.append('avatar', selectedImage);
    }
    await onUpdate(formData);
  };

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase() || "?";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => {if (!o && !submitting) onClose();}}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2rem] p-0 sm:max-w-[500px] shadow-2xl overflow-hidden focus:outline-none">
                <div className="max-h-[85vh] overflow-y-auto px-10 py-10 scrollbar-hide">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-3xl font-black font-outfit uppercase tracking-tighter">Edit Profile</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                            Modify system personnel identification markers.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex flex-col gap-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <Avatar className="w-28 h-28 border-[6px] border-zinc-50 dark:border-zinc-900 shadow-xl overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <AvatarImage src={previewUrl || ""} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-400 uppercase">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <button
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Identity Visual.</span>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Legal Name</label>
                                    <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
                  
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Alias Handle</label>
                                    <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
                  
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transmission Point (Email)</label>
                                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
                
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Location Node</label>
                                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote Terminal"
                  className="w-full h-11 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
                
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Professional Narrative</label>
                                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about this personnel..."
                  rows={3}
                  className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors resize-none scrollbar-hide" />
                
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-10 gap-3 sm:flex-row flex-col">
                        <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1 px-6 py-6 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Abort</Button>
                        <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-6 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-none">
              
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Authorize Shift"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>);

}
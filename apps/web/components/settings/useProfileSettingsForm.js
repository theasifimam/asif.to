"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/lib/api/authApi";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/config";
import { setCredentials, setOAuthCredentials } from "@/lib/store/authSlice";

const DEFAULT_FORM_DATA = {
  fullName: "",
  bio: "",
  location: "",
  mNumber: "",
  socials: {
    twitter: "",
    linkedin: "",
    github: "",
    website: "",
  },
  settings: {
    newsletter: true,
    notifications: true,
    profileVisibility: "public",
    showLearningActivity: true,
    showAchievements: true,
  },
};

export function useProfileSettingsForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    isInitialized,
    user: storeUser,
  } = useAppSelector((state) => state.auth);
  const username = storeUser?.username;

  const { data: profileRes, isLoading: profileLoading } = useGetProfileQuery(
    undefined,
    {
      skip: !isAuthenticated,
    },
  );
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState({
    profile: true,
    socials: true,
    notifications: false,
    privacy: false,
    security: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({
      profile: true,
      socials: true,
      notifications: true,
      privacy: true,
      security: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      profile: false,
      socials: false,
      notifications: false,
      privacy: false,
      security: false,
    });
  };

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const lastLoadedUserIdRef = useRef(null);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent("/account")}`);
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    const u = profileRes?.data?.user;
    if (u && lastLoadedUserIdRef.current !== (u._id || u.id)) {
      lastLoadedUserIdRef.current = u._id || u.id;
      setFormData({
        fullName: u.fullName || "",
        bio: u.bio || "",
        location: u.location || "",
        mNumber: u.mNumber || "",
        socials: {
          twitter: u.socials?.twitter || "",
          linkedin: u.socials?.linkedin || "",
          github: u.socials?.github || "",
          website: u.socials?.website || "",
        },
        settings: {
          newsletter: u.settings?.newsletter ?? true,
          notifications: u.settings?.notifications ?? true,
          profileVisibility: u.settings?.profileVisibility || "public",
          showLearningActivity: u.settings?.showLearningActivity ?? true,
          showAchievements: u.settings?.showAchievements ?? true,
        },
      });
      if (u.avatar) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAvatarPreview(getImageUrl(u.avatar));
      }
    }
  }, [profileRes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("bio", formData.bio);
      data.append("location", formData.location);
      data.append("mNumber", formData.mNumber);
      data.append("socials", JSON.stringify(formData.socials));
      data.append("settings", JSON.stringify(formData.settings));
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await updateProfile(data).unwrap();
      if (res.success) {
        const token = localStorage.getItem("asif_token") || "";
        dispatch(
          token
            ? setCredentials({ user: res.data.user, token })
            : setOAuthCredentials({ user: res.data.user }),
        );
        toast.success("Profile updated successfully!");
        router.push(`/${username}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const socialsConnectedCount = Object.values(formData.socials).filter(Boolean).length;

  return {
    username,
    storeUser,
    profileRes,
    profileLoading,
    isUpdating,
    openSections,
    toggleSection,
    expandAll,
    collapseAll,
    formData,
    setFormData,
    handleInputChange,
    avatarPreview,
    handleAvatarChange,
    handleSubmit,
    socialsConnectedCount,
  };
}

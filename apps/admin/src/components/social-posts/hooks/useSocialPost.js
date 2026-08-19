"use client";

import { useCallback } from "react";
import useUndoRedo from "./useUndoRedo";
import { generatePresetSlides } from "../presets";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const EMPTY_POST = {
  name: "Untitled social post",
  category: "",
  platform: "instagram",
  format: "square-1080",
  status: "draft",
  settings: {
    accentColor: "#2563eb",
    codeTheme: "dark",
    showBranding: true,
    showSlideNumbers: true,
    showCategory: true,
    footerText: "asif.to",
  },
  slides: [
    {
      id: uid(),
      order: 0,
      template: "developer-tip",
      eyebrow: "Dev Tip",
      title: "",
      body: "",
    },
  ],
};

export default function useSocialPost(initialValue = EMPTY_POST) {
  const history = useUndoRedo(initialValue);

  const updatePost = useCallback(
    (patch) => history.setPresent((post) => ({ ...post, ...patch })),
    [history.setPresent],
  );

  const updateSettings = useCallback(
    (patch) =>
      history.setPresent((post) => ({
        ...post,
        settings: { ...post.settings, ...patch },
      })),
    [history.setPresent],
  );

  const updateSlide = useCallback(
    (slideId, patch) =>
      history.setPresent((post) => ({
        ...post,
        slides: post.slides.map((slide) =>
          slide.id === slideId ? { ...slide, ...patch } : slide,
        ),
      })),
    [history.setPresent],
  );

  const addSlide = useCallback(
    (template = "developer-tip", afterId = null) =>
      history.setPresent((post) => {
        const slides = [...post.slides];
        const newSlide = {
          id: uid(),
          template,
          title: "",
          body: "",
        };

        const index = afterId
          ? Math.max(0, slides.findIndex((slide) => slide.id === afterId) + 1)
          : slides.length;

        slides.splice(index, 0, newSlide);

        return {
          ...post,
          slides: slides.map((slide, order) => ({ ...slide, order })),
        };
      }),
    [history.setPresent],
  );

  const duplicateSlide = useCallback(
    (slideId) =>
      history.setPresent((post) => {
        const index = post.slides.findIndex((slide) => slide.id === slideId);
        if (index < 0) return post;

        const slides = [...post.slides];
        slides.splice(index + 1, 0, {
          ...structuredClone(post.slides[index]),
          id: uid(),
        });

        return {
          ...post,
          slides: slides.map((slide, order) => ({ ...slide, order })),
        };
      }),
    [history.setPresent],
  );

  const deleteSlide = useCallback(
    (slideId) =>
      history.setPresent((post) => {
        if (post.slides.length <= 1) return post;

        return {
          ...post,
          slides: post.slides
            .filter((slide) => slide.id !== slideId)
            .map((slide, order) => ({ ...slide, order })),
        };
      }),
    [history.setPresent],
  );

  const reorderSlides = useCallback(
    (fromIndex, toIndex) =>
      history.setPresent((post) => {
        const slides = [...post.slides];
        const [moved] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, moved);

        return {
          ...post,
          slides: slides.map((slide, order) => ({ ...slide, order })),
        };
      }),
    [history.setPresent],
  );

  const applyPreset = useCallback(
    (presetId) =>
      history.setPresent((post) => ({
        ...post,
        slides: generatePresetSlides(presetId),
      })),
    [history.setPresent],
  );

  return {
    ...history,
    post: history.present,
    updatePost,
    updateSettings,
    updateSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlides,
    applyPreset,
  };
}

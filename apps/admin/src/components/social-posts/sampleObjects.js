const basePost = {
  internalPostName: "replace-with-internal-name",
  category: "Replace category",
  platform: "instagram",
  recommendedFormat: "portrait",
  status: "draft",
  caption: "Replace with the final social post caption.",
  hashtags: ["#ReplaceMe"],
};

export const SOCIAL_POST_SAMPLES = [
  {
    id: "educational-carousel",
    label: "Educational Carousel",
    description: "A complete multi-slide educational carousel using mixed templates.",
    value: {
      ...basePost,
      slides: [
        {
          template: "tutorial-cover",
          eyebrow: "Technology / Topic",
          title: "Main topic or hook",
          subtitle: "What the reader will learn",
          badge: "Tutorial"
        },
        {
          template: "definition",
          eyebrow: "Core Concept",
          title: "Important concept",
          body: "Explain the concept clearly and concisely.",
          highlightedText: "Key takeaway"
        },
        {
          template: "code-snippet",
          title: "Practical example",
          subtitle: "What this code demonstrates",
          code: {
            language: "javascript",
            filename: "example.js",
            content: "// Add a short realistic code example",
            highlightLines: []
          }
        },
        {
          template: "developer-tip",
          eyebrow: "Best Practice",
          title: "Useful practical advice",
          body: "Explain the advice without filler.",
          highlightedText: "What the reader should remember",
          badge: "Tip"
        },
        {
          template: "summary",
          title: "Remember this",
          body: "Summarize the lesson without repeating every slide.",
          cta: "Learn more on asif.to",
          url: "https://asif.to"
        }
      ]
    }
  },

  {
    id: "developer-tip",
    label: "Developer Tip",
    description: "Tips, recommendations, warnings, best practices, or common mistakes.",
    value: {
      ...basePost,
      slides: [
        {
          template: "developer-tip",
          eyebrow: "Dev Tip",
          title: "Short useful developer tip",
          body: "Explain the advice in simple developer-friendly language.",
          highlightedText: "Most important takeaway",
          badge: "Best Practice",
          code: {
            language: "javascript",
            filename: "example.js",
            content: "// Optional short code example",
            highlightLines: []
          }
        }
      ]
    }
  },

  {
    id: "code-snippet",
    label: "Code Snippet",
    description: "A focused code example with a short explanation.",
    value: {
      ...basePost,
      slides: [
        {
          template: "code-snippet",
          title: "What this code does",
          subtitle: "Short context for the example",
          code: {
            language: "javascript",
            filename: "example.js",
            content: "// Add 5-12 lines of useful code",
            highlightLines: []
          }
        }
      ]
    }
  },

  {
    id: "interview-question",
    label: "Interview Question",
    description: "An interview-ready programming question with a concise answer.",
    value: {
      ...basePost,
      slides: [
        {
          template: "interview-question",
          eyebrow: "Interview Question",
          title: "Write the question here",
          body: "Give a concise, interview-ready answer.",
          highlightedText: "Key phrase to remember",
          badge: "Interview"
        }
      ]
    }
  },

  {
    id: "tutorial-cover",
    label: "Tutorial Cover",
    description: "A strong opening slide for a tutorial or carousel.",
    value: {
      ...basePost,
      slides: [
        {
          template: "tutorial-cover",
          eyebrow: "Technology / Topic",
          title: "Tutorial title",
          subtitle: "What the reader will learn",
          badge: "Tutorial"
        }
      ]
    }
  },

  {
    id: "step-by-step-tutorial",
    label: "Step-by-Step Tutorial",
    description: "Cover, numbered tutorial steps, code where useful, and a final summary.",
    value: {
      ...basePost,
      slides: [
        {
          template: "tutorial-cover",
          eyebrow: "Technology / Topic",
          title: "Tutorial title",
          subtitle: "What the reader will build or understand",
          badge: "Tutorial"
        },
        {
          template: "tutorial-step",
          stepNumber: 1,
          title: "First step",
          body: "Explain what to do and why.",
          bulletPoints: [
            "Important point",
            "Another useful point"
          ],
          code: {
            language: "javascript",
            filename: "example.js",
            content: "// Optional code for this step",
            highlightLines: []
          }
        },
        {
          template: "tutorial-step",
          stepNumber: 2,
          title: "Second step",
          body: "Continue with the next logical step.",
          bulletPoints: [
            "Keep it concise",
            "Only include necessary details"
          ]
        },
        {
          template: "summary",
          title: "You now know the workflow",
          body: "Summarize the result.",
          cta: "Learn more on asif.to",
          url: "https://asif.to"
        }
      ]
    }
  },

  {
    id: "comparison",
    label: "Comparison",
    description: "Side-by-side comparison such as map vs forEach or SSR vs CSR.",
    value: {
      ...basePost,
      slides: [
        {
          template: "comparison",
          title: "Option A vs Option B",
          comparisonLeft: {
            label: "Option A",
            items: [
              "Point one",
              "Point two",
              "Point three"
            ]
          },
          comparisonRight: {
            label: "Option B",
            items: [
              "Point one",
              "Point two",
              "Point three"
            ]
          }
        }
      ]
    }
  },

  {
    id: "definition",
    label: "Definition / Concept",
    description: "Explain one programming concept clearly and memorably.",
    value: {
      ...basePost,
      slides: [
        {
          template: "definition",
          eyebrow: "Core Concept",
          title: "Concept name",
          body: "Give a concise explanation that is easy to remember.",
          highlightedText: "One-line takeaway"
        }
      ]
    }
  },

  {
    id: "quote",
    label: "Quote / Important Note",
    description: "A strong takeaway, warning, important note, or memorable statement.",
    value: {
      ...basePost,
      slides: [
        {
          template: "quote",
          eyebrow: "Important Note",
          quote: "Write the important takeaway here.",
          author: "asif.to"
        }
      ]
    }
  },

  {
    id: "minimal",
    label: "Minimal Text",
    description: "A clean typography-first post with very little text.",
    value: {
      ...basePost,
      slides: [
        {
          template: "minimal",
          title: "Strong short statement",
          subtitle: "One supporting sentence"
        }
      ]
    }
  },

  {
    id: "summary",
    label: "Summary / CTA",
    description: "A final takeaway with a call to action.",
    value: {
      ...basePost,
      slides: [
        {
          template: "summary",
          title: "Final takeaway",
          body: "Summarize the important point.",
          cta: "Learn more on asif.to",
          url: "https://asif.to"
        }
      ]
    }
  }
];

export function getSocialPostSample(id) {
  return (
    SOCIAL_POST_SAMPLES.find((sample) => sample.id === id) ||
    SOCIAL_POST_SAMPLES[0]
  );
}

export function stringifySocialPostSample(id) {
  return JSON.stringify(getSocialPostSample(id).value, null, 2);
}

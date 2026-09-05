import MonetizationSlot from "./MonetizationSlot";

const positionKey = (prefix, position) =>
  `${prefix}_${String(position || "bottom").toUpperCase()}`;

export function ArticleAd({ position = "bottom", wordCount, ...props }) {
  const occurrenceIndex =
    position === "middle" ? 2 : position === "sidebar" ? 3 : 1;
  return (
    <MonetizationSlot
      placementKey={
        position === "sidebar" ? "SIDEBAR" : positionKey("ARTICLE", position)
      }
      pageType="article"
      wordCount={wordCount}
      occurrenceIndex={occurrenceIndex}
      {...props}
    />
  );
}

export function CourseAd({ position = "bottom", wordCount, ...props }) {
  return (
    <MonetizationSlot
      placementKey={positionKey("COURSE", position)}
      pageType="course-chapter"
      wordCount={wordCount}
      occurrenceIndex={position === "middle" ? 2 : 1}
      {...props}
    />
  );
}

export function CheatsheetAd({ wordCount, ...props }) {
  return (
    <MonetizationSlot
      placementKey="CHEATSHEET_BOTTOM"
      pageType="cheatsheet"
      wordCount={wordCount}
      {...props}
    />
  );
}

export function InterviewQuestionAd({ wordCount, ...props }) {
  return (
    <MonetizationSlot
      placementKey="INTERVIEW_BOTTOM"
      pageType="interview-question"
      wordCount={wordCount}
      {...props}
    />
  );
}

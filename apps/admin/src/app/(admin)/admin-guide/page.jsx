"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  FileEdit,
  GraduationCap,
  Hash,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin";

// Add or update help entries here. Search indexes the title, summary, access,
// keywords, and instructions so new guides become discoverable automatically.
const guides = [
  {
    id: "job-source",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I add a company source for fetching jobs?",
    summary:
      "Connect a public company career page or ATS board and start importing UAE jobs.",
    access: "Admin or super admin",
    permission: "job_sources.manage",
    href: "/jobs/sources/new",
    action: "Open Add source",
    keywords: "jobs company source ATS career feed import UAE verify sync",
    steps: [
      "Open Jobs → Job Sources and choose Add source.",
      "Enter the company/source name, choose the adapter, and add the public board URL or provider organization ID.",
      "Review publishing settings. Keep auto-publish off until the source has been verified unless it is trusted.",
      "Save the source and choose Test on its card. Read the verification result and UAE job count.",
      "Resolve any verification notes, test again, then choose Enable after verification succeeds.",
      "Use Sync now or wait for the schedule. Review sync history, imported jobs, rejected jobs, and duplicates.",
    ],
    note: "Only public, credential-free career feeds are accepted by supported adapters. Provider credentials remain server-side.",
  },
  {
    id: "job-post-create",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I create and publish a new job posting?",
    summary:
      "Post a new job opportunity manually with title, company, location, salary, employment type, and application details.",
    access: "Recruiter, editor, admin, or super admin",
    permission: "jobs.create",
    href: "/jobs/new",
    action: "Open Post job",
    keywords:
      "jobs post create new listing hiring opportunity salary location employment type",
    steps: [
      "Go to Jobs → Post job (or click + New job from the jobs list page).",
      "Select the hiring company from the dropdown or enter a new company name.",
      "Enter the job title, work location (city, UAE emirate, or remote status), and employment type (Full-Time, Part-Time, Contract, Internship).",
      "Fill in salary range, experience level, required skills, and detailed job description.",
      "Provide application instructions (direct URL or email) or enable internal candidate submissions.",
      "Review all details and choose Publish immediately or Save as draft for review.",
    ],
    note: "Ensure company profiles are created first if you want jobs linked to verified company brand pages.",
  },
  {
    id: "job-manage-search",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I search, filter, and track job postings?",
    summary:
      "Filter active, pending, expired, and featured job listings by status, category, location, and keywords.",
    access: "All admin users",
    permission: "jobs.read",
    href: "/jobs",
    action: "Open Jobs list",
    keywords:
      "jobs search filter active pending expired featured status track listings emirate",
    steps: [
      "Navigate to Jobs from the main sidebar navigation.",
      "Use the search bar to find jobs by job title, company name, or reference ID.",
      "Apply status filters (Active, Pending Review, Draft, Expired, or Featured) to narrow results.",
      "Toggle between grid card view and table view using the layout switcher in the header.",
      "Review key performance metrics at the top, including application counts and external link clicks.",
    ],
    note: "Metrics update dynamically as candidates view and apply for listed positions.",
  },
  {
    id: "job-edit-update",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I edit or update an existing job listing?",
    summary:
      "Update job title, description, requirements, salary ranges, or application deadlines for existing listings.",
    access: "Editor, admin, or super admin",
    permission: "jobs.edit",
    href: "/jobs",
    action: "Open Jobs list",
    keywords:
      "jobs edit update details title salary skills description deadline modify",
    steps: [
      "Navigate to Jobs and locate the job listing using search or status filters.",
      "Click the action menu (or Edit button) on the job item card or table row.",
      "Choose Edit job to open the job editor form.",
      "Modify desired fields such as job requirements, contact information, salary range, or closing date.",
      "Click Save changes to update the live listing immediately.",
    ],
    note: "Editing a published job updates the live listing on the public web portal immediately.",
  },
  {
    id: "job-status-toggle",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I change job status or mark a job as featured?",
    summary:
      "Publish, unpublish, archive, or highlight job listings as featured on the jobs portal.",
    access: "Editor, admin, or super admin",
    permission: "jobs.update_status",
    href: "/jobs",
    action: "Open Jobs list",
    keywords:
      "jobs status publish unpublish draft archive feature highlight toggle list",
    steps: [
      "Open the Jobs listing page.",
      "Locate the job card or table row you want to update.",
      "Click the status dropdown or toggle switch to switch between Published, Draft, and Archived states.",
      "To highlight a job at the top of candidate feeds, click the Star icon or toggle Featured.",
      "Confirm any status change prompts if prompted by the system.",
    ],
    note: "Featured jobs receive higher visibility on candidate dashboards and homepages.",
  },
  {
    id: "job-company-manage",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I add and manage company profiles for job listings?",
    summary:
      "Create company profiles, upload logos, set website URLs, and track company-specific job listings.",
    access: "Admin or super admin",
    permission: "companies.manage",
    href: "/jobs/companies",
    action: "Open Companies",
    keywords:
      "jobs company profiles logo website location brand employer partner manage",
    steps: [
      "Go to Jobs → Companies from the sidebar navigation.",
      "Click + Add company to register a new employer partner profile.",
      "Enter company name, website link, headquarter location, industry, and description.",
      "Upload an official company logo image for brand recognition.",
      "Save the company profile to make it selectable when posting or importing new jobs.",
    ],
    note: "Company profiles group all job posts under a single public employer profile page.",
  },
  {
    id: "job-applications-manage",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I view and manage candidate job applications?",
    summary:
      "Review candidate resumes, update application review statuses, and export candidate lists.",
    access: "Recruiter, admin, or super admin",
    permission: "applications.manage",
    href: "/jobs/applications",
    action: "Open Applications",
    keywords:
      "jobs applications candidates resume apply shortlisted reviewed rejected hired applicant",
    steps: [
      "Navigate to Jobs → Applications from the sidebar menu.",
      "Filter applications by job title, submission status (Submitted, Reviewed, Shortlisted, Rejected, Hired), or candidate name.",
      "Click on a candidate record to view their contact details, cover letter, and attached resume.",
      "Update the candidate's status using the stage selector (e.g., move to Shortlisted or Hired).",
      "Click Export if you need an offline candidate report for hiring team reviews.",
    ],
    note: "Changing application status helps track the recruitment pipeline and candidate progress.",
  },
  {
    id: "job-delete",
    icon: BriefcaseBusiness,
    group: "Jobs",
    title: "How do I delete or permanently remove a job listing?",
    summary:
      "Safely delete obsolete or duplicate job postings from the admin system.",
    access: "Admin or super admin",
    permission: "jobs.delete",
    href: "/jobs",
    action: "Open Jobs list",
    keywords: "jobs delete remove erase drop discard listing post permanent",
    steps: [
      "Navigate to Jobs and locate the target job entry.",
      "Click the Trash icon or select Delete from the action menu.",
      "A confirmation modal will appear detailing the job title.",
      "Confirm the action by clicking Delete Job in the modal.",
      "Verify the job is removed from both active lists and public portal views.",
    ],
    note: "Deletion is permanent. If you only want to temporarily hide a job, change its status to Draft or Archived instead.",
  },
  {
    id: "article-write",
    icon: FileEdit,
    group: "Articles",
    title: "How do I write and publish an article?",
    summary:
      "Create a draft, fill in content and metadata, add a hero image, and publish or save for review.",
    access: "Author, editor, admin, or super admin",
    permission: "articles.create",
    href: "/articles/new",
    action: "Open New article",
    keywords: "article write create new draft publish content blog post",
    steps: [
      "Open Articles → New article (or click the + button on the articles list).",
      "Enter a clear, descriptive title. The slug is derived from this automatically.",
      "Write the body in the rich-text editor using headings, code blocks, links, and images.",
      "In the Topics panel, select one or more topics that best describe the article — at least one is required.",
      "Optionally link related courses in the Related Courses panel so they appear as recommendations on the public page.",
      "In the aside, upload a hero image (required for new articles) or pick one from the asset library.",
      "Fill in Search metadata: SEO title (≤70 chars), SEO description (≤170 chars), keywords, and canonical URL.",
      "Click Save Draft to store your progress, or click Publish to make it live immediately.",
    ],
    note: "articles.create allows any permitted role to create and save drafts. The Publish button is visible to all roles but only works if the user also holds articles.publish — which authors do not have.",
  },
  {
    id: "article-edit",
    icon: FileEdit,
    group: "Articles",
    title: "How do I edit an existing article?",
    summary:
      "Open any article from the list, make changes, then save or update without changing its publish status.",
    access: "Author (own articles), editor, admin, or super admin",
    permission: "articles.update",
    href: "/articles",
    action: "Open Articles",
    keywords: "article edit update change modify correct fix",
    steps: [
      "Open Articles and find the article — use the search bar or status filter to narrow results.",
      "Click the edit icon (pencil) on the article card or row to open the edit form.",
      "Make your changes to the title, content, topics, related courses, hero image, or SEO metadata.",
      "Click Update to save changes while keeping the current publish status unchanged.",
      "Or click Save Draft to pull a published article back to draft, or Publish to push a draft live.",
      "After saving, open the public URL to confirm the changes appear correctly.",
    ],
    note: "Authors can only edit articles they authored. Editors, admins, and super admins can edit any article. Changing authorship requires super admin access via the Author Override panel.",
  },
  {
    id: "article-status",
    icon: FileEdit,
    group: "Articles",
    title: "How do I publish, unpublish, or hide an article?",
    summary:
      "Toggle an article between published and draft at any time from the article list — no need to open the editor.",
    access: "Editor, admin, or super admin",
    permission: "articles.publish",
    href: "/articles",
    action: "Open Articles",
    keywords:
      "article publish unpublish hide show visible invisible toggle status draft",
    steps: [
      "Open Articles and locate the article you want to change.",
      "In the card or list row, click the status toggle or the Publish / Unpublish button.",
      "Published → Draft hides the article from the public site immediately.",
      "Draft → Published makes the article live on the public site immediately.",
      "A toast confirms the new state (VISIBLE or INVISIBLE on apps/web).",
      "Refresh the public URL to verify the change took effect.",
    ],
    note: "The toggle is only visible to roles with articles.publish. Authors cannot publish or unpublish articles — an editor, admin, or super admin must do this.",
  },
  {
    id: "article-draft",
    icon: FileEdit,
    group: "Articles",
    title: "How do I find and manage draft articles?",
    summary:
      "View all unpublished drafts, resume editing, or delete ones that are no longer needed.",
    access: "Author (own), editor, admin, or super admin",
    permission: "articles.view",
    href: "/articles/drafts",
    action: "Open Drafts",
    keywords: "article draft unpublished pending review manage list",
    steps: [
      "Open Articles → Drafts to see all articles with status: draft.",
      "Use the search bar to find a specific draft by title or author name.",
      "Click the edit icon to continue writing or updating the draft.",
      "When ready, click Publish from within the editor, or use the status toggle on the list.",
      "To remove a draft permanently, click the delete (trash) icon and confirm in the dialog.",
      "Drafts are never visible to the public — they are safe to leave incomplete.",
    ],
    note: "Authors only see their own drafts. Editors and above see all drafts across all authors.",
  },
  {
    id: "article-seo",
    icon: FileEdit,
    group: "Articles",
    title: "How do I set SEO metadata for an article?",
    summary:
      "Fill in the SEO title, description, keywords, and canonical URL so the article ranks well in search engines.",
    access: "Author, editor, admin, or super admin",
    permission: "articles.create / articles.update",
    href: "/articles/new",
    action: "Open New article",
    keywords:
      "article SEO metadata title description keywords canonical URL search engine optimisation",
    steps: [
      "Open the article editor (new or existing) and scroll to the Search metadata panel in the right aside.",
      "Enter an SEO title (up to 70 characters) — this is the text shown in browser tabs and search results.",
      "Enter an SEO description (up to 170 characters) — this is the snippet shown below the title in search results.",
      "Add comma-separated keywords that accurately describe the article topic.",
      "Set the canonical URL if the article is a republication of content hosted elsewhere, or leave it blank to use the default public URL.",
      "Save the article — metadata is included in every subsequent save.",
    ],
    note: "The canonical URL field uses https://asif.to/articles/ as its prefix. Only override it when the article's original source is a different URL. Incorrect canonicals can harm search rankings.",
  },
  {
    id: "article-delete",
    icon: FileEdit,
    group: "Articles",
    title: "How do I delete an article?",
    summary:
      "Permanently remove an article from the database — this cannot be undone.",
    access: "Admin or super admin",
    permission: "articles.delete",
    href: "/articles",
    action: "Open Articles",
    keywords: "article delete remove permanently trash decommission",
    steps: [
      "Open Articles and find the article to delete.",
      "Click the delete (trash) icon on the card or row.",
      "A confirmation dialog appears — read the warning before confirming.",
      "Click Confirm to permanently delete the article and its associated media references.",
      "The article is removed immediately from the admin list and the public site.",
    ],
    note: "Deletion is permanent and cannot be undone. If you only want to hide the article temporarily, use the status toggle to set it to Draft instead of deleting it.",
  },
  {
    id: "course",
    icon: GraduationCap,
    group: "Learning",
    title: "How do I create a course?",
    summary:
      "Create the course shell, then build its topics, chapters, activities, and assessments.",
    access: "Editor, admin, or super admin",
    permission: "courses.manage",
    href: "/courses/new",
    action: "Open New course",
    keywords:
      "course learning chapter category quiz exam coding activity create",
    steps: [
      "Open Courses → New course and enter the title, slug, description, technology, and thumbnail.",
      "Configure visibility, difficulty, access settings, and search metadata.",
      "Save the course, then open its workspace to add categories and chapters in learning order.",
      "Add chapter content and map practice, revision, quiz, or coding activities where needed.",
      "Review the learner-facing course page and check every chapter’s status and content.",
      "Publish or make the course available only after editorial and learning-content review.",
    ],
    note: "Course creation and management require courses.manage. Authors can view courses but cannot manage them.",
  },
  {
    id: "topic",
    icon: Hash,
    group: "Content structure",
    title: "How do I add or edit a topic?",
    summary:
      "Organize articles and courses into useful topic pages with clear hierarchy and guides.",
    access: "Editor, admin, or super admin",
    permission: "topics.manage",
    href: "/topics/new",
    action: "Open New topic",
    keywords:
      "topic category taxonomy hierarchy slug landing page organize content",
    steps: [
      "Open Topics and choose New topic.",
      "Enter the name, slug, description, icon or image, and parent topic when needed.",
      "Add the introduction or guide content shown on the topic landing page.",
      "Save and review the public structure. Confirm the slug and parent path.",
      "Assign the topic to relevant articles or courses so the page has useful content.",
      "Before changing an existing slug, check linked content and the public URL.",
    ],
    note: "topics.view allows browsing. Creating, editing, or organizing topics requires topics.manage.",
  },
  {
    id: "user",
    icon: UserPlus,
    group: "Access management",
    title: "How do I add or invite a user?",
    summary:
      "Invite a teammate with the smallest role that gives them the access they need.",
    access: "Admin or super admin",
    permission: "invitations.manage",
    href: "/users",
    action: "Open Users",
    keywords:
      "user invite teammate role access author editor admin reader permissions",
    steps: [
      "Open Users and choose Add user. The invitation form creates the user’s access.",
      "Enter the email address and select Author, Editor, Admin, or Reader.",
      "Use Author for assigned content, Editor for broader editorial work, and Admin for operations and access management.",
      "Send the invitation. The recipient follows the email link to finish setup and create a password.",
      "Review the account, role, status, and activity from Users after the invitation is accepted.",
      "For sensitive work, confirm the role’s permission in Users → Roles & permissions.",
    ],
    note: "The Add user action requires invitations.manage. Editing, suspending, deleting, and changing roles use separate permissions.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Group guides by their group label.
// ─────────────────────────────────────────────────────────────────────────────
function groupGuides(list) {
  const map = new Map();
  for (const guide of list) {
    if (!map.has(guide.group)) map.set(guide.group, []);
    map.get(guide.group).push(guide);
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight matching text inside a title string.
// ─────────────────────────────────────────────────────────────────────────────
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-[3px] bg-blue-100 px-0.5 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A single Group Card containing all guides for a module in one card container.
// ─────────────────────────────────────────────────────────────────────────────
function ModuleGroupCard({ groupLabel, guides, query, openId, onToggle }) {
  const PrimaryIcon = guides[0]?.icon || BookOpen;
  const count = guides.length;

  return (
    <article className="admin-surface overflow-hidden rounded-3xl border border-zinc-200/80 shadow-xs transition-all duration-200 hover:shadow-md dark:border-zinc-800/80">
      {/* ── Module Group Card Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 bg-zinc-50/70 px-5 py-4 dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:px-6 sm:py-4.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs dark:bg-blue-950/60 dark:text-blue-400">
            <PrimaryIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 sm:text-lg">
              {groupLabel} Module
            </h2>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {count} {count === 1 ? "guide" : "guides"} available in this
              section
            </p>
          </div>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/50 dark:text-blue-300">
          {groupLabel}
        </span>
      </div>

      {/* ── Accordion List of Guides Inside This Single Card ── */}
      <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
        {guides.map((guide) => {
          const isOpen = openId === guide.id;
          const panelId = `guide-panel-${guide.id}`;
          const btnId = `guide-btn-${guide.id}`;
          const GuideIcon = guide.icon || PrimaryIcon;

          return (
            <div
              key={guide.id}
              className="transition-colors duration-150 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30"
            >
              {/* Trigger */}
              <button
                id={btnId}
                type="button"
                onClick={() => onToggle(guide.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center gap-3.5 px-5 py-4 text-left sm:px-6"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50/80 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <GuideIcon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 sm:text-[15px]">
                    <Highlight text={guide.title} query={query} />
                  </span>
                </span>

                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                    isOpen ? "rotate-90 text-blue-600 dark:text-blue-400" : ""
                  }`}
                />
              </button>

              {/* Accordion Content Panel */}
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="border-t border-zinc-200/60 bg-zinc-50/60 px-5 py-5 dark:border-zinc-800/60 dark:bg-zinc-900/50 sm:px-6 sm:py-6"
                >
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {guide.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300">
                      {guide.access}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      {guide.permission}
                    </span>
                  </div>

                  <ol className="mt-5 space-y-3">
                    {guide.steps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">
                          {index + 1}
                        </span>
                        <p className="pt-0.5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-xs leading-5 text-amber-900/80 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200/80">
                    {guide.note}
                  </div>

                  <Link
                    href={guide.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-blue-500"
                  >
                    {guide.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminGuidePage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [openId, setOpenId] = useState(null);
  const inputRef = useRef(null);

  // All distinct module groups
  const moduleGroups = useMemo(() => {
    const groups = Array.from(new Set(guides.map((g) => g.group)));
    return ["All", ...groups];
  }, []);

  // Search indexes title, group, keywords, summary, steps, note, access, permission.
  const filteredGuides = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return guides;
    return guides.filter((g) =>
      [
        g.title,
        g.summary,
        g.group,
        g.access,
        g.permission,
        g.keywords,
        ...g.steps,
        g.note,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query]);

  // Group filtered guides by module group label
  const groupedFiltered = useMemo(() => {
    return groupGuides(filteredGuides);
  }, [filteredGuides]);

  // Apply tab filter to grouped list
  const displayGroups = useMemo(() => {
    if (activeTab === "All") return groupedFiltered;
    return groupedFiltered.filter((g) => g.label === activeTab);
  }, [groupedFiltered, activeTab]);

  // Reset open accordion when search query or tab changes
  useEffect(() => {
    setOpenId(null);
  }, [query, activeTab]);

  const clearSearch = () => {
    setQuery("");
    setOpenId(null);
    inputRef.current?.focus();
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const hasQuery = query.trim().length > 0;
  const totalMatches = filteredGuides.length;

  return (
    <AdminPage size="lg" className="space-y-6 py-5 pb-16">
      <AdminPageHeader
        eyebrow="System Pages / Help Center"
        title="Help center"
        description="Search for any task, workflow, permission, or feature. Guides are organized into module cards below."
        actions={
          <Link
            href="/users/roles"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-xs transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-400"
          >
            <ShieldCheck className="h-4 w-4" />
            View roles &amp; permissions
          </Link>
        }
      />

      {/* ── Hero search banner ── */}
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-600/20 sm:rounded-4xl sm:p-10">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
          <BookOpen className="h-4 w-4" />
          Admin help center &middot; {guides.length} guides available
        </div>

        <h2 className="mt-3 font-outfit text-2xl font-black sm:text-3xl">
          What do you need help with?
        </h2>
        <p className="mt-1.5 text-sm font-medium text-blue-100/80">
          Type any keyword — workflow, permission, module, or action — to find
          the right guide instantly.
        </p>

        {/* Search input */}
        <div className="relative mt-6 max-w-2xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            ref={inputRef}
            id="help-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. add job source, publish article, invite user, create course…"
            aria-label="Search admin help guides"
            autoComplete="off"
            className="h-14 w-full rounded-2xl border border-transparent bg-white px-14 text-sm font-semibold text-zinc-900 shadow-lg outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-300/30 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-700"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Result count pill shown only when searching */}
        {hasQuery && (
          <p className="mt-3 text-xs font-semibold text-blue-100">
            {totalMatches === 0
              ? "No guides matched — try a different keyword."
              : `${totalMatches} ${totalMatches === 1 ? "guide" : "guides"} matched`}
          </p>
        )}
      </section>

      {/* ── Tabs bar for module groups ── */}
      <div className="inline-flex max-w-full items-center gap-1.5 overflow-x-auto mt-8">
        {moduleGroups.map((group) => {
          const count =
            group === "All"
              ? filteredGuides.length
              : filteredGuides.filter((g) => g.group === group).length;
          const isActive = activeTab === group;

          return (
            <button
              key={group}
              type="button"
              onClick={() => setActiveTab(group)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-600 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span>{group === "All" ? "All Modules" : group}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Module Group Cards List ── */}
      <section
        aria-live="polite"
        aria-label="Help guides"
        className="space-y-6"
      >
        {displayGroups.length > 0 ? (
          displayGroups.map(({ label, items }) => (
            <ModuleGroupCard
              key={label}
              groupLabel={label}
              guides={items}
              query={query.trim()}
              openId={openId}
              onToggle={toggle}
            />
          ))
        ) : (
          <div className="admin-surface flex flex-col items-center rounded-3xl px-8 py-14 text-center">
            <Search className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
            <h2 className="mt-4 text-sm font-black text-zinc-800 dark:text-zinc-200">
              No guides found
              {hasQuery ? ` for "${query.trim()}"` : ""} in{" "}
              {activeTab === "All" ? "any module" : `the ${activeTab} module`}.
            </h2>
            <p className="mt-1.5 max-w-xs text-xs leading-5 text-zinc-500">
              Try switching tabs, clearing search filters, or asking an admin
              for guidance.
            </p>
            <div className="mt-5 flex gap-3">
              {hasQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-blue-500"
                >
                  Clear search
                </button>
              )}
              {activeTab !== "All" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("All")}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  Show All Modules
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </AdminPage>
  );
}

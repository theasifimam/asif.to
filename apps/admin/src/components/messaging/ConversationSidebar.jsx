"use client";

import Link from "next/link";
import { ArrowLeft, Search, UserRound } from "lucide-react";
import ConversationRow from "./ConversationRow";
import { avatarUrl, conversationName, idOf } from "./messaging-utils";

function Section({ title, children }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1 px-3 text-[9px] font-black uppercase tracking-[.2em] text-zinc-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SidebarAvatar({ user }) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img
      src={source}
      alt=""
      className="h-10 w-10 shrink-0 rounded-xl object-cover"
    />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {user?.fullName?.[0] || <UserRound size={16} />}
    </span>
  );
}

export default function ConversationSidebar({
  selected,
  conversations = [],
  team = [],
  unread = { totalUnread: 0 },
  search,
  setSearch,
  messageSearch,
  setMessageSearch,
  searchResults = [],
  loading,
  currentUserId,
  onOpenConversation,
  onStartDirect,
}) {
  const direct = conversations.filter((item) => item?.type === "direct");
  const channels = conversations.filter((item) => item?.type === "channel");
  const discussions = conversations.filter(
    (item) => item?.type === "discussion",
  );
  const visibleTeam = team.filter(
    (member) =>
      !direct.some((conversation) =>
        conversation.members?.some((item) => idOf(item) === idOf(member)),
      ),
  );

  return (
    <aside
      className={`${selected ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 md:w-80 lg:w-96 h-full`}
    >
      <div className="border-b border-zinc-100 p-4 sm:p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">
                Internal team
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                Messages
              </h1>
            </div>
          </div>
          {unread.totalUnread > 0 && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-black text-white">
              {unread.totalUnread}
            </span>
          )}
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find people or conversations"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <input
            value={messageSearch}
            onChange={(event) => setMessageSearch(event.target.value)}
            placeholder="Search message history"
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center text-center text-xs text-zinc-500">
            Loading conversations…
          </div>
        ) : (
          <>
            {messageSearch.trim().length >= 2 ? (
              <Section title="Message results">
                {searchResults.map((result) => {
                  const conversation = conversations.find(
                    (item) => idOf(item) === idOf(result.conversationId),
                  );
                  return (
                    <button
                      key={result._id}
                      onClick={() =>
                        conversation &&
                        onOpenConversation(conversation, result._id)
                      }
                      className="mb-1 w-full rounded-xl p-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      <p className="truncate text-xs font-bold dark:text-white">
                        {result.senderId?.fullName} ·{" "}
                        {result.conversation?.type === "channel"
                          ? `#${result.conversation.name}`
                          : result.conversation?.entityTitle ||
                            conversationName(conversation, currentUserId)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[10px] text-zinc-500">
                        {result.excerpt}
                      </p>
                    </button>
                  );
                })}
                {!searchResults.length && (
                  <div className="flex min-h-20 items-center justify-center text-center text-xs text-zinc-500">
                    No matching messages.
                  </div>
                )}
              </Section>
            ) : (
              <>
                <Section title="Direct">
                  {direct.map((conversation) => (
                    <ConversationRow
                      key={conversation._id}
                      conversation={conversation}
                      userId={currentUserId}
                      onClick={() => onOpenConversation(conversation)}
                    />
                  ))}
                </Section>

                <Section title="Channels">
                  {channels.map((conversation) => (
                    <ConversationRow
                      key={conversation._id}
                      conversation={conversation}
                      userId={currentUserId}
                      onClick={() => onOpenConversation(conversation)}
                    />
                  ))}
                </Section>

                <Section title="Content discussions">
                  {discussions.map((conversation) => (
                    <ConversationRow
                      key={conversation._id}
                      conversation={conversation}
                      userId={currentUserId}
                      onClick={() => onOpenConversation(conversation)}
                    />
                  ))}
                </Section>

                {(search || !direct.length) && visibleTeam.length > 0 && (
                  <Section title="Start a conversation">
                    {visibleTeam.map((member) => (
                      <button
                        key={member._id}
                        onClick={() => onStartDirect(member)}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                      >
                        <SidebarAvatar user={member} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold dark:text-white">
                            {member.fullName}
                          </p>
                          <p className="text-[10px] capitalize text-zinc-500">
                            {member.role.replace("_", " ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </Section>
                )}
              </>
            )}

            {!conversations.length && !visibleTeam.length && (
              <div className="flex min-h-40 items-center justify-center text-center text-xs text-zinc-500">
                No team conversations found.
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

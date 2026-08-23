"use client";

import Link from "next/link";
import { ArrowLeft, Search, UserRound } from "lucide-react";
import ConversationRow from "./ConversationRow";
import { avatarUrl, conversationName, idOf } from "./messaging-utils";
import { useMessaging } from "@/contexts/MessagingContext";

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SidebarAvatar({ user, online = false }) {
  const source = avatarUrl(user?.avatar);
  return (
    <div className="relative shrink-0">
      {source ? (
        <img
          src={source}
          alt=""
          className="h-11 w-11 shrink-0 rounded-2xl object-cover"
        />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-sm font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {user?.fullName?.[0] || <UserRound size={18} />}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950"
          title="Online"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
    </div>
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
  typingByConversation = {},
  onOpenConversation,
  onStartDirect,
}) {
  const { isOnline } = useMessaging();
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
      className={`${
        selected ? "hidden md:flex" : "flex"
      } w-full shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 md:w-80 lg:w-96 h-full`}
    >
      <div className="border-b border-zinc-100 p-4 sm:p-5 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white cursor-pointer transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Internal team
              </p>
              <h1 className="text-2xl sm:text-3xl font-black font-outfit text-zinc-950 dark:text-white tracking-tight">
                Messages
              </h1>
            </div>
          </div>
          {unread.totalUnread > 0 && (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-xs">
              {unread.totalUnread}
            </span>
          )}
        </div>

        {/* Single clean search bar on smaller devices, message history search enabled on tablet/desktop */}
        <div className="flex flex-row gap-2.5 mt-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations…"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-3.5 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="relative hidden sm:block sm:flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              value={messageSearch}
              onChange={(event) => setMessageSearch(event.target.value)}
              placeholder="Search message history…"
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3.5 text-sm font-medium outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950 transition-all placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center text-center text-sm font-medium text-zinc-500">
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
                      className="mb-1.5 w-full rounded-2xl p-3.5 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 cursor-pointer"
                    >
                      <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                        {result.senderId?.fullName} ·{" "}
                        {result.conversation?.type === "channel"
                          ? `#${result.conversation.name}`
                          : result.conversation?.entityTitle ||
                            conversationName(conversation, currentUserId)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {result.excerpt}
                      </p>
                    </button>
                  );
                })}
                {!searchResults.length && (
                  <div className="flex min-h-24 items-center justify-center text-center text-sm text-zinc-500 font-medium">
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
                      isSelected={Boolean(
                        selected?._id &&
                        idOf(selected) === idOf(conversation._id),
                      )}
                      isTyping={Boolean(typingByConversation[conversation._id])}
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
                      isSelected={Boolean(
                        selected?._id &&
                        idOf(selected) === idOf(conversation._id),
                      )}
                      isTyping={Boolean(typingByConversation[conversation._id])}
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
                      isSelected={Boolean(
                        selected?._id &&
                        idOf(selected) === idOf(conversation._id),
                      )}
                      isTyping={Boolean(typingByConversation[conversation._id])}
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
                        className="flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 cursor-pointer"
                      >
                        <SidebarAvatar
                          user={member}
                          online={isOnline(member._id)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                            {member.fullName}
                          </p>
                          <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400 mt-0.5">
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
              <div className="flex min-h-40 items-center justify-center text-center text-sm text-zinc-500 font-medium">
                No team conversations found.
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

"use client";
import Link from "next/link";
import { MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/store/hooks";
import { useGetCommunityProfileQuery, useFollowCommunityUserMutation, useUnfollowCommunityUserMutation } from "@/lib/api/communityApi";
import CommunityPostCard from "./CommunityPostCard";

export default function ProfileCommunityActivity({ username, isOwnProfile }) {
  const authenticated=useAppSelector((s)=>s.auth.isAuthenticated); const {data,isLoading}=useGetCommunityProfileQuery(username,{skip:!username}); const result=data?.data;
  const [follow,{isLoading:following}]=useFollowCommunityUserMutation(); const [unfollow,{isLoading:unfollowing}]=useUnfollowCommunityUserMutation();
  const toggle=async()=>{if(!authenticated){location.href="/login";return;}try{result?.isFollowing?await unfollow(username).unwrap():await follow(username).unwrap();}catch(e){toast.error(e?.data?.message||"Unable to update follow")}};
  if(isLoading)return <p className="py-8 text-center text-sm text-zinc-500">Loading community activity…</p>;
  return <div className="space-y-6"><div className="flex flex-wrap items-center gap-5 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><div><b className="text-xl">{result?.followerCount||0}</b><span className="ml-2 text-xs text-zinc-500">followers</span></div><div><b className="text-xl">{result?.followingCount||0}</b><span className="ml-2 text-xs text-zinc-500">following</span></div>{!isOwnProfile&&<button disabled={following||unfollowing} onClick={toggle} className={`ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${result?.isFollowing?"border border-zinc-300":"bg-blue-600 text-white"}`}>{result?.isFollowing?<><UserMinus className="h-4 w-4"/>Following</>:<><UserPlus className="h-4 w-4"/>Follow</>}</button>}</div>
    <section><h3 className="mb-3 text-lg font-black">Community posts</h3><div className="space-y-3">{result?.posts?.length?result.posts.map((post)=><CommunityPostCard key={post._id} post={{...post,author:{username,fullName:username}}} compact/>):<p className="rounded-2xl border border-dashed p-6 text-sm text-zinc-500">No public community posts yet.</p>}</div></section>
    <section><h3 className="mb-3 text-lg font-black">Responses</h3><div className="space-y-3">{result?.comments?.length?result.comments.map((comment)=><Link key={comment._id} href={`/community/${comment.post.slug}#comment-${comment._id}`} className="block rounded-2xl border border-zinc-200 bg-white p-4 hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900"><p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">{comment.body}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600"><MessageSquare className="h-3.5 w-3.5"/>{comment.post.title}</span></Link>):<p className="rounded-2xl border border-dashed p-6 text-sm text-zinc-500">No public responses yet.</p>}</div></section>
  </div>;
}

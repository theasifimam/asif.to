import React from 'react';
import AuthorClient from '@/components/AuthorClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getAuthor(username) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/users/public/${username}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data.user;
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await getAuthor(username);

  if (!user) {
    return {
      title: 'Author Not Found | Mazlis News'
    };
  }

  const description = user.bio || `View articles and profile of ${user.fullName} on Mazlis News.`;

  return {
    title: `${user.fullName} | Author at Mazlis News`,
    description: description,
    openGraph: {
      title: `${user.fullName} | Mazlis News`,
      description: description,
      images: [user.avatar ? user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_STORAGE_URL}${user.avatar}` : '/logo.jpeg'],
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.fullName} (@${user.username}) | Mazlis News`,
      description: user.bio || `Read articles by ${user.fullName} on Mazlis News.`,
      images: [user.avatar ? user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_STORAGE_URL}${user.avatar}` : '/logo.jpeg']
    }
  };
}

export default async function AuthorProfilePage({ params }) {
  const { username } = await params;

  return <AuthorClient username={username} />;
}
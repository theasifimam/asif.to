import React from 'react';
import AuthorClient from '@/components/AuthorClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

async function getAuthor(username) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.11:5000/api/v1";
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
      images: [user.avatar ? user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}` : '/logo.jpeg'],
      type: 'profile'
    },
    twitter: {
      card: 'summary',
      title: user.fullName,
      description: description,
      images: [user.avatar ? user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}` : '/logo.jpeg']
    }
  };
}

export default async function AuthorProfilePage({ params }) {
  const { username } = await params;

  return <AuthorClient username={username} />;
}
import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';

export default function ArticleHeader() {
  return (
    <AdminPageHeader eyebrow="Content / Articles" title="Articles" description="Search, review, publish, and manage editorial content." actions={
        <Link
          href="/articles/new"
        >
          <Button><Plus className="mr-2 h-4 w-4" /> New article</Button>
        </Link>
    } />
  );
}

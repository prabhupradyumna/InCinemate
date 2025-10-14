"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MovieTable } from '@/components/super-admin/movie-table';

export default function MoviesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Movie Management</h1>
          <p className="text-muted-foreground">Manage all movies available on the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Refresh</Button>
          <Link href="/superadmin/movies/add">
            <Button variant="default" className="bg-blue-600 text-white">+ Add Movie</Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <MovieTable statusFilter={statusFilter} />
    </div>
  );
}

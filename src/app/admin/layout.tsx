'use client';
import { ReactNode } from 'react';
import Navbar from '@/components/navbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </>
  );
} 
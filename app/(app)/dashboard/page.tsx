import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { Target } from 'lucide-react';

export const metadata = { title: 'My OKRs' };

export default function DashboardPage() {
  return (
    <>
      <AppHeader title="My OKRs" />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<Target className="h-10 w-10" />}
          title="No objectives yet"
          description="Your objectives and key results will appear here once they're created."
        />
      </div>
    </>
  );
}

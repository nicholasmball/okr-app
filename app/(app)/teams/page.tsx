import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { Users } from 'lucide-react';

export const metadata = { title: 'Teams' };

export default function TeamsPage() {
  return (
    <>
      <AppHeader title="Teams" />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No teams yet"
          description="Teams will be listed here once they're created in settings."
        />
      </div>
    </>
  );
}

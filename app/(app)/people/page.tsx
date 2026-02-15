import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { UserCircle } from 'lucide-react';

export const metadata = { title: 'People' };

export default function PeoplePage() {
  return (
    <>
      <AppHeader title="People" />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<UserCircle className="h-10 w-10" />}
          title="No team members yet"
          description="Team members will appear here once they join your organisation."
        />
      </div>
    </>
  );
}

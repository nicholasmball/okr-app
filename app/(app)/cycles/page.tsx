import { AppHeader } from '@/components/layout/app-header';
import { EmptyState } from '@/components/okr/empty-state';
import { CalendarDays } from 'lucide-react';

export const metadata = { title: 'Cycles' };

export default function CyclesPage() {
  return (
    <>
      <AppHeader title="Cycles" />
      <div className="flex-1 p-6">
        <EmptyState
          icon={<CalendarDays className="h-10 w-10" />}
          title="No cycles yet"
          description="OKR cycles will be managed here."
        />
      </div>
    </>
  );
}

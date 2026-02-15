import { AppHeader } from '@/components/layout/app-header';

export const metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" />
      <div className="flex-1 p-6">
        <p className="text-sm text-muted-foreground">Settings will be configured here.</p>
      </div>
    </>
  );
}

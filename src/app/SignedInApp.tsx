import { useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ShelfScreen } from '../features/library/ShelfScreen';
import { ReviewScreen } from '../features/review/ReviewScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { ThemeSync } from '../features/settings/ThemeSync';
import { VocabularyScreen } from '../features/vocabulary/VocabularyScreen';
import { AppShell } from './AppShell';
import type { Backend } from './backend';
import { DataProvider } from './DataProvider';

type SignedInAppProps = {
  backend: Backend;
  uid: string;
};

export function SignedInApp({ backend, uid }: SignedInAppProps) {
  const repositories = useMemo(() => backend.repositories(uid), [backend, uid]);
  return (
    <DataProvider repositories={repositories} syncNow={backend.syncNow}>
      <ThemeSync />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<ShelfScreen />} />
            <Route path="slownik" element={<VocabularyScreen />} />
            <Route path="powtorki" element={<ReviewScreen />} />
            <Route path="ustawienia" element={<SettingsScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

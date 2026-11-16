import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ShelfScreen } from '../features/library/ShelfScreen';
import { ThemeSync } from '../features/settings/ThemeSync';
import { AppShell } from './AppShell';
import type { Backend, DataBackend } from './backend';
import { DataProvider } from './DataProvider';

// Półka jest ekranem startowym; resztę (z pdf.js w czytniku) ładujemy przy pierwszym wejściu.
const ReaderScreen = lazy(() =>
  import('../features/reader/ReaderScreen').then((m) => ({ default: m.ReaderScreen })),
);
const ContinueReading = lazy(() =>
  import('../features/reader/ContinueReading').then((m) => ({ default: m.ContinueReading })),
);
const VocabularyScreen = lazy(() =>
  import('../features/vocabulary/VocabularyScreen').then((m) => ({ default: m.VocabularyScreen })),
);
const WordCardScreen = lazy(() =>
  import('../features/vocabulary/WordCardScreen').then((m) => ({ default: m.WordCardScreen })),
);
const ReviewScreen = lazy(() =>
  import('../features/review/ReviewScreen').then((m) => ({ default: m.ReviewScreen })),
);
const SettingsScreen = lazy(() =>
  import('../features/settings/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
);

type SignedInAppProps = {
  backend: Backend;
  uid: string;
};

function useDataBackend(backend: Backend): DataBackend | null {
  const [data, setData] = useState<DataBackend | null>(null);
  useEffect(() => {
    let active = true;
    void backend.loadData().then((loaded) => {
      if (active) setData(loaded);
    });
    return () => {
      active = false;
    };
  }, [backend]);
  return data;
}

function Routed({ data, uid }: { data: DataBackend; uid: string }) {
  const repositories = useMemo(() => data.repositories(uid), [data, uid]);
  return (
    <DataProvider repositories={repositories} syncNow={data.syncNow}>
      <ThemeSync />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<ShelfScreen />} />
              <Route path="slownik" element={<VocabularyScreen />} />
              <Route path="slownik/:wordId" element={<WordCardScreen />} />
              <Route path="powtorki" element={<ReviewScreen />} />
              <Route path="ustawienia" element={<SettingsScreen />} />
            </Route>
            <Route path="czytaj" element={<ContinueReading />} />
            <Route path="czytaj/:bookId" element={<ReaderScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DataProvider>
  );
}

export function SignedInApp({ backend, uid }: SignedInAppProps) {
  const data = useDataBackend(backend);
  return data ? <Routed data={data} uid={uid} /> : null;
}

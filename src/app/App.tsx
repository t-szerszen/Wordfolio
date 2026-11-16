import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { ShelfScreen } from '../features/library/ShelfScreen';
import { ReviewScreen } from '../features/review/ReviewScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { applyTheme, readCachedTheme } from '../features/settings/theme';
import { VocabularyScreen } from '../features/vocabulary/VocabularyScreen';
import { AppShell } from './AppShell';

export function App() {
  useEffect(() => applyTheme(readCachedTheme()), []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppShell dueCount={0} />}>
          <Route index element={<ShelfScreen />} />
          <Route path="slownik" element={<VocabularyScreen />} />
          <Route path="powtorki" element={<ReviewScreen />} />
          <Route path="ustawienia" element={<SettingsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

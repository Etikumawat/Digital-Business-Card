/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';
import { PermissionsProvider } from './context/permissions';
// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <PermissionsProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </PermissionsProvider>
  );
}

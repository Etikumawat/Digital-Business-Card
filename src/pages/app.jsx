import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
      <title> Business Card </title>
      </Helmet>

      <AppView />
    </>
  );
}

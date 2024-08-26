import { Helmet } from 'react-helmet-async';

import { CountryView } from 'src/sections/country/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <CountryView />
    </>
  );
}

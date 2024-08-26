import { Helmet } from 'react-helmet-async';

import { CityView } from 'src/sections/city/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <CityView />
    </>
  );
}

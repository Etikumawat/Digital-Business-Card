import { Helmet } from 'react-helmet-async';

import { CompanyView } from 'src/sections/company/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <CompanyView />
    </>
  );
}

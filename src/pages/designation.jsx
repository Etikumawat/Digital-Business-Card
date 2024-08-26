import { Helmet } from 'react-helmet-async';

import { DesignationView } from 'src/sections/designation/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <DesignationView />
    </>
  );
}

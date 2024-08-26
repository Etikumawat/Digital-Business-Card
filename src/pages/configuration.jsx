import { Helmet } from 'react-helmet-async';

import { ConfigurationView } from 'src/sections/configuration/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <ConfigurationView />
    </>
  );
}

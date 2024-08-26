import { Helmet } from 'react-helmet-async';

import { StateView } from 'src/sections/state/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <StateView />
    </>
  );
}

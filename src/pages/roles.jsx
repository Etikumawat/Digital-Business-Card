import { Helmet } from 'react-helmet-async';

import { RolesView } from 'src/sections/roles/view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Products | Minimal UI </title>
      </Helmet>

      <RolesView />
    </>
  );
}

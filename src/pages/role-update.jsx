import { Helmet } from 'react-helmet-async';

import { RolesUpdate } from 'src/sections/role-update/view';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Blog | Minimal UI </title>
      </Helmet>

      <RolesUpdate />
    </>
  );
}

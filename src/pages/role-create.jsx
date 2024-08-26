import { Helmet } from 'react-helmet-async';

import { RoleCreate } from 'src/sections/role-create/view';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Business Card</title>
      </Helmet>

      <RoleCreate />
    </>
  );
}

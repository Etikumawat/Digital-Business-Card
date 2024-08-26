import { Helmet } from 'react-helmet-async';

import { DepartmentView } from 'src/sections/department/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>
      <DepartmentView />
    </>
  );
}

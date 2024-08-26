import { Helmet } from 'react-helmet-async';

import { CardList } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>

      <CardList />
    </>
  );
}

import { Helmet } from 'react-helmet-async';

import { ForgotPassView } from 'src/sections/forgot-password/view';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Business Card </title>
      </Helmet>

      <ForgotPassView />
    </>
  );
}

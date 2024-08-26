import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Nav from './nav';
import Main from './main';
import Header from './header';
import { Link, Typography } from '@mui/material';
import { usePermissions } from 'src/context/permissions';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const [openNav, setOpenNav] = useState(false);
  const { updatePermissions } = usePermissions();

  useEffect(() => {
    updatePermissions();
  }, []);

  return (
    <>
      <Header onOpenNav={() => setOpenNav(true)} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Nav openNav={openNav} onCloseNav={() => setOpenNav(false)} />

        <Main>{children}</Main>
      </Box>
      <Typography sx={{ textAlign: 'center' }}>
        Powered By{' '}
        <Link
          sx={{ textDecoration: 'none' }}
          color="primary"
          href="https://www.aeonx.digital"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.aeonx.digital
        </Link>
      </Typography>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

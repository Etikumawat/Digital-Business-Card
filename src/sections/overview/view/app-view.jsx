import { Box, Card, CircularProgress, Grid } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ScanImage from '../../../../public/assets/card1.png';
import AppWidgetSummary from '../app-widget-summary';
import { useEffect, useState } from 'react';
import axiosInstance from 'src/axios';
import toast from 'react-hot-toast';
import apiURL from 'src/config';

export default function AppView() {
  const [rows, setRows] = useState();

  const fetchUsers = () => {
    axiosInstance
      .get(apiURL + '/dashboard/count')
      .then((res) => {
        setRows(res.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography
        color="primary"
        variant="h4"
        sx={{ mb: 5, fontWeight: 'bold', letterSpacing: '0.05em' }}
      >
        Welcome to the AeonX Digital Business Card Portal
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Card Generated"
            total={
              rows?.total_cards ? rows?.total_cards : <CircularProgress color="info" size={24} />
            }
            color="success"
            icon={<img alt="icon" src="/assets/icons/card.png" />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Card Downloaded"
            total={
              rows?.download_qr_count ? (
                rows?.download_qr_count
              ) : (
                <CircularProgress color="info" size={24} />
              )
            }
            color="info"
            icon={<img alt="icon" src="/assets/icons/download.png" />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Card Scanned"
            total={
              rows?.scan_qr_count ? (
                rows?.scan_qr_count
              ) : (
                <CircularProgress color="info" size={24} />
              )
            }
            color="warning"
            icon={<img alt="icon" src="/assets/icons/qrcode.png" />}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
        }}
      >
        <img width={300} height={300} src={ScanImage} alt="Scan QR Code" />
        <Box sx={{ width: '50%', pl: { xs: 0, md: 3 }, textAlign: 'justify' }}>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 2 }}>
            The Business Card Portal is an innovative platform designed to create and manage digital
            business cards efficiently.
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Users can input details like name, title, company, address and the portal generates a
            unique QR code for each card. This QR code can be scanned to instantly share the user's
            contact information, making networking seamless and environmentally friendly.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

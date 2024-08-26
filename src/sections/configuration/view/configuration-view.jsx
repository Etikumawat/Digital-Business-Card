import { Card, Checkbox, Grid, TextField, Typography } from '@mui/material';
import React from 'react';

export default function configuration() {
  return (
    <Card>
      <Typography sx={{ p: 2 }} color="primary" variant="h4">
        Field Selection
      </Typography>
      <Typography sx={{ p: 2, mb: 2 }} color="text.secondary">
        Select which fields from your business card data you want to create in your digital business
        card.
      </Typography>
      <Card sx={{ p: 2 }}>
        <Typography sx={{ p: 2 }} color="primary" variant="h5">
          Personal Details
        </Typography>
        <Grid sx={{ mb: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>First Name</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Last Name</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Email</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
        <Grid sx={{ mb: 2, mt: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Phone</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
        <Typography sx={{ p: 2 }} color="primary" variant="h5">
          Business Details
        </Typography>
        <Grid sx={{ mb: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Company Name</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Department Name</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Designation</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
        <Grid sx={{ mb: 2, mt: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Company Website</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
        <Typography sx={{ p: 2 }} color="primary" variant="h5">
          Address Details
        </Typography>
        <Grid sx={{ mb: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Street</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>City</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Pincode</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
        <Grid sx={{ mb: 2, mt: 2 }} container spacing={2} gridRow={1}>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>State</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography sx={{ p: 2 }}>Country</Typography>
            <Checkbox checked />
            Display <Checkbox />
            Required
          </Grid>
        </Grid>
      </Card>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import axios from 'axios';
import {
  Grid,
  Card,
  Button,
  TextField,
  Container,
  Typography,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  Email,
  Phone,
  Business,
  LocationCity,
  Public,
  Home,
  Http,
  LocationOn,
} from '@mui/icons-material';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import apiURL from 'src/config';
import axiosInstance from 'src/axios';

const MyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const validationSchema = Yup.object({
    first_name: Yup.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters')
      .required('First name is required'),
    last_name: Yup.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters')
      .required('Last name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .max(100, 'Email cannot exceed 100 characters')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^(\+?\d{1,4}[\s-])?(?!0+\s,?$)\d{10,15}$/, 'Phone number must be between 10 digits')
      .required('Phone number is required'),
    company_id: Yup.string().required('Company name is required'),
    department_id: Yup.string().required('Department name is required'),
    designation_id: Yup.string().required('Designation is required'),
    company_address_id: Yup.string().required('Address is required'),
  });

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_id: '',
      department_id: '',
      designation_id: '',
      company_address_id: '',
      address: {
        street: '',
        city: '',
        zip_code: '',
        state: '',
        country: '',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Form Values:', values);
      const apiData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        company_id: values.company_id,
        department_id: values.department_id,
        designation_id: values.designation_id,
        company_address_id: values.company_address_id,
      };

      setLoading(true);

      axiosInstance
        .post(apiURL + '/employees', apiData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => {
          setLoading(false);
          formik.resetForm();
          setTimeout(() => {
            navigate('/card');
          }, 1000);
          return toast.success(res.data.message);
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error.message);
        });
    },
  });

  const fetchCompany = async (search = '') => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${apiURL}/companies?search=${search}`);
      setCompanies(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      // toast.error(error.message);
    }
  };

  const fetchDepartments = async (companyId) => {
    try {
      const res = await axiosInstance.get(`${apiURL}/departments?company_id=${companyId}`);

      setDepartments(res.data.data);
      formik.setFieldValue('department_id', '');
      formik.setFieldValue('designation_id', '');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchDesignations = async (departmentId) => {
    try {
      const res = await axiosInstance.get(`${apiURL}/designations?department_id=${departmentId}`);
      setDesignations(res.data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleCompanyChange = async (event) => {
    const selectedCompanyId = event.target.value;
    const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

    if (selectedCompany) {
      formik.setFieldValue('company_id', selectedCompanyId);
      formik.setFieldValue('company_url', selectedCompany.url);
      setAddresses(selectedCompany.addresses || []);
      await fetchDepartments(selectedCompanyId);
    }
    console.log('Selected Company ID:', selectedCompanyId);
  };

  const handleDepartmentChange = async (event) => {
    const selectedDepartmentId = event.target.value;
    formik.setFieldValue('department_id', selectedDepartmentId);
    await fetchDesignations(selectedDepartmentId);
    console.log('Selected Department ID:', selectedDepartmentId);
  };

  const handleDesignationChange = (event) => {
    const selectedDesignationId = event.target.value;
    formik.setFieldValue('designation_id', selectedDesignationId);
    console.log('Selected Designation ID:', selectedDesignationId);
  };

  const handleAddressChange = (event) => {
    const selectedAddressId = event.target.value;
    const selectedAddress = addresses?.find((address) => address?.id === selectedAddressId);

    if (selectedAddress) {
      formik.setFieldValue('company_address_id', selectedAddressId);
      formik.setFieldValue('address.street', selectedAddress.street);
      formik.setFieldValue('address.city', selectedAddress.city);
      formik.setFieldValue('address.zip_code', selectedAddress.zip_code);
      formik.setFieldValue('address.state', selectedAddress.state);
      formik.setFieldValue('address.country', selectedAddress.country);
    }
    console.log('Selected Address ID:', selectedAddressId);
  };

  return (
    <Container>
      <Toaster />
      <Typography sx={{ mb: 5 }} variant="h4" gutterBottom>
        AeonX Digital Business Card
      </Typography>
      <Card sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <span style={{ fontSize: '18px' }}>Generate digital business card as QR codes</span>

          <Typography color="primary" variant="h6" sx={{ mb: 2, mt: 2 }}>
            Personal Details
          </Typography>
          <Grid sx={{ mb: 2, mt: 2 }} container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="first_name"
                name="first_name"
                label="First Name *"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="last_name"
                name="last_name"
                label="Last Name *"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email *"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone *"
                type="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                  inputProps: {
                    maxLength: 10,
                    inputMode: 'numeric', // Ensures numeric keypad on mobile devices
                  },
                }}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete' &&
                    e.key !== 'ArrowLeft' &&
                    e.key !== 'ArrowRight'
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Grid>
          </Grid>
          <Typography color="primary" variant="h6" sx={{ mb: 2, mt: 2 }}>
            Business Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                error={formik.touched.company_id && Boolean(formik.errors.company_id)}
              >
                <InputLabel>Company *</InputLabel>
                <Select
                  required
                  id="company_id"
                  label="Company"
                  name="company_id"
                  value={formik.values.company_id}
                  onChange={handleCompanyChange}
                  onBlur={formik.handleBlur}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                      </Box>
                    </MenuItem>
                  ) : (
                    companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))
                  )}
                </Select>

                <FormHelperText>
                  {formik.touched.company_id && formik.errors.company_id}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                id="company_url"
                name="company_url"
                label="Company Website *"
                onChange={formik.handleChange}
                value={formik.values.company_url}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <Http /> */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                error={formik.touched.department_id && Boolean(formik.errors.department_id)}
              >
                <InputLabel>Department *</InputLabel>
                <Select
                  required
                  label="Department"
                  id="department_id"
                  name="department_id"
                  value={formik.values.department_id}
                  onChange={handleDepartmentChange}
                  onBlur={formik.handleBlur}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                      </Box>
                    </MenuItem>
                  ) : (
                    departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {/* <FormHelperText>
                  {formik.touched.department_id && formik.errors.department_id}
                </FormHelperText> */}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl
                fullWidth
                error={formik.touched.designation_id && Boolean(formik.errors.designation_id)}
              >
                <InputLabel>Designation *</InputLabel>
                <Select
                  required
                  label="Designation"
                  id="designation_id"
                  name="designation_id"
                  value={formik.values.designation_id}
                  onChange={handleDesignationChange}
                  onBlur={formik.handleBlur}
                >
                  {loading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                      </Box>
                    </MenuItem>
                  ) : (
                    designations.map((designation) => (
                      <MenuItem key={designation.id} value={designation.id}>
                        {designation.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {/* <FormHelperText>
                  {formik.touched.designation_id && formik.errors.designation_id}
                </FormHelperText> */}
              </FormControl>
            </Grid>
          </Grid>
          <Typography color="primary" variant="h6" sx={{ mb: 2, mt: 2 }}>
            Address Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <FormControl
                fullWidth
                error={
                  formik.touched.company_address_id && Boolean(formik.errors.company_address_id)
                }
              >
                <InputLabel>Address *</InputLabel>
                <Select
                  required
                  label="Address"
                  id="company_address_id"
                  name="company_address_id"
                  value={formik.values.company_address_id}
                  onChange={handleAddressChange}
                  onBlur={formik.handleBlur}
                >
                  {' '}
                  {loading ? (
                    <MenuItem disabled>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={20} style={{ marginRight: 10 }} />
                      </Box>
                    </MenuItem>
                  ) : (
                    addresses.map((address) => (
                      <MenuItem key={address.id} value={address.id}>
                        {address.street}, {address.city}, {address.state}, {address.country}
                      </MenuItem>
                    ))
                  )}
                </Select>
                <FormHelperText>
                  {formik.touched.company_address_id && formik.errors.company_address_id}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
          <Grid sx={{ mt: 3 }} container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                id="address-country"
                name="address.country"
                label="Country *"
                value={formik.values.address?.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <LocationOn /> */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                id="address-state"
                name="address.state"
                label="State *"
                value={formik.values.address?.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <LocationOn /> */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                disabled
                fullWidth
                id="address-city"
                name="address.city"
                label="City *"
                value={formik.values.address?.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <LocationCity /> */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                disabled
                fullWidth
                id="address-zip_code"
                name="address.zip_code"
                label="Zip Code *"
                value={formik.values.address?.zip_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <LocationOn /> */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                disabled
                id="address-street"
                name="address.street"
                label="Street *"
                value={formik.values.address?.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{/* <LocationOn />  */}</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mr: 2, mt: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          <Button
            sx={{ mt: 4 }}
            color="primary"
            variant="outlined"
            type="button"
            onClick={formik.handleReset}
          >
            Reset
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default MyForm;

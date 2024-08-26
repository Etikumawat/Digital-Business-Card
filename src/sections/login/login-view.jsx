import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import AeonxLogo from '../../../public/assets/aeonx-logo.png';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import CoolMode from './magic';
import toast, { Toaster } from 'react-hot-toast';
import apiURL from 'src/config';
import { CircularProgress, useMediaQuery } from '@mui/material';
import axiosInstance from 'src/axios';
import { setToken } from 'src/token';
import { usePermissions } from 'src/context/permissions';
import animation from './animation.json';

export default function LoginView() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { updatePermissions } = usePermissions();
  const isSmallScreen = useMediaQuery('(max-width: 526px)');

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    setSubmitting(true);
    axiosInstance
      .post(apiURL + '/login', values)
      .then((res) => {
        setSubmitting(false);
        localStorage.setItem('user', JSON.stringify(res.data));
        toast.success('Login successfully');
        const token = res.data.token;
        setToken(token);
        console.log(token);
        updatePermissions();
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      })
      .catch((error) => {
        setSubmitting(false);
        toast.error(error?.response?.data?.message);
      });
  };

  const forgotPassword = () => {
    return navigate('/reset-password');
  };

  const renderForm = (
    <Formik
      initialValues={{ email: 'admin@gmail.com', password: '1234567890' }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, values, handleChange }) => (
        <Form>
          <Stack spacing={3}>
            <Field
              as={TextField}
              name="email"
              label="Email"
              value={values.email}
              onChange={handleChange}
              helperText={<ErrorMessage name="email" component="div" style={{ color: 'red' }} />}
            />
            <Field
              as={TextField}
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={values.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <Iconify
                        icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={<ErrorMessage name="password" component="div" style={{ color: 'red' }} />}
            />
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
            <Link onClick={forgotPassword} variant="subtitle2" underline="hover">
              Forgot password?
            </Link>
          </Stack>
          <CoolMode
            options={{
              particle:
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiHHuPiotVNxgGjTOrwbJszopMjhJwwtOJcejTlJPNSM3o3UQN2R8nqqZN9OMrX5TcVmg&usqp=CAU',
            }}
          >
            <LoadingButton
              fullWidth
              size="medium"
              type="submit"
              variant="contained"
              // disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress color="inherit" size={24} /> : 'Login as an Admin'}
            </LoadingButton>
          </CoolMode>
        </Form>
      )}
    </Formik>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        height: 1,
        background: 'linear-gradient(to bottom right, #FFFFFF, #f26c13)',
        padding: isSmallScreen ? 2 : 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url(/assets/background/overlay_4.jpg) no-repeat center center/cover',
          opacity: 0.2,
        },
        zIndex: 1,
      }}
    >
      <Stack alignItems="center" justifyContent="center" sx={{ height: 1, display: 'flex' }}>
        <Card
          sx={{
            m: 2,
            p: isSmallScreen ? 2 : 5,
            width: 1,
            maxWidth: 720,
            display: 'flex',
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          {!isSmallScreen && (
            <Lottie animationData={animation} style={{ width: '40%', height: 'auto' }} />
          )}
          <Box sx={{ width: isSmallScreen ? '100%' : 'auto' }}>
            <Link component={RouterLink} sx={{ display: 'contents', mt: 2 }}>
              <Box
                component="span"
                sx={{
                  display: 'block',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 1,
                  m: 2,
                }}
              >
                <img height={35} width={90} src={AeonxLogo} alt="AeonX Logo" />
                <Typography variant="h5">Business Card</Typography>
              </Box>
            </Link>
            <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
              Don’t have an account?
              <Link variant="subtitle2" sx={{ ml: 0.5 }}>
                Get started
              </Link>
            </Typography>
            {renderForm}
          </Box>
        </Card>
      </Stack>
      <Toaster />
    </Box>
  );
}

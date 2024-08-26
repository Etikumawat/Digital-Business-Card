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
import animation from '../../login/animation.json';
import { useNavigate } from 'react-router-dom';
import AeonxLogo from '../../../../public/assets/aeonx-logo.png';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import CoolMode from '../../login/magic';
import toast, { Toaster } from 'react-hot-toast';
import apiURL from 'src/config';
import { CircularProgress, useMediaQuery } from '@mui/material';
import axiosInstance from 'src/axios';
import { setToken } from 'src/token';
import { ArrowBack, KeyboardArrowLeftOutlined } from '@mui/icons-material';

export default function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gmail.com');
  const [otp, setOtp] = useState();
  const [otpField, setOtpField] = useState();
  const [password, setPassword] = useState();
  const [confirm_password, setConfirmpassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendOtpbtn, setSendOtpbtn] = useState(true);
  const [verifyBtn, setVerifybtn] = useState(false);
  const [passwordbtn, setPasswordbtn] = useState(false);
  const [forgotpassword, setForgotpassword] = useState(true);
  const [resetpassword, setResetpassword] = useState(false);
  const [passwordField, setPasswordField] = useState(false);

  const isSmallScreen = useMediaQuery('(max-width: 526px)');
  const handleClick = () => {
    setLoading(true);
    axiosInstance
      .post(apiURL + '/forgot-password', { email })
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        setVerifybtn(true);
        setSendOtpbtn(false);
        setOtpField(true);
        const token = res.data.token;
        setToken(token);
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };
  const handleVerify = () => {
    setLoading(true);
    axiosInstance
      .post(apiURL + '/verify-otp', { email, otp })
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        setLoading(false);
        setPasswordbtn(true);
        setForgotpassword(false);
        setVerifybtn(false);
        setOtpField(false);
        setResetpassword(true);
        setPasswordField(true);
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };
  const handlePasswod = () => {
    setLoading(true);
    axiosInstance
      .post(apiURL + '/confirm-forgot-password', { email, password, confirm_password })
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        setTimeout(() => {
          navigate('/');
        }, 1000);
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };
  const login = () => {
    return navigate('/');
  };
  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField
          required
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email"
        />
        {otpField && (
          <TextField
            required
            maxlength={6}
            minRows={6}
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            label="OTP"
          />
        )}
        {passwordField && (
          <>
            <TextField
              required
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              label="Password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              name="confirm_password"
              value={confirm_password}
              onChange={(e) => setConfirmpassword(e.target.value)}
              type={showconfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowconfirmPassword(!showconfirmPassword)}
                      edge="end"
                    >
                      <Iconify icon={showconfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}
      </Stack>

      {sendOtpbtn && (
        <>
          <LoadingButton
            sx={{ my: 3 }}
            fullWidth
            size="medium"
            type="submit"
            variant="contained"
            onClick={handleClick}
          >
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Send OTP'}
          </LoadingButton>
        </>
      )}
      {verifyBtn && (
        <>
          <LoadingButton
            sx={{ my: 3 }}
            fullWidth
            size="medium"
            type="submit"
            variant="contained"
            onClick={handleVerify}
          >
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Verify OTP'}
          </LoadingButton>
        </>
      )}
      {passwordbtn && (
        <>
          <LoadingButton
            sx={{ my: 3 }}
            fullWidth
            size="medium"
            type="submit"
            variant="contained"
            onClick={handlePasswod}
          >
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Change Password'}
          </LoadingButton>
        </>
      )}
      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        <Link
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={login}
          variant="subtitle2"
          underline="hover"
        >
          <KeyboardArrowLeftOutlined /> Back to login
        </Link>
      </Stack>
    </>
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
            m: 1,
            p: isSmallScreen ? 2 : 5,
            width: 1,
            maxWidth: 420,
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
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
            {forgotpassword && (
              <>
                <Typography variant="body" sx={{ mt: 2, mb: 2 }}>
                  Forgot Password ?
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
                  Please enter your registered email address below to receive an OTP.
                </Typography>
              </>
            )}
            {resetpassword && (
              <>
                <Typography variant="body" sx={{ mt: 2, mb: 2 }}>
                  Reset Password ?
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
                  Ensure your password is strong, with a mix of letters, numbers, and special
                  characters for better security.
                </Typography>
              </>
            )}
            {renderForm}
          </Box>
        </Card>
      </Stack>
      <Toaster />
    </Box>
  );
}

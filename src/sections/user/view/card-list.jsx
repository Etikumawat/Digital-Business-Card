import { useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import apiURL from 'src/config';
import TablePagination from '@mui/material/TablePagination';
import logo from '../../../../public/assets/aeonx-logo.png';
import Scrollbar from 'src/components/scrollbar';
import './card.css';
import UserTable from './userTable';
import TableNoData from '../table-no-data';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import * as XLSX from 'xlsx';
import {
  Avatar,
  Box,
  CardContent,
  CircularProgress,
  DialogActions,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import UserTableRow from '../user-table-row';
import toast, { Toaster } from 'react-hot-toast';
import {
  Apartment,
  Business,
  Cached,
  Call,
  Close,
  CloseFullscreenOutlined,
  CloseOutlined,
  Download,
  Email,
  FileDownloadDoneOutlined,
  FileDownloadOutlined,
  HighlightAltSharp,
  HighlightOffSharp,
  KeyboardArrowLeft,
  Label,
  Language,
  LocalActivity,
  LocationCity,
  LocationOn,
  Person,
  Refresh,
  Work,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { useFormik } from 'formik';
import axiosInstance from 'src/axios';
import { DataGrid } from '@mui/x-data-grid';
import { debounce } from 'lodash';

export default function UserPage() {
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState([]);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [sendLoading, setsendLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  const fetchUsers = useCallback(
    debounce((search) => {
      const params = {
        start: page * rowsPerPage,
        limit: rowsPerPage,
        search: search,
      };

      setsendLoading(true);

      axiosInstance
        .get(apiURL + '/employees/list', {
          params,
        })
        .then((res) => {
          setsendLoading(false);
          setUsers(res?.data?.data);
          setCount(res?.data?.count);
        })
        .catch((error) => {
          setsendLoading(false);
          toast.error(error.response?.data?.message);
        });
    }, 500),
    [page, rowsPerPage]
  );

  const [open, setOpen] = useState(false);
  const [modalQRCode, setModalQRCode] = useState('');
  useEffect(() => {
    fetchUsers(searchValue);
  }, [searchValue, page, rowsPerPage]);

  const handleSort = (event, id) => {
    const nonSortableColumns = ['view', 'send', 'delete', 'qrcodeUrl', 'update'];
    if (!nonSortableColumns.includes(id)) {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.firstName + ' ' + n.lastName);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const [selectedRowId, setSelectedRowId] = useState('');

  const handleQRCodeClick = (qrcodeUrl, rowId) => {
    setModalQRCode(qrcodeUrl);
    setSelectedRowId(rowId);

    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setModalQRCode('');
  };

  const applyFilter = ({ inputData, comparator, filterName }) => {
    const stabilizedThis = inputData.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });

    if (filterName) {
      return stabilizedThis
        .filter((el) => {
          const user = el[0];
          const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          return name.includes(filterName.toLowerCase());
        })
        .map((el) => el[0]);
    }

    return stabilizedThis.map((el) => el[0]);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleDownloadQRCode = () => {
    const link = document.createElement('a');
    link.href = modalQRCode;
    link.download = 'qrcode.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    axiosInstance
      .get(`/employees/download-qr-count/${selectedRowId}`)
      .then((response) => {
        // toast.success(response.data.message);
        toast.success('QR Code downloaded successfully');
        setOpen(false);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [listCard, setListCard] = useState(true);
  const [file, setfile] = useState('');
  const [sendFile, setSendFile] = useState('');
  const [fileView, setFileView] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileText = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      return;
    }

    const file = selectedFile;
    setSelectedFile(file);
    setSendFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length > 0) {
        const columnNames = Object.keys(json[0]);
        setColumns(columnNames);
        setRows(json);
        setFileView(true);
        setUploadDialog(false);
        setListCard(false);
        toast.success('File fetched successfully');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveToApi = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', sendFile);

    axiosInstance
      .post(apiURL + '/employees/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setLoading(false);
        if (res.data.error) {
          toast.error(res.data.message);
        } else {
          if (res.data.validation_data && res.data.validation_data.error_data_count > 0) {
            const errorDetails = res.data.validation_data.error_detail
              .map((detail) => `Row ${detail.row_number}: ${detail.error}`)
              .join('\n');

            const blob = new Blob([errorDetails], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'error_details.txt';
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success(res.data.message);

            setListCard(true);
            setFileView(false);
            fetchUsers();
          } else {
            toast.success(res.data.message);
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const columnsWithIndex = ['No.', ...columns];

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleClickOpen = (id) => {
    setDeleteId(id);
    setDeleteDialog(true);
  };

  const handleClose = () => {
    setDeleteDialog(false);
    setDeleteId(null);
  };
  const [sendqrDialog, setSendqrDialog] = useState(false);
  const [sendqrId, setSendqrId] = useState(null);

  const handleQrSend = (id) => {
    setSendqrId(id);
    setSendqrDialog(true);
  };

  const handleQrClose = () => {
    setSendqrDialog(false);
    setSendqrId(null);
  };
  const [sendemailDialog, setEmailqrDialog] = useState(false);
  const [sendemailId, setSendemailId] = useState(null);

  const handleEmailSend = (id) => {
    setSendemailId(id);
    setEmailqrDialog(true);
  };

  const handleEmailClose = () => {
    setEmailqrDialog(false);
    setSendemailId(null);
  };
  const handleDelete = () => {
    setsendLoading(true);
    setDeleteDialog(false);

    axiosInstance
      .delete(`${apiURL}/employees/${deleteId}`)
      .then((res) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteId));
        toast.success(res.data.message);
        setsendLoading(false);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
        setDeleteId(null);
        setsendLoading(false);
      });
  };

  const [uploadDialog, setUploadDialog] = useState(false);

  const uploadFile = () => {
    setUploadDialog(true);
  };
  const uploadClose = () => {
    setUploadDialog(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setsendLoading(false);
    }, 60000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (dataFiltered != 0) {
      setsendLoading(false);
    }
  }, [dataFiltered]);

  const handleCreate = () => {
    return navigate('/create-card');
  };

  const handleSend = () => {
    setsendLoading(true);
    setSendqrDialog(false);
    axiosInstance
      .post(`${apiURL}/employees/send-qr-code`, {
        phone: sendqrId,
      })
      .then((res) => {
        toast.success(res.data.message);
        setsendLoading(false);
      })
      .catch((error) => {
        setsendLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };

  const emailSend = () => {
    setsendLoading(true);
    axiosInstance
      .post(`${apiURL}/employees/email/send-qr-code`, {
        email: sendemailId,
      })
      .then((res) => {
        toast.success(res.data.message);
        setsendLoading(false);
        setEmailqrDialog(false);
      })
      .catch((error) => {
        setsendLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => {
      if (name.includes('address.')) {
        const field = name.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev.address,
            [field]: value,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  const handleUpdatepage = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };
  const handleViewpage = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };
  const handleCloseView = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(false);
  };

  const sampleFileDownload = () => {
    axiosInstance
      .get(`${apiURL}/employees/download-sample-file`)
      .then((res) => {
        const fileUrl = res.data.url;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'SampleExcel.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // toast.success('File download started!');
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  const removeFile = () => setSelectedFile(null);
  const resetFile = () => {
    setListCard(true);
    setFileView(false);
  };

  const iconStyle = {
    color: '#f26c13',
    marginRight: '10px',
    borderRadius: '50%',
    backgroundColor: '#FFF3E0',
    padding: '8px',
    fontSize: '2.2rem',
  };
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const fetchCompany = async (search = '') => {
    try {
      const res = await axiosInstance.get(`${apiURL}/companies`);
      setCompanies(res.data.data);
    } catch (error) {
      // toast.error(error.message);
    }
  };

  const fetchDepartments = async (companyId) => {
    try {
      const res = await axiosInstance.get(`${apiURL}/departments?company_id=${companyId}`);
      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        setDepartments(res.data.data);
        formik.setFieldValue('department_id', '');
        formik.setFieldValue('designation_id', '');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const fetchDesignations = async (departmentId) => {
    try {
      const res = await axiosInstance.get(`${apiURL}/designations?department_id=${departmentId}`);
      if (res.data.error) {
        toast.error(res.data.message);
      } else {
        setDesignations(res.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCompanyChange = async (event) => {
    const selectedCompanyId = event.target.value;
    const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

    if (selectedCompany) {
      formik.setFieldValue('company_id', selectedCompanyId);
      setDepartments([]);
      setDesignations([]);
      setAddresses(selectedCompany.addresses || []);
      await fetchDepartments(selectedCompanyId);
    }
  };

  const handleDepartmentChange = async (event) => {
    const selectedDepartmentId = event.target.value;
    formik.setFieldValue('department_id', selectedDepartmentId);
    setDesignations([]);
    await fetchDesignations(selectedDepartmentId);
  };

  const handleDesignationChange = (event) => {
    const selectedDesignationId = event.target.value;
    formik.setFieldValue('designation_id', selectedDesignationId);
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
  };

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      setCurrentUser({
        ...selectedUser,
        company_id: selectedUser?.company?.id,
        department_id: selectedUser?.department?.id,
        designation_id: selectedUser?.designation?.id,
        company_address_id: selectedUser?.company_address?.id,
        address: {
          street: selectedUser?.company_address?.street,
          city: selectedUser?.company_address?.city?.name,
          state: selectedUser?.company_address?.state?.name,
          country: selectedUser?.company_address?.country?.name,
          zip_code: selectedUser?.company_address?.zip_code,
        },
      });
    }
    console.log(selectedUser);
  }, [selectedUser]);

  const formik = useFormik({
    initialValues: currentUser || {
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
        state: '',
        country: '',
        zip_code: '',
      },
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const {
        first_name,
        last_name,
        email,
        phone,
        company_id,
        department_id,
        designation_id,
        company_address_id,
      } = values;

      if (
        !first_name ||
        !last_name ||
        !email ||
        !phone ||
        !company_id ||
        !department_id ||
        !designation_id ||
        !company_address_id
      ) {
        return toast.error('All fields are required');
      }

      const updateData = {
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
        .put(`${apiURL}/employees/${selectedUser.id}`, updateData)
        .then((res) => {
          setLoading(false);
          setEditDialogOpen(false);
          toast.success(res.data.message);
          fetchUsers();
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          toast.error(error?.response?.data?.message || 'An error occurred');
        });
    },
  });

  // scan history-------------------

  const scancolumns = [
    { field: 'sr', headerName: 'No', width: 80 },
    { field: 'city', headerName: 'Address', width: 130 },
    { field: 'ip_address', headerName: 'IP Address', width: 180 },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'time', headerName: 'Time', width: 150 },
  ];
  const handleScanpage = (row) => {
    console.log(row);
    setScanHistoryView(true);
    setListCard(false);
    scanDetails(row);
  };
  const [scan, setScan] = useState();
  const [scanCount, setScanCount] = useState();
  const [downloadedCount, setDownloadedCount] = useState();
  const [scanHistoryView, setScanHistoryView] = useState(false);

  const scanDetails = (row) => {
    setLoading(true);
    axiosInstance
      .get(`${apiURL}/employees/scan-logs/${row}`)
      .then((res) => {
        console.log('Raw API response:', res.data);

        if (res.data && res.data.data.length > 0 && res.data.data[0].device_info) {
          const transformedData = res.data.data[0].device_info.map((device, index) => {
            console.log('Raw device data:', device);

            const createdAt = new Date(device.created_at);
            const date = createdAt.toLocaleDateString();
            const time = createdAt.toLocaleTimeString();

            console.log('Formatted Date:', date);
            console.log('Formatted Time:', time);

            return {
              id: device.id,
              sr: device.sr,
              city: device.address.city,
              ip_address: device.ip_address,
              date: date,
              time: time,
              latitude: device.latitude,
              longitude: device.longitude,
              user_agent: device.user_agent,
            };
          });
          console.log('Transformed Data:', transformedData);
          setScanCount(res.data.data[0].scan_count);
          setDownloadedCount(res.data.data[0].download_count);
          setScan(transformedData);
        } else {
          console.log('No device_info found in the response');
          setScan([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.response?.data?.message);
      });
  };

  useEffect(() => {
    if (editDialogOpen === true) {
      fetchCompany();
    }
  }, [editDialogOpen]);

  const backBtn = () => {
    setListCard(true);
    setScanHistoryView(false);
  };
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const setEditDialogClose = () => {
    formik.resetForm();
    setEditDialogOpen(false);
  };
  return (
    <Container>
      <Toaster />
      {listCard && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4">Card List</Typography>
            <Box>
              <Button sx={{ mr: 1 }} variant="contained" onClick={handleCreate} component="label">
                Create
              </Button>
              <Button sx={{ mr: 1 }} variant="contained" component="label" onClick={uploadFile}>
                Bulk Upload
              </Button>
            </Box>
          </Stack>
        </>
      )}

      {sendLoading ? (
        <Stack sx={{ width: '100%', color: '#e06522', mt: 1, mb: 1 }} spacing={2}>
          <LinearProgress className="mb-1" color="inherit" />
        </Stack>
      ) : (
        <Stack sx={{ width: '100%', color: '#e06522', mt: 1, mb: 1 }} spacing={2}>
          <LinearProgress style={{ visibility: 'hidden' }} className="mb-1" color="inherit" />
        </Stack>
      )}

      {fileView && rows.length > 0 && (
        <>
          <>
            <Card>
              {console.log(selectedFile?.name)}
              <Typography variant="h5" sx={{ p: 2 }} color="primary">
                File Name : {selectedFile?.name}
              </Typography>
              <Box sx={{ maxHeight: 800, overflow: 'auto', mt: 2 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columnsWithIndex.map((column) => (
                        <TableCell sx={{ minWidth: 80 }} key={column}>
                          {capitalizeFirstLetter(column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    <>
                      {rows.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          {columns.map((column) => (
                            <TableCell sx={{ minWidth: 150 }} key={column}>
                              {row[column]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </>
                  </TableBody>
                </Table>
              </Box>
            </Card>
          </>

          <Button variant="contained" onClick={handleSaveToApi} sx={{ m: 2 }}>
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Submit'}
          </Button>
          <Button variant="outlined" color="primary" onClick={resetFile}>
            Reset
          </Button>
        </>
      )}

      {listCard && (
        <>
          <Card>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InputBase
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  sx={{
                    ml: 2,
                    flex: 1,

                    '&:hover': {
                      border: '1px solid #f26c13',
                    },
                    border: '1px solid grey',
                    borderRadius: 1,
                    p: 1,
                    pl: 2,
                    width: '300px',
                  }}
                />
              </Box>
              {/* <UserTableToolbar filterName={filterName} onFilterName={handleFilterByName} /> */}
              <Tooltip title="Refresh">
                <Button
                  sx={{ m: 4 }}
                  onClick={() => {
                    fetchUsers();
                  }}
                  variant="contained"
                >
                  <Cached />
                </Button>
              </Tooltip>
            </Box>
            <Scrollbar>
              <TableContainer sx={{ overflow: 'unset' }}>
                <Table sx={{ minWidth: 800 }}>
                  <UserTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={users.length}
                    numSelected={selected.length}
                    onRequestSort={handleSort}
                    onSelectAllClick={handleSelectAllClick}
                    headLabel={[
                      { id: 'sr', label: 'No' },
                      { id: 'name', label: 'Name' },
                      { id: 'company', label: 'Company' },
                      { id: 'department', label: 'Department' },
                      { id: 'designation', label: 'Designation' },
                      { id: 'phone', label: 'Contact' },
                      { id: 'email', label: 'Email' },
                      { id: 'qrcodeUrl', label: 'QR Code' },
                      { id: 'view', label: 'View' },
                      { id: 'scan', label: 'Scan History' },
                      { id: 'update', label: 'Edit' },
                      { id: 'delete', label: 'Delete' },
                      { id: 'send', label: 'Send' },
                    ]}
                  />
                  {loading ? (
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                          >
                            <CircularProgress />
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ) : dataFiltered.length > 0 ? (
                    <>
                      <TableBody>
                        {dataFiltered.map((row) => (
                          <UserTable
                            key={row.id}
                            id={row.id}
                            sr={row.sr}
                            name={`${row.first_name} ${row.last_name}`}
                            company={row.company?.name}
                            department={row.department?.name}
                            designation={row.designation?.name}
                            email={row.email}
                            phone={row.phone}
                            qrcodeUrl={row.qr_code}
                            selected={selected.indexOf(`${row.firstName} ${row.lastName}`) !== -1}
                            handleClick={(event) =>
                              handleClick(event, `${row.firstName} ${row.lastName}`)
                            }
                            onQRCodeClick={() => handleQRCodeClick(row.qr_code, row.id)}
                            handleView={() => handleViewpage(row)}
                            handleScan={() => handleScanpage(row.id)}
                            handleUpdate={() => handleUpdatepage(row)}
                            handleDelete={() => handleClickOpen(row.id)}
                            handleSendQr={() => handleQrSend(row.phone)}
                            handleSendEmail={() => handleEmailSend(row.email)}
                          />
                        ))}

                        {notFound && <TableNoData query={filterName} />}
                      </TableBody>
                    </>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell colSpan={14} align="center">
                          No records are found
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </Table>
              </TableContainer>
            </Scrollbar>
            <TablePagination
              page={page}
              component="div"
              count={count}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </>
      )}
      {/* ===========scan table==============*/}
      {scanHistoryView && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4">Scan History List</Typography>
            <Box>
              <Button variant="contained" onClick={backBtn}>
                <KeyboardArrowLeft />
                Back
              </Button>
            </Box>
          </Stack>

          <Card style={{ height: 400, width: '100%' }}>
            {loading ? (
              <>
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              </>
            ) : (
              <>
                <DataGrid
                  rows={scan}
                  columns={scancolumns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  // checkboxSelection
                />
              </>
            )}
          </Card>
          <p style={{ color: 'grey' }}>
            Total Scan Count :{' '}
            <span style={{ color: 'black' }}>{scanCount ? scanCount : 'NA'}</span>
          </p>
          <p style={{ color: 'grey' }}>
            Total Downloaded QR Count :
            <span style={{ color: 'black' }}>{downloadedCount ? downloadedCount : 'NA'}</span>
          </p>
        </>
      )}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md">
        <DialogTitle>Edit Card</DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid sx={{ mt: 2 }} container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                {console.log(formik.values)}

                <FormControl fullWidth margin="dense">
                  <InputLabel>Company</InputLabel>

                  <Select
                    label="Company"
                    name="company_id"
                    value={formik.values.company_id}
                    onChange={handleCompanyChange}
                  >
                    <MenuItem value={formik.values.company?.id} disabled>
                      {formik.values.company?.name}
                    </MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    name="department_id"
                    value={formik.values.department_id}
                    onChange={handleDepartmentChange}
                  >
                    <MenuItem value={formik.values.department?.id} disabled>
                      {formik.values.department?.name}
                    </MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Designation</InputLabel>

                  <Select
                    label="Designation"
                    name="designation_id"
                    value={formik.values.designation_id}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value={formik.values.designation?.id} disabled>
                      {formik.values.designation?.name}
                    </MenuItem>
                    {designations.map((designation) => (
                      <MenuItem key={designation.id} value={designation.id}>
                        {designation.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Address</InputLabel>
                  {console.log(formik.values)}
                  <Select
                    label="Address"
                    name="company_address_id"
                    value={formik.values.company_address_id}
                    onChange={handleAddressChange}
                  >
                    <MenuItem value={formik.values.company_address_id} disabled>
                      {formik.values.address?.street}, {formik.values.address?.city},{' '}
                      {formik.values.address?.state}
                    </MenuItem>
                    {addresses.map((address) => (
                      <MenuItem key={address.id} value={address.id}>
                        {address.street}, {address.city.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2, mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  margin="dense"
                  label="Street"
                  name="address.street"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
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
                  margin="dense"
                  label="City"
                  name="address.city"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">{/* <LocationCity /> */}</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  disabled
                  margin="dense"
                  label="Zip Code"
                  name="address.zip_code"
                  value={formik.values.address.zip_code}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2, mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  disabled
                  margin="dense"
                  label="State"
                  name="address.state"
                  value={formik.values.address.state}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  disabled
                  fullWidth
                  margin="dense"
                  label="Country"
                  name="address.country"
                  value={formik.values.address.country}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={setEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" disabled={loading} onClick={formik.handleSubmit}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            bgcolor: '#f26c13',
            color: '#fff',
            position: 'relative',
            p: 2,
          }}
        >
          Business Card
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#fff',
            }}
          >
            <HighlightOffSharp />
          </IconButton>
        </DialogTitle>
        <div className="curved-background">
          <div className="curved-content">
            <DialogContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 1,
                  mx: 'auto',
                }}
              >
                <Box>
                  <Typography color="primary" variant="h5">
                    {selectedUser?.first_name} {selectedUser?.last_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser?.designation?.name}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <img
                    width={80}
                    height={32}
                    src={logo}
                    alt="Company Logo"
                    style={{ borderRadius: '4px' }}
                  />
                </Box>
              </Box>

              <Box
                sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}
                container
                spacing={2}
              >
                <Box>
                  <Grid sx={{ mb: 1 }} item xs={12} sm={6}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <Email sx={iconStyle} /> {selectedUser?.email || ''}
                    </Typography>
                  </Grid>

                  <Grid sx={{ mb: 1 }} item xs={12} sm={12}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <Call sx={iconStyle} /> {selectedUser?.phone || ''}
                    </Typography>
                  </Grid>
                  <Grid sx={{ mb: 1 }} item xs={12} sm={12}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <Apartment sx={iconStyle} /> {selectedUser?.company?.name || ''}
                    </Typography>
                  </Grid>
                  <Grid sx={{ mb: 1 }} item xs={12} sm={12}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <Business sx={iconStyle} /> {selectedUser?.department?.name || ''}
                    </Typography>
                  </Grid>
                  {/* <Grid sx={{ mb: 1 }} item xs={12} sm={6}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <Language sx={iconStyle} /> {selectedUser?.company_url?.name || ''}
                    </Typography>
                  </Grid> */}
                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="body1"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'grey',
                        fontSize: '14px',
                      }}
                    >
                      <LocationOn sx={iconStyle} />
                      {selectedUser?.company_address?.street},{' '}
                      {selectedUser?.company_address?.city?.name}-
                      {selectedUser?.company_address?.zip_code},
                      {selectedUser?.company_address?.state?.name},{' '}
                      {selectedUser?.company_address?.country?.name}
                    </Typography>
                  </Grid>
                </Box>
                <Grid sx={{ textAlign: 'center' }}>
                  <Box>
                    <img width={120} src={selectedUser?.qr_code} alt="Profile Picture" />
                  </Box>
                </Grid>
              </Box>
            </DialogContent>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={deleteDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={sendqrDialog}
        onClose={handleQrClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to send QR Code to user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSend} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={handleQrClose} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={sendemailDialog}
        onClose={handleEmailClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to send the QR code via email to the user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={emailSend} color="primary" autoFocus>
            Yes
          </Button>
          <Button onClick={handleEmailClose} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={uploadDialog}
        onClose={uploadClose}
        aria-labelledby="upload-dialog-title"
        aria-describedby="upload-dialog-description"
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: '600px',
            height: 'auto',
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={uploadClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <HighlightOffSharp color="primary" />
          </IconButton>
        </DialogTitle>
        {/* <DialogContent>
          <Typography sx={{ mt: 2 }} variant="h6" color="primary">
            Select Type
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="demo-simple-select-label">Select</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Upload"
            >
              <MenuItem value={0}>Upload</MenuItem>
              <MenuItem value={1}>Update</MenuItem>
            </Select>
          </FormControl>
        </DialogContent> */}
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography color="primary" variant="h6">
              Select an Excel file for bulk upload
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="contained" component="label" color="primary">
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={fileText}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </Button>
              {selectedFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', maxWidth: '300px' }}>
                    {selectedFile.name}
                  </Typography>
                  <HighlightOffSharp
                    sx={{ cursor: 'pointer' }}
                    color="error"
                    onClick={removeFile}
                  />
                </Box>
              )}
            </Box>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
              }}
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload File
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileDownloadOutlined />}
              onClick={sampleFileDownload}
            >
              Download Sample Excel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <HighlightOffSharp color="primary" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={modalQRCode}
            alt="QR Code"
            style={{ width: '50%', height: 'auto', marginBottom: 16 }}
          />
          <Button variant="contained" color="primary" onClick={handleDownloadQRCode}>
            Download
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

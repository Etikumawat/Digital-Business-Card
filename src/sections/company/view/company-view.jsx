import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
  Toolbar,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  InputBase,
  Divider,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Edit, Delete, Add, Close, Cached } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import apiURL from 'src/config';
import axiosInstance from 'src/axios';
import { debounce } from 'lodash';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array?.map((el, index) => [el, index]);
  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis?.map((el) => el[0]);
}

const headCells = [
  { id: 'sr', numeric: false, disablePadding: true, label: 'No ' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Company' },
  { id: 'url', numeric: false, disablePadding: false, label: 'URL' },
  { id: 'addresses.city', numeric: false, disablePadding: false, label: 'Addresses' },
  { id: 'update', numeric: true, disablePadding: false, label: 'Update' },
  { id: 'delete', numeric: true, disablePadding: false, label: 'Delete' },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox"></TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'update' || headCell.id === 'delete' ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, searchValue, handleSearchChange, onCreateClick, onRefresh } = props;
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
        <Typography sx={{ flex: '1 1 100%' }} variant="h5" id="tableTitle" component="div">
          Company List
        </Typography>
        <Button variant="contained" onClick={onCreateClick}>
          Create
        </Button>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'end', mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InputBase
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            sx={{
              ml: 1,
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

        <Tooltip title="Refresh">
          <Button sx={{ m: 4 }} onClick={onRefresh} variant="contained">
            <Cached />
          </Button>
        </Tooltip>
      </Box>
    </>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  searchValue: PropTypes.string.isRequired,
  onCreateClick: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  handleSearchChange: PropTypes.func.isRequired,
};

export default function EnhancedTable() {
  // const navigate = useNavigation();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [urlName, setUrlName] = useState('');
  const [departmentValue, setDepartmentValue] = useState('');

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [department, setDepartment] = useState([]);
  const [addresses, setAddresses] = useState([
    { country_id: '', state_id: '', city_id: '', street: '', zip_code: '' },
  ]);
  const [selectedCountryIds, setSelectedCountryIds] = useState([]);
  const [selectedStateIds, setSelectedStateIds] = useState([]);
  const [selectedCityIds, setSelectedCityIds] = useState([]);

  const [companyData, setCompanyData] = useState({
    name: '',
    url: '',
    addresses: [],
  });
  const fetchUsers = useCallback(
    debounce((search) => {
      const params = {
        start: page * rowsPerPage,
        limit: rowsPerPage,
        search: search,
      };
      setLoading(true);
      axiosInstance
        .get(apiURL + '/companies', { params })
        .then((res) => {
          setLoading(false);
          setRows(res.data.data);
          setCompanyData(res.data?.data);
          setTotalRows(res.data.count);
        })
        .catch((error) => {
          setLoading(false);
                  toast.error(error?.response?.data?.message);

        });
    }, 500),
    [page, rowsPerPage]
  );

  const [country, setCountry] = useState([]);
  const [state, setState] = useState([]);
  const [city, setCity] = useState([]);
  const [countryInput, setCountryInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');

  const fetchCountries = async (search = '') => {
    try {
      const res = await axiosInstance.get(`${apiURL}/countries?search=${search}`);
      setCountry(res.data.data);
    } catch (error) {
      //         toast.error(error?.response?.data?.message);

    }
  };
  useEffect(() => {
    if (createDialogOpen === true) {
      fetchCountries();
    }
  }, [createDialogOpen]);

  const fetchStates = async (countryId, search = '') => {
    try {
      const res = await axiosInstance.get(
        `${apiURL}/states?country_id=${countryId}&search=${search}`
      );
      setState(res.data.data);
    } catch (error) {
      //         toast.error(error?.response?.data?.message);

    }
  };

  const fetchCities = async (stateId, search = '') => {
    try {
      const res = await axiosInstance.get(`${apiURL}/cities?state_id=${stateId}&search=${search}`);

      setCity(res.data.data);
    } catch (error) {
              toast.error(error?.response?.data?.message);

    }
  };

  useEffect(() => {
    if (selectedCountryId) {
      fetchStates(selectedCountryId);
    } else {
      setState([]);
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      fetchCities(selectedStateId);
    } else {
      setCity([]);
    }
  }, [selectedStateId]);

  useEffect(() => {
    fetchUsers(searchValue);
  }, [searchValue, page, rowsPerPage]);

  const handleCreateCountryChange = (index, value) => {
    handleAddressChange(index, 'country_id', value ? value.id : '');
    fetchStates(value ? value.id : '');
  };

  const handleCreateStateChange = (index, value) => {
    handleAddressChange(index, 'state_id', value ? value.id : '');
    fetchCities(value ? value.id : '');
  };

  const handleCreateCityChange = (index, value) => {
    handleAddressChange(index, 'city_id', value ? value.id : '');
  };
  const handleCountryChange = (index, newCountry) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].country = newCountry.id;
    updatedAddresses[index].country_id = newCountry.id; // Update the country_id field
    setAddresses(updatedAddresses);
    console.log(updatedAddresses);

    fetchStates(newCountry.id);
  };

  const handleStateChange = (index, newState) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].state = newState.id;
    updatedAddresses[index].state_id = newState.id; // Update the state_id field
    setAddresses(updatedAddresses);
    console.log(updatedAddresses);

    fetchCities(newState.id);
  };

  const handleCityChange = (index, newCity) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].city = newCity.id;
    updatedAddresses[index].city_id = newCity.id; // Update the city_id field
    setAddresses(updatedAddresses);
    console.log(updatedAddresses);
  };

  const handleAddressChange = (index, key, value) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index][key] = value;
    setAddresses(updatedAddresses);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows?.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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
  // const handleCountryChange = (index, value) => {
  //   setAddressData((prevAddresses) => {
  //     const updatedAddresses = [...prevAddresses];
  //     updatedAddresses[index].country = value.name;
  //     updatedAddresses[index].state = ''; // Clear state and city when country changes
  //     updatedAddresses[index].city = '';
  //     return updatedAddresses;
  //   });
  //   fetchStates(value.id); // Fetch states for the selected country
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleCreateDialogOpen = () => {
    setDepartmentName('');
    setUrlName('');
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setDepartmentName('');
    setUrlName('');
    setAddresses([1]);
    setCreateDialogOpen(false);
  };

  const handleUpdateDialogOpen = (department) => {
    setDepartmentName(department?.name);
    setUrlName(department?.url);
    setAddresses(department?.addresses);
    setSelectedDepartment(department);
    setUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setDepartmentName('');
    setUrlName('');
    setAddresses(['']);
    setUpdateDialogOpen(false);
  };

  const handleDeleteDialogOpen = (department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDepartmentNameChange = (event) => {
    setDepartmentName(event.target.value);
  };
  const handleUrlNameChange = (event) => {
    setUrlName(event.target.value);
  };

  const handleAddAddress = () => {
    setAddresses((prevAddresses) => [
      ...prevAddresses,
      { country_id: '', state_id: '', city_id: '', street: '', zip_code: '' },
    ]);
  };

  const handleRemoveAddress = (index) => {
    setAddresses((prevAddresses) => prevAddresses.filter((_, i) => i !== index));
  };

  const handleCreateAddressChange = (index, field, value) => {
    setAddresses((prevAddresses) => {
      const updatedAddresses = [...prevAddresses];
      updatedAddresses[index] = {
        ...updatedAddresses[index],
        [field]: value,
      };
      return updatedAddresses;
    });
  };
  const handleCreateDepartment = () => {
    setLoading(true);
    if (!departmentName) {
      toast.error('Company name required');
      setLoading(false);
      return;
    }
    if (!urlName) {
      toast.error('Company URL required');
      setLoading(false);
      return;
    }

    const dataToSend = {
      name: departmentName,
      url: urlName,
      addresses: addresses?.map((address) => ({
        country_id: address.country_id || null,
        state_id: address.state_id || null,
        city_id: address.city_id || null,
        street: address.street || '',
        zip_code: address.zip_code || '',
      })),
    };

    axiosInstance
      .post(apiURL + '/companies', dataToSend)
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        fetchUsers();
        handleCreateDialogClose();
      })
      .catch((error) => {
        setLoading(false);
                toast.error(error?.response?.data?.message);

      });
  };
  const handleUpdateDepartment = () => {
    setLoading(true);
    if (!departmentName) {
      toast.error('Company name required');
      setLoading(false);
      return;
    }
    if (!urlName) {
      toast.error('Company URL required');
      setLoading(false);
      return;
    }
    const dataToSend = {
      name: departmentName,
      url: urlName,
      addresses: addresses?.map((address) => {
        return {
          country_id: address.country_id || null,
          state_id: address.state_id || null,
          city_id: address.city_id || null,
          street: address.street || '',
          zip_code: address.zip_code || '',
        };
      }),
    };

    axiosInstance
      .put(`${apiURL}/companies/${selectedDepartment.id}`, dataToSend)
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        fetchUsers();
        handleUpdateDialogClose();
      })
      .catch((error) => {
        setLoading(false);
                toast.error(error?.response?.data?.message);

      });
  };

  const handleDeleteDepartment = () => {
    setLoading(true);
    axiosInstance
      .delete(`${apiURL}/companies/${selectedDepartment.id}`)
      .then((res) => {
        setLoading(false);
        toast.success(res.data.message);
        fetchUsers();
        handleDeleteDialogClose();
      })
      .catch((error) => {
        setLoading(false);
                toast.error(error?.response?.data?.message);

      });
  };
  console.log(addresses);
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          searchValue={searchValue}
          handleSearchChange={handleSearchChange}
          numSelected={selected.length}
          onCreateClick={handleCreateDialogOpen}
          onRefresh={fetchUsers}
        />
        <TableContainer>
          {loading ? (
            <Stack sx={{ width: '100%', color: '#e06522', mt: 1 }} spacing={2}>
              <LinearProgress className="mb-1" color="inherit" />
            </Stack>
          ) : (
            <Stack sx={{ width: '100%', color: '#e06522', mt: 1 }} spacing={2}>
              <LinearProgress style={{ visibility: 'hidden' }} className="mb-1" color="inherit" />
            </Stack>
          )}
          <Table sx={{ minWidth: 750, mt: 2 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected?.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows?.length}
            />
            {rows.length > 0 ? (
              <>
                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <>
                        <>
                          <TableRow
                            hover
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            // onClick={(event) => handleClick(event, row.id)}
                          >
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell component="th" id={labelId} scope="row" padding="none">
                              {index + 1 + page * rowsPerPage}
                            </TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.url}</TableCell>

                            <TableCell>
                              {row.addresses?.map((address) => address.city).join(', ')}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Edit">
                                <IconButton onClick={() => handleUpdateDialogOpen(row)}>
                                  <Edit color="info" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Delete">
                                <IconButton onClick={() => handleDeleteDialogOpen(row)}>
                                  <Delete color="error" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        </>
                      </>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={12} />
                    </TableRow>
                  )}
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
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Toaster />

      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Create Company</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 3 }} spacing={2}>
            <TextField
              required
              label="Company"
              value={departmentName}
              onChange={handleDepartmentNameChange}
              fullWidth
            />
            <TextField
              required
              label="URL"
              value={urlName}
              onChange={handleUrlNameChange}
              fullWidth
            />
            <Grid container spacing={2}>
              {console.log(addresses)}
              {addresses?.map((address, index) => (
                <React.Fragment key={index}>
                  <Typography>Company Address : {index + 1}</Typography>
                  <Grid sx={{ mb: 2, mt: 2 }} container spacing={2} gridRow={1}>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        options={country}
                        getOptionLabel={(option) => option.name || ''}
                        onInputChange={(event, newInputValue) => {
                          setCountryInput(newInputValue);
                          fetchCountries(newInputValue);
                        }}
                        onChange={(event, value) => {
                          handleCreateCountryChange(index, value);
                          setCountryInput(value ? value.name : '');
                        }}
                        renderInput={(params) => <TextField required {...params} label="Country" />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        options={state}
                        getOptionLabel={(option) => option.name || ''}
                        onInputChange={(event, newInputValue) => {
                          setStateInput(newInputValue);
                          fetchStates(selectedCountryId, newInputValue);
                        }}
                        onChange={(event, value) => {
                          handleCreateStateChange(index, value);
                          setStateInput(value ? value.name : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            required
                            {...params}
                            label="State"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: <>{params.InputProps.endAdornment}</>,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        options={city}
                        getOptionLabel={(option) => option.name || ''}
                        onInputChange={(event, newInputValue) => {
                          setCityInput(newInputValue);
                          fetchCities(selectedStateId, newInputValue);
                        }}
                        onChange={(event, value) => {
                          handleCreateCityChange(index, value);
                          setCityInput(value ? value.name : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            required
                            {...params}
                            label="State"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: <>{params.InputProps.endAdornment}</>,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Grid sx={{ mb: 2 }} container spacing={2} gridRow={1}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        required
                        label="Zip Code"
                        value={address.zip_code}
                        onChange={(e) =>
                          handleCreateAddressChange(index, 'zip_code', e.target.value)
                        }
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        required
                        label="Street"
                        value={address.street}
                        onChange={(e) => handleCreateAddressChange(index, 'street', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    {index != 0 && (
                      <>
                        <Grid item xs={12} md={2}>
                          <IconButton
                            variant="contained"
                            onClick={() => handleRemoveAddress(index)}
                          >
                            <Close color="error" />
                          </IconButton>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Button onClick={handleAddAddress} startIcon={<Add />} variant="contained">
              Add Address
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateDepartment} color="primary" variant="contained">
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth open={updateDialogOpen} onClose={handleUpdateDialogClose}>
        <DialogTitle>Update Company</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 3 }} spacing={2}>
            <TextField
              required
              label="Company"
              value={departmentName}
              onChange={handleDepartmentNameChange}
              fullWidth
            />
            <TextField
              required
              label="Url"
              value={urlName}
              onChange={handleUrlNameChange}
              fullWidth
            />
            <Grid container spacing={2}>
              {addresses?.map((address, index) => {
                return (
                  <React.Fragment key={index}>
                    <Typography>Company Address : {index + 1}</Typography>
                    <Grid sx={{ mb: 2, mt: 2 }} container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Country * </InputLabel>
                          <Select
                            required
                            onChange={(event) => {
                              const newCountryId = event.target.value;
                              const newCountry = country.find((c) => c.id === newCountryId);
                              setSelectedCountryIds((prev) => {
                                const newSelectedCountryIds = [...prev];
                                newSelectedCountryIds[index] = newCountryId;
                                return newSelectedCountryIds;
                              });
                              handleCountryChange(index, newCountry);
                              fetchStates(newCountryId);
                            }}
                            label="Country"
                            value={selectedCountryIds[index] || address?.country}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  maxWidth: 100,
                                },
                              },
                            }}
                          >
                            <MenuItem value={address?.country} disabled>
                              {address?.country}
                            </MenuItem>
                            {country.map((c) => (
                              <MenuItem key={c.id} value={c.id}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>State * </InputLabel>
                          <Select
                            required
                            onChange={(event) => {
                              const newStateId = event.target.value;
                              console.log(newStateId);

                              const newState = state.find((s) => s.id === newStateId);
                              setSelectedStateIds((prev) => {
                                const newSelectedStateIds = [...prev];
                                newSelectedStateIds[index] = newStateId;
                                return newSelectedStateIds;
                              });
                              handleStateChange(index, newState);
                              fetchCities(newStateId);
                            }}
                            label="State"
                            value={selectedStateIds[index] || address?.state}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  maxWidth: 100,
                                },
                              },
                            }}
                          >
                            <MenuItem value={address?.state} disabled>
                              {address?.state}
                            </MenuItem>
                            {state.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>City * </InputLabel>
                          <Select
                            required
                            onChange={(event) => {
                              const newCityId = event.target.value;
                              const newCity = city.find((c) => c.id === newCityId);
                              setSelectedCityIds((prev) => {
                                const newSelectedCityIds = [...prev];
                                newSelectedCityIds[index] = newCityId;
                                return newSelectedCityIds;
                              });
                              handleCityChange(index, newCity);
                              console.log(newCityId);
                            }}
                            label="City"
                            value={selectedCityIds[index] || address?.city}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 200,
                                  maxWidth: 100,
                                },
                              },
                            }}
                          >
                            <MenuItem value={address?.city} disabled>
                              {address?.city}
                            </MenuItem>
                            {city.map((c) => (
                              <MenuItem key={c.id} value={c.id}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid sx={{ mb: 2 }} container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          required
                          label="Zip Code"
                          value={address.zip_code}
                          onChange={(e) => handleAddressChange(index, 'zip_code', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          label="Street"
                          value={address.street}
                          onChange={(e) => handleAddressChange(index, 'street', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      {index !== 0 && (
                        <Grid item xs={12} md={2}>
                          <IconButton
                            variant="contained"
                            onClick={() => handleRemoveAddress(index)}
                          >
                            <Close color="error" />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </React.Fragment>
                );
              })}
            </Grid>

            <Button onClick={handleAddAddress} startIcon={<Add />} variant="contained">
              Add Address
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateDepartment} variant="contained">
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography> Do you want to delete this company "{selectedDepartment?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteDepartment} variant="contained" color="error">
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

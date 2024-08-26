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
  CircularProgress,
  MenuItem,
  InputBase,
  Divider,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Edit, Delete, Cached } from '@mui/icons-material';
import axios from 'axios';
import { alpha } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import apiURL from 'src/config';
import { Form } from 'formik';
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
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'sr', numeric: false, disablePadding: true, label: 'No ' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Department' },
  { id: 'company.name', numeric: false, disablePadding: false, label: 'Company' },
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
          Department List
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
  const [companyValue, setCompanyValue] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [company, setCompany] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  const fetchUsers = useCallback(
    debounce((search) => {
      const params = {
        start: page * rowsPerPage,
        limit: rowsPerPage,
        search: search,
      };
      setLoading(true);
      axiosInstance
        .get(apiURL + '/departments', { params })
        .then((res) => {
          setLoading(false);
          setRows(res.data.data);
          setTotalRows(res.data.count);
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error?.response?.data?.message);
        });
    }, 500),
    [page, rowsPerPage]
  );

  const fetchCompany = () => {
    axiosInstance
      .get(apiURL + '/companies')
      .then((res) => {
        setCompany(res.data.data);
      })
      .catch((error) => {
        //         toast.error(error?.response?.data?.message);
      });
  };

  useEffect(() => {
    fetchUsers(searchValue);
  }, [searchValue, page, rowsPerPage]);

  useEffect(() => {
    if (createDialogOpen || updateDialogOpen === true) {
      fetchCompany();
    }
  }, [createDialogOpen, updateDialogOpen]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const emptyRows = rowsPerPage - rows.length;

  const handleCreateDialogOpen = () => {
    setDepartmentName('');
    setCompanyValue('');
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleUpdateDialogOpen = (department) => {
    setDepartmentName(department.name);
    setCompanyValue(department.company ? department.company.id : '');
    setSelectedDepartment(department);
    setUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setUpdateDialogOpen(false);
  };

  const handleDeleteDialogOpen = (department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleCreateDepartment = () => {
    setLoading(true);
    if (!companyValue) {
      toast.error('Company name required');
      setLoading(false);
      return;
    }
    if (!departmentName) {
      toast.error('Department name required');
      setLoading(false);
      return;
    }
    const data = {
      name: departmentName,
      company_id: companyValue,
    };
    axiosInstance
      .post(apiURL + '/departments', data)
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
    if (!companyValue) {
      toast.error('Company name required');
      setLoading(false);
      return;
    }
    if (!departmentName) {
      toast.error('Department name required');
      setLoading(false);
      return;
    }
    const data = {
      name: departmentName,
      company_id: companyValue,
    };
    axiosInstance
      .put(`${apiURL}/departments/${selectedDepartment.id}`, data)
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
      .delete(`${apiURL}/departments/${selectedDepartment.id}`)
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
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            {rows.length > 0 ? (
              <>
                <TableBody>
                  {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell component="th" id={labelId} scope="row" padding="none">
                          {index + 1 + page * rowsPerPage}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.company ? row.company.name : ''}</TableCell>
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
                    );
                  })}

                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
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

      <Dialog fullWidth open={createDialogOpen} onClose={handleCreateDialogClose}>
        <DialogTitle>Create Department</DialogTitle>
        <DialogContent>
          <FormControl sx={{ mt: 3 }} fullWidth margin="dense">
            <InputLabel required>Company</InputLabel>
            <Select
              label="Company *"
              value={companyValue}
              onChange={(e) => setCompanyValue(e.target.value)}
            >
              {company.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            required
            sx={{ mt: 3 }}
            margin="dense"
            label="Department"
            type="text"
            fullWidth
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button type="submit" onClick={handleCreateDepartment} variant="contained">
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth open={updateDialogOpen} onClose={handleUpdateDialogClose}>
        <DialogTitle>Update Department</DialogTitle>
        <DialogContent>
          <FormControl sx={{ mt: 3 }} fullWidth margin="dense">
            <InputLabel>Company * </InputLabel>
            <Select
              required
              label="Company"
              value={companyValue}
              onChange={(e) => setCompanyValue(e.target.value)}
            >
              {company.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            sx={{ mt: 3 }}
            required
            margin="dense"
            label="Department "
            type="text"
            fullWidth
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdateDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateDepartment} variant="contained">
            {loading ? <CircularProgress color="inherit" size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>
            {' '}
            Do you want to delete this department "{selectedDepartment?.name}"?
          </Typography>
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

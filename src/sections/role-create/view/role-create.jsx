import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  Button,
  TextField,
  Stack,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import axiosInstance from 'src/axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function RoleCreate() {
  const [moduleName, setModuleName] = useState('');
  const [rolesData, setRolesData] = useState([]);
  const [permissions, setPermissions] = useState([]); // Added this line
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setloadingBtn] = useState(false); // Moved the state definition here

  const fetchRoles = () => {
    setLoading(true);
    axiosInstance
      .get('/modules')
      .then((res) => {
        setLoading(false);
        if (res.data.error) {
          toast.error(res.data.message);
        } else {
          const fetchedRoles = res.data.data;
          setRolesData(fetchedRoles);

          // Initialize permissions based on fetched roles
          const initialPermissions = fetchedRoles.map((role) => ({
            createP: false,
            readP: false,
            updateP: false,
            deleteP: false,
          }));
          setPermissions(initialPermissions);
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred');
        }
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleInputChange = (event) => {
    setModuleName(event.target.value);
  };

  const handleSwitchChange = (permissionIndex, permissionType) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((permission, index) => {
        if (index === permissionIndex) {
          const updatedPermission = {
            ...permission,
            [permissionType]: !permission[permissionType],
          };

          if (['nav_view', 'createP', 'updateP', 'deleteP'].includes(permissionType)) {
            return {
              ...updatedPermission,
              readP: true,
            };
          }

          return updatedPermission;
        }

        return permission;
      })
    );
  };

  const navigate = useNavigate();
  const handleCreateRole = () => {
    const roleData = {
      name: moduleName, // Correctly using moduleName instead of roleName
      module_permissions: rolesData.map((role, index) => ({
        module_id: role.id,
        permissions: {
          nav_view: permissions[index]?.nav_view ? 1 : 0,
          read: permissions[index]?.readP ? 1 : 0,
          create: permissions[index]?.createP ? 1 : 0,
          update: permissions[index]?.updateP ? 1 : 0,
          delete: permissions[index]?.deleteP ? 1 : 0,
        },
      })),
    };

    setloadingBtn(true);
    axiosInstance
      .post('/roles', roleData)
      .then((res) => {
        setloadingBtn(false);
        toast.success(res.data.message);
        setTimeout(() => {
          navigate('/roles-permissions/roles');
        }, 1000);
      })
      .catch((error) => {
        setloadingBtn(false);
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('An unexpected error occurred');
        }
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Create New Role</Typography>
        <TextField
          required
          fullWidth
          label="Role"
          variant="outlined"
          value={moduleName}
          onChange={handleInputChange}
          sx={{ mt: 4, mb: 2 }}
        />
      </Card>

      {loading ? (
        <Stack sx={{ width: '100%', color: '#e06522', mt: 1 }} spacing={2}>
          <LinearProgress className="mb-1" color="inherit" />
        </Stack>
      ) : (
        <Card sx={{ p: 4, mb: 3 }}>
          {rolesData.map((role, roleIndex) => (
            <Box key={role.id} sx={{ mb: 3 }}>
              <Grid container alignItems="center" sx={{ mt: 2 }}>
                <Grid item xs={12} md={2}>
                  <Typography variant="body1">{role.name}</Typography>
                </Grid>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={2}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permissions[roleIndex]?.nav_view || false}
                            onChange={() => handleSwitchChange(roleIndex, 'nav_view')}
                          />
                        }
                        label="Nav View"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permissions[roleIndex]?.createP || false}
                            onChange={() => handleSwitchChange(roleIndex, 'createP')}
                          />
                        }
                        label="Create"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permissions[roleIndex]?.readP || false}
                            onChange={() => handleSwitchChange(roleIndex, 'readP')}
                          />
                        }
                        label="Read"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permissions[roleIndex]?.updateP || false}
                            onChange={() => handleSwitchChange(roleIndex, 'updateP')}
                          />
                        }
                        label="Update"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permissions[roleIndex]?.deleteP || false}
                            onChange={() => handleSwitchChange(roleIndex, 'deleteP')}
                          />
                        }
                        label="Delete"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Card>
      )}

      <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreateRole}>
        {loadingBtn ? <CircularProgress color="inherit" size={24} /> : 'Create'}
      </Button>
      <Toaster />
    </Box>
  );
}

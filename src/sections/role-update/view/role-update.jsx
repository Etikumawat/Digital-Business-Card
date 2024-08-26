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
  CircularProgress,
  LinearProgress,
  Stack,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from 'src/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function RoleUpdate() {
  const { id } = useParams();
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRole = () => {
    setLoading(true);
    axiosInstance
      .get(`/roles/${id}`)
      .then((res) => {
        setLoading(false);
        if (res.data.error) {
          toast.error(res.data.message);
        } else {
          const roleData = res.data;
          setRoleName(roleData.name);
          setPermissions(roleData.permissions);
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
    fetchRole();
  }, [id]);

  const handleInputChange = (event) => {
    setRoleName(event.target.value);
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
  const [loadingBtn, setloadingBtn] = useState();
  const navigate = useNavigate();
  const handleUpdateRole = () => {
    const updatedRoleData = {
      name: roleName,
      module_permissions: permissions.map((permission) => ({
        module_id: permission.module.id,
        permissions: {
          nav_view: permission.nav_view ? 1 : 0,
          read: permission.readP ? 1 : 0,
          create: permission.createP ? 1 : 0,
          update: permission.updateP ? 1 : 0,
          delete: permission.deleteP ? 1 : 0,
        },
      })),
    };
    setloadingBtn(true);
    axiosInstance
      .put(`/roles/${id}`, updatedRoleData)
      .then((res) => {
        setloadingBtn(false);
        toast.success(res.data.message);
        setTimeout(() => {
          navigate('/roles-permissions/roles');
        }, 1000);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          console.log(error.response.data.message);
          setloadingBtn(false);
          toast.error(error.response.data.message);
        } else {
          setloadingBtn(false);
          toast.error(error.message);
        }
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Update Role</Typography>
        <TextField
          fullWidth
          required
          label="Role"
          variant="outlined"
          value={roleName}
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
          {permissions.map((permission, index) => (
            <Box key={permission.module.id} sx={{ mb: 3 }}>
              <Typography variant="h6">{permission.module.name}</Typography>
              <Grid container alignItems="center" sx={{ mt: 2 }}>
                <Grid item xs={12} md={10}>
                  <Grid container spacing={2}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Switch
                            color="primary"
                            checked={permission.nav_view}
                            onChange={() => handleSwitchChange(index, 'nav_view')}
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
                            checked={permission.createP}
                            onChange={() => handleSwitchChange(index, 'createP')}
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
                            checked={permission.readP}
                            onChange={() => handleSwitchChange(index, 'readP')}
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
                            checked={permission.updateP}
                            onChange={() => handleSwitchChange(index, 'updateP')}
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
                            checked={permission.deleteP}
                            onChange={() => handleSwitchChange(index, 'deleteP')}
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

      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleUpdateRole}>
        {loadingBtn ? <CircularProgress color="inherit" size={24} /> : 'Update Role'}
      </Button>
      <Toaster />
    </Box>
  );
}

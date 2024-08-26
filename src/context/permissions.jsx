import { createContext, useContext, useState } from 'react';
import axiosInstance from 'src/axios';
import apiURL from 'src/config';

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  const updatePermissions = async () => {
    try {
      const response = await axiosInstance.get(apiURL + '/permission');
      setPermissions(response.data?.data);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
    }
  };

  return (
    <PermissionsContext.Provider value={{ permissions, updatePermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

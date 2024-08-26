import { FiberSmartRecordOutlined, List, Widgets, ManageAccounts } from '@mui/icons-material';
import SvgColor from 'src/components/svg-color';

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const generateNavConfig = (permissions) => {
  if (!permissions || !permissions.length) return [];

  const getIconForModule = (moduleName) => {
    switch (moduleName) {
      case 'Dashboard':
        return icon('ic_analytics');
      case 'Card':
        return <List />;
      case 'Master':
        return <Widgets />;
      case 'Roles and permissions':
        return <ManageAccounts />;
      default:
        return <FiberSmartRecordOutlined fontSize="small" />;
    }
  };

  const navConfig = [];

  const moduleMap = {
    Dashboard: {
      title: 'Dashboard',
      icon: getIconForModule('Dashboard'),
      path: '/dashboard',
    },
    Card: {
      title: 'Card',
      icon: getIconForModule('Card'),
      path: '/card',
    },
    Master: {
      title: 'Master Data',
      icon: getIconForModule('Master'),
      children: [
        {
          title: 'Company',
          path: '/master-data/company',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'Department',
          path: '/master-data/department',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'Designation',
          path: '/master-data/designation',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'Country',
          path: '/master-data/country',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'State',
          path: '/master-data/state',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'City',
          path: '/master-data/city',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
      ],
    },
    'Roles and permissions': {
      title: 'Roles and Permissions',
      icon: getIconForModule('Roles and permissions'),
      children: [
        {
          title: 'Roles',
          path: '/roles-permissions/roles',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
        {
          title: 'Users',
          path: '/roles-permission/users-view',
          icon: <FiberSmartRecordOutlined fontSize="small" />,
        },
      ],
    },
  };

  const order = ['Dashboard', 'Card', 'Master', 'Roles and permissions'];

  order.forEach((moduleName) => {
    const module = permissions.find((item) => item.name === moduleName);
    if (module) {
      navConfig.push(moduleMap[moduleName]);
    }
  });

  return navConfig;
};

export default generateNavConfig;

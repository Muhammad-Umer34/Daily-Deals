import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { MdDashboard } from "react-icons/md";
import { FiBox } from "react-icons/fi";
import { MdAddCircle } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { RiBarChart2Line } from "react-icons/ri";

import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { uiActions } from '../../../features/admin/uiSlice';
import { authActions } from '../../../features/auth/authSlices';

import AddProduct from '../../../pages/storeOwner/addProduct';
import MyProducts from '../../../pages/storeOwner/myProducts';
import EditProduct from '../../../pages/storeOwner/editProduct';

const drawerWidth = 240;

const sidebarBg = "#1D2228";
const sidebarAccent = "#232A31";
const sidebarText = "#F5F6FA";
const sidebarIcon = "#A0A4AB";
const appBarBg = "#fff";
const appBarText = "#23262F";

function ResponsiveDrawer(props) {
  const navigate=useNavigate();
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const selectedField = useSelector((state) => state.ui.selectedField);
  // const user = useSelector((state) => state.auth.user);
  // if (!user) {
  //    navigate("/login"); 
  // }

  const dispatch = useDispatch();
  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const fields = [
    { name: 'Dashboard', icon: <MdDashboard /> },
    { name: 'My Products', icon: <FiBox /> },
    { name: 'Add Product', icon: <MdAddCircle /> },
    { name: 'Orders', icon: <HiOutlineClipboardList /> },
    { name: 'Analytics', icon: <RiBarChart2Line /> },
  ];

  const drawer = (
    <div style={{ background: sidebarBg, height: "100%", color: sidebarText }}>
      <Toolbar />
      <Divider sx={{ background: sidebarAccent }} />
      <List>
        {fields.map((field) => (
          <ListItem key={field.name} disablePadding>
            <ListItemButton
              sx={{
                '&:hover': { background: sidebarAccent },
                color: sidebarText,
                background: selectedField === field.name ? sidebarAccent : 'transparent',
                borderLeft: selectedField === field.name ? '4px solid #4F8CFF' : '4px solid transparent',
                fontWeight: selectedField === field.name ? 700 : 400,
                transition: 'background 0.2s, border-color 0.2s'
              }}
              onClick={() => dispatch(uiActions.changeField(field.name))}
            >
              <ListItemIcon sx={{ color: sidebarIcon }}>
                {field.icon}
              </ListItemIcon>
              <ListItemText primary={field.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ background: sidebarAccent }} />
      <List>
        {['Analytics', 'Settings', 'Logout'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton 
              onClick={() => {
                if (text === 'Logout') {
                  dispatch(authActions.logout());
                  navigate("/login");
                } else {
                  dispatch(uiActions.changeField(text));
                }
              }}
              sx={{
                '&:hover': { background: sidebarAccent },
                color: sidebarText
              }}
            >
              <ListItemIcon sx={{ color: sidebarIcon }}>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: appBarBg,
          color: appBarText,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: sidebarIcon }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "800", color: "#1e293b", letterSpacing: "-0.025em" }}>
              Mono<span style={{ color: "#2563eb" }}>Fit</span>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: sidebarBg,
              color: sidebarText
            },
          }}
          slotProps={{ root: { keepMounted: true } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: sidebarBg,
              color: sidebarText
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
 <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Typography >
          {selectedField === 'My Products' && <MyProducts/>}
          {selectedField === 'editProduct' && <EditProduct/>}
          {selectedField === 'Add Product' ? (
            <AddProduct />
          ) : (
            <Typography variant="h6" sx={{ color: '#23262F' }}>
              Welcome to the {selectedField} section!
            </Typography>
          )}
        </Typography>
      </Box>
     
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  window: PropTypes.func,
};

export default ResponsiveDrawer;

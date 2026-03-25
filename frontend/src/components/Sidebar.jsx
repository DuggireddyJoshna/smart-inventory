import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PackageSearch, ShoppingCart, TrendingUp, Bell } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SmartShop</h2>
        <p className="sidebar-subtitle">Inventory System</p>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/inventory" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <PackageSearch size={20} />
          <span>Inventory</span>
        </NavLink>
        
        <NavLink to="/sell" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ShoppingCart size={20} />
          <span>Sell Products</span>
        </NavLink>
        
        <NavLink to="/predictions" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <TrendingUp size={20} />
          <span>Predictions</span>
        </NavLink>
        
        <NavLink to="/alerts" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <p>Premium Admin</p>
      </div>
    </aside>
  );
};

export default Sidebar;

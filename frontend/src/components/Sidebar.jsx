import React from 'react'
import { Link } from 'react-router-dom'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import SettingsIcon from '@mui/icons-material/Settings'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">SSIS</div>
        <div>
          <div className="appname">STUDEX</div>
          {/* <div className="appnamesub">Student Information System</div> */}
        </div>
      </div>

    <div className="spacer1" />

      <nav className="nav">
        <Link to="/"> <HomeRoundedIcon className="icon" /> Home</Link>
        <Link to="/students"> <PersonIcon className="icon" /> Students</Link>
        <Link to="/programs"> <MenuBookRoundedIcon className="icon" /> Programs</Link>
        <Link to="/colleges"> <SchoolRoundedIcon className="icon" /> Colleges</Link>
      </nav>

      <div className="spacer" />
      <div className="settings"><SettingsIcon className="icon" /> Settings</div>
    </aside>
  )
}

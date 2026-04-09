import React, { useState, useRef, useEffect } from "react";
import { navbarStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationDropdown from "../Context/NotificationDropdown";

const BASE_URL = import.meta.env.VITE_API_BASE;

const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(
  propUser || { name: "", email: "", profilePic: "" }
);

  // ✅ fetch user profile if not passed via props
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.user || response.data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    if (!propUser) {
      fetchUserData();
    }
  }, [propUser]);

  // ✅ close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <header className={navbarStyles.header}>
        <div className={navbarStyles.container}>
          {/* ✅ Logo section */}
          <div
            onClick={() => navigate("/")}
            className={navbarStyles.logoContainer}
          >
            <div className={navbarStyles.logoImage}>
              <img src={logo} alt="Expense Tracker Logo" />
            </div>
            <span className={navbarStyles.logoText}>Expense Tracker</span>
          </div>
          <nav className="flex justify-between items-center p-2">
            <div className="flex items-center gap-4">
              <NotificationDropdown />
            </div>
          </nav>
        </div>
      </header>
  );
};

export default Navbar;

import React, { useEffect, useRef, useState } from "react";
import { sidebarStyles, cn, signupStyles } from "../assets/dummyStyles";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: <Home size={20} /> },
  { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
  { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
  { text: "Profile", path: "/profile", icon: <User size={20} /> },
];

const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

const {
  name: username = "User",
  email = "user@example.com",
  profilePic = "",
} = user || {};

const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false); // ✅ FIX (case)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const handleLogout = () => {
    // TODO: add real logout logic
    navigate("/login");
  };

  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;

    return (
      <motion.li
        key={path}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive
              ? sidebarStyles.menuItem.active
              : sidebarStyles.menuItem.inactive,
            isCollapsed
              ? sidebarStyles.menuItem.collapsed
              : sidebarStyles.menuItem.expanded,
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>

          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {text}
            </motion.span>
          )}

          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator}></span>
          )}
        </Link>
      </motion.li>
    );
  };

  return (
    <>
      <motion.div
        ref={sidebarRef}
        className={sidebarStyles.sidebarContainer.base}
        initial={{ x: -100, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 80 : 225,
        }}
        transition={{ type: "spring", damping: 25 }} // ✅ FIX
      >
        <div
          className={cn(
            sidebarStyles.sidebarInner.base,
            "flex flex-col h-full",
          )}
        >
          {/* Toggle */}
          <button
            onClick={toggleSidebar}
            className={sidebarStyles.toggleButton.base}
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <polyline
                  points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </motion.div>
          </button>

          {/* Profile */}
          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded, // ✅ FIX (comma)
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "relative group mb-2 transition-all duration-300",
                  isCollapsed ? "w-12 h-12" : "w-28 h-28",
                )}
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-full">
                    <span className="font-semibold text-gray-600">
                      {initial}
                    </span>
                  </div>
                )}

                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              {!isCollapsed && (
                <motion.div
                  className="ml-3 overflow-hidden"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-sm font-bold text-gray-800 truncate">
                    {username}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </motion.div>
              )}
            </div>
            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              <ul className={sidebarStyles.menuList.base}>
                {MENU_ITEMS.map(renderMenuItem)}
              </ul>
            </div>

            {/* Footer */}
            <div
              className={cn(
                sidebarStyles.footerContainer.base,
                isCollapsed
                  ? sidebarStyles.footerContainer.collapsed
                  : sidebarStyles.footerContainer.expanded,
              )}
            >
              <Link
                to="/contactus"
                className={cn(
                  sidebarStyles.footerLink.base,
                  isCollapsed
                    ? sidebarStyles.footerLink.collapsed
                    : sidebarStyles.footerLink.expanded,
                )}
              >
                <HelpCircle className="w-6 h-6 shrink-0" />
                {!isCollapsed && <span>Support</span>}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  sidebarStyles.logoutButton.base,
                  isCollapsed
                    ? sidebarStyles.logoutButton.collapsed
                    : sidebarStyles.logoutButton.expanded,
                )}
              >
                <LogOut className="w-6 h-6 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Button */}
      <motion.button
        onClick={() => setMobileOpen((prev) => !prev)}
        className={sidebarStyles.mobileMenuButton}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className={sidebarStyles.mobileOverlay}>
            <motion.div
              className={sidebarStyles.mobileBackdrop}
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              ref={sidebarRef}
              className={sidebarStyles.mobileSidebar.base}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
            >
              <div
                className={cn(
                  sidebarStyles.sidebarInner.base,
                  "flex flex-col h-full",
                )}
              >
                {/* Profile */}
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-gray-600">
                          {initial}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="text-sm font-bold text-gray-800">
                        {username}
                      </h2>
                      <p className="text-xs text-gray-500">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="flex-1 overflow-y-auto py-4">
                  <ul className={sidebarStyles.menuList.base}>
                    {MENU_ITEMS.map(renderMenuItem)}
                  </ul>
                </div>

                {/* Footer */}
                <div className="p-4 border-t">
                  <Link
                    to="/contactus"
                    className={sidebarStyles.footerLink.base}
                  >
                    <HelpCircle size={20} />
                    <span>Support</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={sidebarStyles.logoutButton.base}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

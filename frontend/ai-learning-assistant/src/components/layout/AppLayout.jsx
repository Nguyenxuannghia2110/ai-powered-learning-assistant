import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Header from "./Header";
import Sidebar from "./Sidebar";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -6,
  },
};

const pageTransition = {
  duration: 0.18,
  ease: "easeOut",
};

const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="h-screen w-screen flex bg-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col h-full bg-black relative">
        <Header
          onToggleMobileSidebar={() =>
            setMobileSidebarOpen(!mobileSidebarOpen)
          }
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-24 px-6 md:px-8 pb-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              style={{ willChange: "transform, opacity" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default React.memo(AppLayout);
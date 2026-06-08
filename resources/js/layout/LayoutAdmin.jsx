import React from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import { useTheme } from "../contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LayoutAdmin = ({ children }) => {
    const { currentTheme } = useTheme();

    // Menggunakan class mappings dari ThemeContext
    const colors = currentTheme.classes?.layout || {
        orb1: "bg-purple-500/20",
        orb2: "bg-cyan-500/10",
        orb3: "bg-purple-600/10",
        orb4: "bg-purple-400/5",
        orb5: "bg-cyan-400/5",
        grid: "#8b5cf6",
    };

    return (
        <div className="min-h-screen bg-[#0D0219] relative overflow-hidden">
            {/* Background Gradient Effects with Animation */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute -top-40 -right-40 w-80 h-80 ${colors.orb1} rounded-full blur-3xl animate-pulse`}
                ></div>
                <div
                    className={`absolute top-1/2 -left-40 w-80 h-80 ${colors.orb2} rounded-full blur-3xl animate-pulse`}
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className={`absolute bottom-0 right-1/4 w-96 h-96 ${colors.orb3} rounded-full blur-3xl animate-pulse`}
                    style={{ animationDelay: "2s" }}
                ></div>

                <div
                    className={`absolute top-1/4 right-1/3 w-64 h-64 ${colors.orb4} rounded-full blur-3xl animate-pulse`}
                    style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                    className={`absolute bottom-1/4 left-1/3 w-72 h-72 ${colors.orb5} rounded-full blur-3xl animate-pulse`}
                    style={{ animationDelay: "1.5s" }}
                ></div>
            </div>

            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    // backgroundImage: `linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)`,
                    backgroundSize: "4rem 4rem",
                    opacity: 0.5,
                    zIndex: 1,
                }}
            ></div>

            <NavbarAdmin />
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                {children}
            </main>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                style={{
                    zIndex: 9999,
                }}
                toastStyle={{
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    border: `1px solid ${currentTheme.hex.primary}40`,
                    borderRadius: "12px",
                    boxShadow: `0 4px 12px ${currentTheme.hex.primary}30`,
                }}
                progressStyle={{
                    background: `linear-gradient(to right, ${currentTheme.hex.primary}, ${currentTheme.hex.secondary})`,
                }}
            />
        </div>
    );
};

export default LayoutAdmin;

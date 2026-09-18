import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import Organizations from "./pages/Organizations";
import VolunteerDashboard from "./pages/VolunteerDashboard";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/donor-dashboard"
                    element={<DonorDashboard />}
                />

                <Route
                    path="/recipient-dashboard"
                    element={<RecipientDashboard />}
                />

                <Route
                    path="/admin-dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/organizations"
                    element={<Organizations />}
                />

                <Route
                    path="/volunteer-dashboard"
                    element={<VolunteerDashboard />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/" />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Bike,
    LogOut,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Truck,
    RefreshCw
} from "lucide-react";

import API from "../api";
import "./VolunteerDashboard.css";


function VolunteerDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    // =====================================================
    // LOAD VOLUNTEER
    // =====================================================

    useEffect(() => {

        const storedUser = localStorage.getItem(
            "foodrescue_user"
        );

        if (!storedUser) {
            navigate("/");
            return;
        }

        try {

            const parsedUser = JSON.parse(
                storedUser
            );

            if (parsedUser.role !== "Volunteer") {
                navigate("/");
                return;
            }

            setUser(parsedUser);

            fetchPickupRequests(parsedUser.id);

        } catch (error) {

            console.error(error);

            localStorage.removeItem(
                "foodrescue_user"
            );

            navigate("/");

        }

    }, [navigate]);


    // =====================================================
    // FETCH PICKUP REQUESTS
    // =====================================================

    const fetchPickupRequests = async (volunteerId) => {

        try {

            setLoading(true);
            setErrorMessage("");

            const response = await API.get(
                "/volunteer/requests",
                {
                    params: {
                        volunteer_id: volunteerId
                    }
                }
            );

            if (Array.isArray(response.data)) {

                setClaims(response.data);

            } else {

                setClaims([]);

                if (response.data?.message) {
                    setErrorMessage(
                        response.data.message
                    );
                }

            }

        } catch (error) {

            console.error(error);

            setClaims([]);

            setErrorMessage(
                error.response?.data?.detail ||
                "Unable to load pickup requests."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        if (user) {
            fetchPickupRequests(user.id);
        }

    };


    // =====================================================
    // ACCEPT PICKUP
    // =====================================================

    const handleAcceptPickup = async (claimId) => {

        if (!user) return;

        try {

            setActionLoading(claimId);
            setMessage("");
            setErrorMessage("");

            const response = await API.post(
                `/volunteer/claims/${claimId}/accept`,
                null,
                {
                    params: {
                        volunteer_id: user.id
                    }
                }
            );


            if (response.data.success) {

                setMessage(
                    "Pickup request accepted successfully!"
                );

                await fetchPickupRequests(
                    user.id
                );

            } else {

                setErrorMessage(
                    response.data.message ||
                    "Unable to accept pickup."
                );

            }

        } catch (error) {

            console.error(error);

            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to accept pickup request."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =====================================================
    // MARK PICKED UP
    // =====================================================

    const handleMarkPickedUp = async (claimId) => {

        if (!user) return;

        try {

            setActionLoading(claimId);
            setMessage("");
            setErrorMessage("");

            const response = await API.post(
                `/volunteer/claims/${claimId}/pickup`,
                null,
                {
                    params: {
                        volunteer_id: user.id
                    }
                }
            );


            if (response.data.success) {

                setMessage(
                    "Food has been marked as picked up."
                );

                await fetchPickupRequests(
                    user.id
                );

            } else {

                setErrorMessage(
                    response.data.message ||
                    "Unable to update pickup status."
                );

            }

        } catch (error) {

            console.error(error);

            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to mark food as picked up."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =====================================================
    // MARK DELIVERED
    // =====================================================

    const handleMarkDelivered = async (claimId) => {

        if (!user) return;

        try {

            setActionLoading(claimId);
            setMessage("");
            setErrorMessage("");

            const response = await API.post(
                `/volunteer/claims/${claimId}/deliver`,
                null,
                {
                    params: {
                        volunteer_id: user.id
                    }
                }
            );


            if (response.data.success) {

                setMessage(
                    "Food has been delivered successfully!"
                );

                await fetchPickupRequests(
                    user.id
                );

            } else {

                setErrorMessage(
                    response.data.message ||
                    "Unable to update delivery status."
                );

            }

        } catch (error) {

            console.error(error);

            setErrorMessage(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to mark delivery as completed."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "foodrescue_user"
        );

        navigate("/");

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        if (status === "Delivered") {
            return "status-delivered";
        }

        if (status === "Picked Up") {
            return "status-picked";
        }

        if (status === "Volunteer Accepted") {
            return "status-accepted";
        }

        return "status-ready";

    };


    // =====================================================
    // STATUS ICON
    // =====================================================

    const getStatusIcon = (status) => {

        if (status === "Delivered") {
            return <CheckCircle size={16} />;
        }

        if (status === "Picked Up") {
            return <Truck size={16} />;
        }

        if (status === "Volunteer Accepted") {
            return <Bike size={16} />;
        }

        return <Package size={16} />;

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "To be confirmed";
        }

        try {

            return new Date(dateValue).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

        } catch {

            return dateValue;

        }

    };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="volunteer-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="volunteer-header">

                <div className="volunteer-brand">

                    <div className="volunteer-logo">
                        <Bike size={25} />
                    </div>

                    <div>

                        <h1>
                            Food<span>Rescue</span>
                        </h1>

                        <p>
                            Volunteer Dashboard
                        </p>

                    </div>

                </div>


                <div className="volunteer-header-right">

                    {user && (

                        <div className="volunteer-user">

                            <div className="volunteer-avatar">

                                {user.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                            </div>

                            <div>

                                <strong>
                                    {user.name}
                                </strong>

                                <span>
                                    Volunteer
                                </span>

                            </div>

                        </div>

                    )}


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut size={17} />

                        Logout

                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="volunteer-content">


                {/* WELCOME */}

                <section className="welcome-section">

                    <div>

                        <p className="welcome-label">
                            FOODRESCUE VOLUNTEER
                        </p>

                        <h2>
                            Help move rescued food
                        </h2>

                        <p>
                            Accept pickup requests, collect surplus
                            food from donors and deliver it to recipient
                            organizations.
                        </p>

                    </div>


                    <button
                        className="refresh-button"
                        onClick={handleRefresh}
                        disabled={loading}
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                </section>


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="volunteer-stats">


                    <div className="stat-card">

                        <div className="stat-icon">

                            <Package size={21} />

                        </div>

                        <div>

                            <span>
                                Pickup Requests
                            </span>

                            <strong>
                                {
                                    claims.filter(
                                        (claim) =>
                                            claim.status ===
                                            "Ready for Pickup"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">

                            <Truck size={21} />

                        </div>

                        <div>

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {
                                    claims.filter(
                                        (claim) =>
                                            claim.status ===
                                            "Volunteer Accepted" ||
                                            claim.status ===
                                            "Picked Up"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">

                            <CheckCircle size={21} />

                        </div>

                        <div>

                            <span>
                                Delivered
                            </span>

                            <strong>
                                {
                                    claims.filter(
                                        (claim) =>
                                            claim.status ===
                                            "Delivered"
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {message && (

                    <div className="volunteer-success">

                        <CheckCircle size={17} />

                        {message}

                    </div>

                )}


                {errorMessage && (

                    <div className="volunteer-message">

                        {errorMessage}

                    </div>

                )}


                {/* =================================================
                    PICKUP SECTION
                ================================================= */}

                <section className="pickup-section">

                    <div className="section-heading">

                        <div>

                            <h3>
                                Pickup Requests
                            </h3>

                            <p>
                                Food donations that require volunteer
                                coordination
                            </p>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="empty-state">

                            <RefreshCw
                                size={30}
                                className="loading-icon"
                            />

                            <h3>
                                Loading pickup requests...
                            </h3>

                            <p>
                                Please wait while we fetch the latest
                                requests.
                            </p>

                        </div>

                    ) : claims.length === 0 ? (

                        /* EMPTY */

                        <div className="empty-state">

                            <div className="empty-icon">

                                <Bike size={30} />

                            </div>

                            <h3>
                                No pickup requests yet
                            </h3>

                            <p>
                                When a food donation is ready for pickup,
                                it will appear here.
                            </p>

                        </div>

                    ) : (

                        /* CARDS */

                        <div className="pickup-grid">

                            {claims.map((claim) => (

                                <div
                                    className="pickup-card"
                                    key={claim.id}
                                >


                                    <div className="pickup-card-top">

                                        <div className="food-icon">

                                            <Package
                                                size={21}
                                            />

                                        </div>


                                        <span
                                            className={`status-badge ${getStatusClass(
                                                claim.status
                                            )}`}
                                        >

                                            {getStatusIcon(
                                                claim.status
                                            )}

                                            {claim.status}

                                        </span>

                                    </div>


                                    <h3>
                                        {claim.food_name ||
                                            "Food Donation"}
                                    </h3>


                                    <p className="pickup-description">

                                        {claim.description ||
                                            "Surplus food donation"}

                                    </p>


                                    <div className="pickup-details">


                                        {/* PICKUP LOCATION */}

                                        <div>

                                            <MapPin size={17} />

                                            <div>

                                                <span>
                                                    Pickup From
                                                </span>

                                                <strong>
                                                    {claim.location ||
                                                        "Donor location"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* QUANTITY */}

                                        <div>

                                            <Package size={17} />

                                            <div>

                                                <span>
                                                    Quantity
                                                </span>

                                                <strong>
                                                    {claim.quantity || "-"}
                                                </strong>

                                            </div>

                                        </div>


                                        {/* DEADLINE */}

                                        <div>

                                            <Clock size={17} />

                                            <div>

                                                <span>
                                                    Pickup Deadline
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        claim.pickup_deadline
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>


                                    {/* DELIVERY */}

                                    <div className="delivery-box">

                                        <span>
                                            DELIVER TO
                                        </span>

                                        <strong>
                                            {claim.organization_name ||
                                                "Recipient organization"}
                                        </strong>

                                    </div>


                                    {/* =================================================
                                        ACTION BUTTONS
                                    ================================================= */}

                                    <div className="pickup-actions">


                                        {/* READY */}

                                        {claim.status ===
                                            "Ready for Pickup" && (

                                            <button
                                                className="accept-button"
                                                onClick={() =>
                                                    handleAcceptPickup(
                                                        claim.id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    claim.id
                                                }
                                            >

                                                <Bike size={17} />

                                                {actionLoading ===
                                                claim.id
                                                    ? "Accepting..."
                                                    : "Accept Pickup"}

                                            </button>

                                        )}


                                        {/* ACCEPTED */}

                                        {claim.status ===
                                            "Volunteer Accepted" && (

                                            <button
                                                className="pickup-button"
                                                onClick={() =>
                                                    handleMarkPickedUp(
                                                        claim.id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    claim.id
                                                }
                                            >

                                                <Truck size={17} />

                                                {actionLoading ===
                                                claim.id
                                                    ? "Updating..."
                                                    : "Mark Picked Up"}

                                            </button>

                                        )}


                                        {/* PICKED UP */}

                                        {claim.status ===
                                            "Picked Up" && (

                                            <button
                                                className="deliver-button"
                                                onClick={() =>
                                                    handleMarkDelivered(
                                                        claim.id
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    claim.id
                                                }
                                            >

                                                <CheckCircle
                                                    size={17}
                                                />

                                                {actionLoading ===
                                                claim.id
                                                    ? "Updating..."
                                                    : "Mark Delivered"}

                                            </button>

                                        )}


                                        {/* DELIVERED */}

                                        {claim.status ===
                                            "Delivered" && (

                                            <div className="completed-message">

                                                <CheckCircle
                                                    size={17}
                                                />

                                                Delivery Completed

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}

export default VolunteerDashboard;
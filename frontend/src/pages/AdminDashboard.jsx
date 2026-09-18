import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    PackageCheck,
    Clock3,
    CheckCircle2,
    XCircle,
    RefreshCw,
    LogOut,
    ShieldCheck,
    MapPin,
    ChevronRight,
    Truck,
    Package,
    Activity
} from "lucide-react";

import API from "../api";

import "./AdminDashboard.css";


function AdminDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [users, setUsers] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [claims, setClaims] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [activeTab, setActiveTab] = useState("donations");


    // =========================
    // CHECK ADMIN LOGIN
    // =========================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("foodrescue_user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        try {

            const loggedUser =
                JSON.parse(storedUser);

            if (loggedUser.role !== "Admin") {
                navigate("/");
                return;
            }

            setUser(loggedUser);

            loadDashboard();

        } catch (error) {

            console.error(
                "User data error:",
                error
            );

            localStorage.removeItem(
                "foodrescue_user"
            );

            navigate("/");

        }

    }, [navigate]);


    // =========================
    // LOAD DASHBOARD
    // =========================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            const [
                foodResponse,
                claimsResponse,
                usersResponse
            ] = await Promise.all([

                API.get("/food-items"),

                API.get("/admin/claims"),

                API.get("/admin/users")

            ]);

            setFoodItems(
                foodResponse.data
            );

            setClaims(
                claimsResponse.data
            );

            setUsers(
                usersResponse.data
            );

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            alert(
                "Unable to connect to FoodRescue server."
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // VERIFY FOOD
    // =========================

    const verifyFood = async (foodId) => {

        try {

            setActionLoading(
                `food-${foodId}`
            );

            const response =
                await API.put(
                    `/admin/food/${foodId}/verify`
                );

            if (response.data.success) {

                await loadDashboard();

            } else {

                alert(
                    response.data.message
                );

            }

        } catch (error) {

            console.error(
                "Verify error:",
                error
            );

            alert(
                "Unable to verify food donation."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =========================
    // REJECT FOOD
    // =========================

    const rejectFood = async (foodId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this food donation?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `food-${foodId}`
            );

            const response =
                await API.put(
                    `/admin/food/${foodId}/reject`
                );

            if (response.data.success) {

                await loadDashboard();

            } else {

                alert(
                    response.data.message
                );

            }

        } catch (error) {

            console.error(
                "Reject error:",
                error
            );

            alert(
                "Unable to reject food donation."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =========================
    // UPDATE CLAIM STATUS
    // =========================

    const updateClaimStatus = async (
        claimId,
        newStatus
    ) => {

        try {

            setActionLoading(
                `claim-${claimId}`
            );

            const response =
                await API.put(
                    `/admin/claims/${claimId}/status`,
                    null,
                    {
                        params: {
                            status: newStatus
                        }
                    }
                );

            if (response.data.success) {

                await loadDashboard();

            } else {

                alert(
                    response.data.message
                );

            }

        } catch (error) {

            console.error(
                "Claim status update error:",
                error
            );

            alert(
                "Unable to update claim status."
            );

        } finally {

            setActionLoading(null);

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const logout = () => {

        localStorage.removeItem(
            "foodrescue_user"
        );

        navigate("/");

    };


    // =========================
    // STATISTICS
    // =========================

    const totalUsers =
        users.length;

    const totalDonations =
        foodItems.length;

    const verifiedFood =
        foodItems.filter(
            item =>
                item.status === "Verified"
        ).length;

    const claimedFood =
        foodItems.filter(
            item =>
                item.status === "Claimed"
        ).length;

    const pendingFood =
        foodItems.filter(
            item =>
                item.status === "Pending"
        ).length;

    const rejectedFood =
        foodItems.filter(
            item =>
                item.status === "Rejected"
        ).length;

    const totalQuantity =
        foodItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );

    const pendingClaims =
        claims.filter(
            claim =>
                claim.claim_status === "Pending"
        ).length;

    const approvedClaims =
        claims.filter(
            claim =>
                claim.claim_status === "Approved"
        ).length;

    const readyClaims =
        claims.filter(
            claim =>
                claim.claim_status ===
                "Ready for Pickup"
        ).length;

    const collectedClaims =
        claims.filter(
            claim =>
                claim.claim_status ===
                "Collected"
        ).length;


    // =========================
    // STATUS CLASS
    // =========================

    const statusClass = (status) => {

        return `admin-status ${status
            ?.toLowerCase()
            .replaceAll(" ", "-")}`;

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="admin-loading-screen">

                <div className="admin-loader"></div>

                <h2>
                    FoodRescue
                </h2>

                <p>
                    Loading administration panel...
                </p>

            </div>

        );

    }


    // =========================
    // UI
    // =========================

    return (

        <div className="fr-admin">


            {/* =================================
                SIDEBAR
            ================================= */}

            <aside className="fr-sidebar">


                {/* BRAND */}

                <div className="fr-brand">

                    <div className="fr-brand-icon">
                        <UtensilsCrossed
                            size={23}
                        />
                    </div>

                    <div>

                        <h2>
                            FoodRescue
                        </h2>

                        <span>
                            Administration
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <div className="fr-sidebar-section">

                    <p>
                        MAIN MENU
                    </p>

                    <button className="fr-nav active">

                        <LayoutDashboard
                            size={18}
                        />

                        Dashboard

                    </button>

                </div>


                {/* SYSTEM */}

                <div className="fr-system-card">

                    <div className="fr-system-icon">

                        <Activity
                            size={17}
                        />

                    </div>

                    <div>

                        <strong>
                            System Online
                        </strong>

                        <span>
                            All services operational
                        </span>

                    </div>

                    <span className="fr-online-dot"></span>

                </div>


                {/* PROFILE */}

                <div className="fr-sidebar-bottom">

                    <div className="fr-admin-profile">

                        <div className="fr-profile-avatar">

                            <ShieldCheck
                                size={20}
                            />

                        </div>

                        <div>

                            <strong>
                                {user?.name ||
                                    "Administrator"}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    <button
                        className="fr-logout"
                        onClick={logout}
                    >

                        <LogOut size={17} />

                        Sign out

                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="fr-main">


                {/* HEADER */}

                <header className="fr-header">

                    <div>

                        <div className="fr-breadcrumb">

                            <span>
                                Dashboard
                            </span>

                            <ChevronRight
                                size={13}
                            />

                            <span>
                                Overview
                            </span>

                        </div>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Monitor FoodRescue donations,
                            claims and platform activity.
                        </p>

                    </div>


                    <button
                        className="fr-refresh"
                        onClick={loadDashboard}
                    >

                        <RefreshCw
                            size={16}
                        />

                        Refresh

                    </button>

                </header>


                {/* =================================
                    STAT CARDS
                ================================= */}

                <section className="fr-stat-grid">


                    <div className="fr-stat-card">

                        <div className="fr-stat-top">

                            <div className="fr-stat-icon blue">

                                <Users size={20} />

                            </div>

                            <span>
                                USERS
                            </span>

                        </div>

                        <strong>
                            {totalUsers}
                        </strong>

                        <p>
                            Registered accounts
                        </p>

                    </div>


                    <div className="fr-stat-card">

                        <div className="fr-stat-top">

                            <div className="fr-stat-icon cyan">

                                <UtensilsCrossed
                                    size={20}
                                />

                            </div>

                            <span>
                                DONATIONS
                            </span>

                        </div>

                        <strong>
                            {totalDonations}
                        </strong>

                        <p>
                            Food donations submitted
                        </p>

                    </div>


                    <div className="fr-stat-card">

                        <div className="fr-stat-top">

                            <div className="fr-stat-icon green">

                                <CheckCircle2
                                    size={20}
                                />

                            </div>

                            <span>
                                VERIFIED
                            </span>

                        </div>

                        <strong>
                            {verifiedFood}
                        </strong>

                        <p>
                            Donations approved
                        </p>

                    </div>


                    <div className="fr-stat-card">

                        <div className="fr-stat-top">

                            <div className="fr-stat-icon purple">

                                <PackageCheck
                                    size={20}
                                />

                            </div>

                            <span>
                                CLAIMED
                            </span>

                        </div>

                        <strong>
                            {claimedFood}
                        </strong>

                        <p>
                            Donations claimed
                        </p>

                    </div>

                </section>


                {/* =================================
                    SECONDARY INFORMATION
                ================================= */}

                <section className="fr-secondary-grid">


                    <div className="fr-info-box">

                        <div className="fr-info-icon orange">
                            <Clock3 size={18} />
                        </div>

                        <div>

                            <span>
                                Pending Donations
                            </span>

                            <strong>
                                {pendingFood}
                            </strong>

                        </div>

                    </div>


                    <div className="fr-info-box">

                        <div className="fr-info-icon red">
                            <XCircle size={18} />
                        </div>

                        <div>

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedFood}
                            </strong>

                        </div>

                    </div>


                    <div className="fr-info-box">

                        <div className="fr-info-icon cyan">
                            <Package size={18} />
                        </div>

                        <div>

                            <span>
                                Food Portions
                            </span>

                            <strong>
                                {totalQuantity}
                            </strong>

                        </div>

                    </div>


                    <div className="fr-info-box">

                        <div className="fr-info-icon green">
                            <Truck size={18} />
                        </div>

                        <div>

                            <span>
                                Collected Claims
                            </span>

                            <strong>
                                {collectedClaims}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    CLAIM PIPELINE
                ================================= */}

                <section className="fr-panel pipeline-panel">

                    <div className="fr-panel-header">

                        <div>

                            <h2>
                                Recovery Pipeline
                            </h2>

                            <p>
                                Current status of food claims
                            </p>

                        </div>

                        <div className="pipeline-total">

                            {claims.length}

                            <span>
                                total claims
                            </span>

                        </div>

                    </div>


                    <div className="pipeline">

                        <div className="pipeline-step">

                            <div className="pipeline-number">
                                {pendingClaims}
                            </div>

                            <strong>
                                Pending
                            </strong>

                            <span>
                                Awaiting approval
                            </span>

                        </div>


                        <div className="pipeline-connector"></div>


                        <div className="pipeline-step">

                            <div className="pipeline-number">
                                {approvedClaims}
                            </div>

                            <strong>
                                Approved
                            </strong>

                            <span>
                                Claim approved
                            </span>

                        </div>


                        <div className="pipeline-connector"></div>


                        <div className="pipeline-step">

                            <div className="pipeline-number">
                                {readyClaims}
                            </div>

                            <strong>
                                Ready
                            </strong>

                            <span>
                                Ready for pickup
                            </span>

                        </div>


                        <div className="pipeline-connector"></div>


                        <div className="pipeline-step">

                            <div className="pipeline-number">
                                {collectedClaims}
                            </div>

                            <strong>
                                Collected
                            </strong>

                            <span>
                                Recovery completed
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================
                    MANAGEMENT
                ================================= */}

                <section className="fr-panel management-panel">


                    <div className="fr-panel-header">

                        <div>

                            <h2>
                                Management
                            </h2>

                            <p>
                                Review and manage FoodRescue records
                            </p>

                        </div>

                    </div>


                    {/* TABS */}

                    <div className="fr-tabs">

                        <button
                            className={
                                activeTab === "donations"
                                    ? "fr-tab active"
                                    : "fr-tab"
                            }
                            onClick={() =>
                                setActiveTab("donations")
                            }
                        >

                            <UtensilsCrossed
                                size={16}
                            />

                            Donations

                            <span>
                                {foodItems.length}
                            </span>

                        </button>


                        <button
                            className={
                                activeTab === "claims"
                                    ? "fr-tab active"
                                    : "fr-tab"
                            }
                            onClick={() =>
                                setActiveTab("claims")
                            }
                        >

                            <PackageCheck
                                size={16}
                            />

                            Claims

                            <span>
                                {claims.length}
                            </span>

                        </button>


                        <button
                            className={
                                activeTab === "users"
                                    ? "fr-tab active"
                                    : "fr-tab"
                            }
                            onClick={() =>
                                setActiveTab("users")
                            }
                        >

                            <Users size={16} />

                            Users

                            <span>
                                {users.length}
                            </span>

                        </button>

                    </div>


                    {/* =================================
                        DONATIONS
                    ================================= */}

                    {activeTab === "donations" && (

                        <div className="fr-table-section">

                            <div className="fr-table-heading">

                                <div>

                                    <h3>
                                        Food Donations
                                    </h3>

                                    <p>
                                        Review submitted donations
                                        and verify eligible food.
                                    </p>

                                </div>

                                <span>
                                    {foodItems.length} records
                                </span>

                            </div>


                            <div className="fr-table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                FOOD
                                            </th>

                                            <th>
                                                CATEGORY
                                            </th>

                                            <th>
                                                QUANTITY
                                            </th>

                                            <th>
                                                LOCATION
                                            </th>

                                            <th>
                                                DONOR
                                            </th>

                                            <th>
                                                STATUS
                                            </th>

                                            <th>
                                                ACTION
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {foodItems.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="fr-empty"
                                                >
                                                    No food donations found.
                                                </td>

                                            </tr>

                                        ) : (

                                            foodItems.map(
                                                item => (

                                                    <tr
                                                        key={item.id}
                                                    >

                                                        <td>

                                                            <div className="food-cell">

                                                                <div className="food-cell-icon">

                                                                    <UtensilsCrossed
                                                                        size={15}
                                                                    />

                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            item.food_name
                                                                        }
                                                                    </strong>

                                                                    {item.description && (

                                                                        <span>
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>
                                                            {item.category}
                                                        </td>


                                                        <td>
                                                            <strong>
                                                                {item.quantity}
                                                            </strong>
                                                        </td>


                                                        <td>

                                                            <div className="location-cell">

                                                                <MapPin
                                                                    size={14}
                                                                />

                                                                {item.location}

                                                            </div>

                                                        </td>


                                                        <td>
                                                            {item.donor_name}
                                                        </td>


                                                        <td>

                                                            <span
                                                                className={statusClass(
                                                                    item.status
                                                                )}
                                                            >
                                                                {item.status}
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="table-actions">

                                                                {(item.status === "Pending" ||
                                                                    item.status === "Available") && (

                                                                    <>

                                                                        <button
                                                                            className="action-verify"
                                                                            onClick={() =>
                                                                                verifyFood(
                                                                                    item.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                `food-${item.id}`
                                                                            }
                                                                        >

                                                                            <CheckCircle2
                                                                                size={14}
                                                                            />

                                                                            {actionLoading ===
                                                                            `food-${item.id}`
                                                                                ? "..."
                                                                                : "Verify"
                                                                            }

                                                                        </button>


                                                                        <button
                                                                            className="action-reject"
                                                                            onClick={() =>
                                                                                rejectFood(
                                                                                    item.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                `food-${item.id}`
                                                                            }
                                                                        >

                                                                            <XCircle
                                                                                size={14}
                                                                            />

                                                                            Reject

                                                                        </button>

                                                                    </>

                                                                )}


                                                                {item.status === "Verified" && (

                                                                    <span className="action-complete">

                                                                        <CheckCircle2
                                                                            size={14}
                                                                        />

                                                                        Verified

                                                                    </span>

                                                                )}


                                                                {item.status === "Rejected" && (

                                                                    <span className="action-rejected">

                                                                        <XCircle
                                                                            size={14}
                                                                        />

                                                                        Rejected

                                                                    </span>

                                                                )}


                                                                {item.status === "Claimed" && (

                                                                    <span className="action-claimed">

                                                                        <PackageCheck
                                                                            size={14}
                                                                        />

                                                                        Claimed

                                                                    </span>

                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}


                    {/* =================================
                        CLAIMS
                    ================================= */}

                    {activeTab === "claims" && (

                        <div className="fr-table-section">

                            <div className="fr-table-heading">

                                <div>

                                    <h3>
                                        Food Claims
                                    </h3>

                                    <p>
                                        Monitor the recovery process
                                        for claimed donations.
                                    </p>

                                </div>

                                <span>
                                    {claims.length} records
                                </span>

                            </div>


                            <div className="fr-table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                FOOD
                                            </th>

                                            <th>
                                                RECIPIENT
                                            </th>

                                            <th>
                                                QUANTITY
                                            </th>

                                            <th>
                                                LOCATION
                                            </th>

                                            <th>
                                                STATUS
                                            </th>

                                            <th>
                                                CLAIMED AT
                                            </th>

                                            <th>
                                                ACTION
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {claims.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="fr-empty"
                                                >
                                                    No claims yet.
                                                </td>

                                            </tr>

                                        ) : (

                                            claims.map(
                                                claim => (

                                                    <tr
                                                        key={
                                                            claim.claim_id
                                                        }
                                                    >

                                                        <td>

                                                            <strong>
                                                                {
                                                                    claim.food_name
                                                                }
                                                            </strong>

                                                        </td>


                                                        <td>
                                                            {
                                                                claim.recipient_name
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                claim.quantity
                                                            }
                                                        </td>


                                                        <td>

                                                            <div className="location-cell">

                                                                <MapPin
                                                                    size={14}
                                                                />

                                                                {
                                                                    claim.location
                                                                }

                                                            </div>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={statusClass(
                                                                    claim.claim_status
                                                                )}
                                                            >
                                                                {
                                                                    claim.claim_status
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            {claim.claimed_at
                                                                ? new Date(
                                                                    claim.claimed_at
                                                                ).toLocaleString()
                                                                : "-"
                                                            }

                                                        </td>


                                                        <td>

                                                            <div className="table-actions">


                                                                {claim.claim_status ===
                                                                    "Pending" && (

                                                                        <button
                                                                            className="action-verify"
                                                                            onClick={() =>
                                                                                updateClaimStatus(
                                                                                    claim.claim_id,
                                                                                    "Approved"
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                `claim-${claim.claim_id}`
                                                                            }
                                                                        >

                                                                            <CheckCircle2
                                                                                size={14}
                                                                            />

                                                                            {actionLoading ===
                                                                            `claim-${claim.claim_id}`
                                                                                ? "..."
                                                                                : "Approve"
                                                                            }

                                                                        </button>

                                                                    )}


                                                                {claim.claim_status ===
                                                                    "Approved" && (

                                                                        <button
                                                                            className="action-ready"
                                                                            onClick={() =>
                                                                                updateClaimStatus(
                                                                                    claim.claim_id,
                                                                                    "Ready for Pickup"
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                `claim-${claim.claim_id}`
                                                                            }
                                                                        >

                                                                            <Package
                                                                                size={14}
                                                                            />

                                                                            {actionLoading ===
                                                                            `claim-${claim.claim_id}`
                                                                                ? "..."
                                                                                : "Ready for Pickup"
                                                                            }

                                                                        </button>

                                                                    )}


                                                                {claim.claim_status ===
                                                                    "Ready for Pickup" && (

                                                                        <button
                                                                            className="action-collect"
                                                                            onClick={() =>
                                                                                updateClaimStatus(
                                                                                    claim.claim_id,
                                                                                    "Collected"
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                `claim-${claim.claim_id}`
                                                                            }
                                                                        >

                                                                            <Truck
                                                                                size={14}
                                                                            />

                                                                            {actionLoading ===
                                                                            `claim-${claim.claim_id}`
                                                                                ? "..."
                                                                                : "Mark Collected"
                                                                            }

                                                                        </button>

                                                                    )}


                                                                {claim.claim_status ===
                                                                    "Collected" && (

                                                                        <span className="action-complete">

                                                                            <CheckCircle2
                                                                                size={14}
                                                                            />

                                                                            Completed

                                                                        </span>

                                                                    )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}


                    {/* =================================
                        USERS
                    ================================= */}

                    {activeTab === "users" && (

                        <div className="fr-table-section">

                            <div className="fr-table-heading">

                                <div>

                                    <h3>
                                        Registered Users
                                    </h3>

                                    <p>
                                        View accounts registered
                                        on the FoodRescue platform.
                                    </p>

                                </div>

                                <span>
                                    {users.length} records
                                </span>

                            </div>


                            <div className="fr-table-wrapper">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                NAME
                                            </th>

                                            <th>
                                                EMAIL
                                            </th>

                                            <th>
                                                ROLE
                                            </th>

                                            <th>
                                                JOINED
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {users.map(
                                            currentUser => (

                                                <tr
                                                    key={
                                                        currentUser.id
                                                    }
                                                >

                                                    <td>

                                                        <div className="user-name-cell">

                                                            <div className="user-mini-avatar">

                                                                <Users
                                                                    size={14}
                                                                />

                                                            </div>

                                                            <strong>
                                                                {
                                                                    currentUser.name
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {
                                                            currentUser.email
                                                        }
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`fr-role role-${currentUser.role?.toLowerCase()}`}
                                                        >
                                                            {
                                                                currentUser.role
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        {currentUser.created_at
                                                            ? new Date(
                                                                currentUser.created_at
                                                            ).toLocaleDateString()
                                                            : "-"
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    )}

                </section>


                {/* FOOTER */}

                <footer className="fr-admin-footer">

                    <span>
                        FoodRescue Administration
                    </span>

                    <span>
                        Platform monitoring & management
                    </span>

                </footer>


            </main>

        </div>

    );

}


export default AdminDashboard;
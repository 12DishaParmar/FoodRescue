import "./RecipientDashboard.css";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Package,
    Search,
    MapPin,
    Clock,
    User,
    LogOut,
    CheckCircle,
    Utensils,
    HeartHandshake,
    RefreshCw,
    ArrowRight,
    X,
    Building2,
    Truck,
    Sparkles
} from "lucide-react";

import API from "../api";
import "./RecipientDashboard.css";


function RecipientDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [foodItems, setFoodItems] = useState([]);
    const [claims, setClaims] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");


    // =====================================================
    // LOAD USER
    // =====================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("foodrescue_user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        try {

            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "Recipient") {
                navigate("/");
                return;
            }

            setUser(parsedUser);

            loadFood();
            loadClaims(parsedUser.id);

        } catch (error) {

            localStorage.removeItem("foodrescue_user");
            navigate("/");

        }

    }, [navigate]);


    // =====================================================
    // LOAD AVAILABLE FOOD
    // =====================================================

    const loadFood = async () => {

        try {

            setLoading(true);

            const response =
                await API.get("/available-food");

            setFoodItems(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Unable to load food:",
                error
            );

            setFoodItems([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD CLAIMS
    // =====================================================

    const loadClaims = async (userId) => {

        try {

            const response =
                await API.get(`/my-claims/${userId}`);

            setClaims(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (error) {

            console.error(
                "Unable to load claims:",
                error
            );

            setClaims([]);

        }

    };


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = async () => {

        if (!user) return;

        await Promise.all([
            loadFood(),
            loadClaims(user.id)
        ]);

        showMessage(
            "Dashboard refreshed successfully.",
            "success"
        );

    };


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    const showMessage = (
        text,
        type = "success"
    ) => {

        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
        }, 3500);

    };


    // =====================================================
    // CLAIM FOOD
    // =====================================================

    const handleClaim = async (foodId) => {

        if (!user) return;

        try {

            setClaiming(foodId);
            setMessage("");

            const response =
                await API.post(
                    `/claims?food_id=${foodId}&user_id=${user.id}`
                );

            if (response.data.success) {

                showMessage(
                    "Food claimed successfully!",
                    "success"
                );

                await loadFood();
                await loadClaims(user.id);

            } else {

                showMessage(
                    response.data.message ||
                    "Unable to claim this food.",
                    "error"
                );

            }

        } catch (error) {

            console.error(
                "Claim error:",
                error
            );

            if (error.response?.data?.detail) {

                showMessage(
                    error.response.data.detail,
                    "error"
                );

            } else {

                showMessage(
                    "Unable to claim this food.",
                    "error"
                );

            }

        } finally {

            setClaiming(null);

        }

    };


    // =====================================================
    // CLAIM STATUS
    // =====================================================

    const getClaimStatus = (claim) => {

        const status =
            claim?.status ||
            claim?.claim_status ||
            claim?.food_status ||
            "";

        if (!status) {
            return "Status Unknown";
        }

        return status;

    };


    const getClaimStatusClass = (status) => {

        switch (status) {

            case "Pending":
                return "claim-status-pending";

            case "Approved":
                return "claim-status-approved";

            case "Ready for Pickup":
                return "claim-status-ready";

            case "Volunteer Accepted":
                return "claim-status-accepted";

            case "Picked Up":
                return "claim-status-picked";

            case "Delivered":
                return "claim-status-delivered";

            case "Collected":
                return "claim-status-collected";

            default:
                return "claim-status-default";

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
    // CATEGORIES
    // =====================================================

    const categories = useMemo(() => {

        return [
            "All",
            ...new Set(
                foodItems
                    .map(item => item.category)
                    .filter(Boolean)
            )
        ];

    }, [foodItems]);


    // =====================================================
    // FILTER FOOD
    // =====================================================

    const filteredFood = useMemo(() => {

        const query =
            search.trim().toLowerCase();

        return foodItems.filter((item) => {

            const matchesSearch =
                !query ||
                item.food_name
                    ?.toLowerCase()
                    .includes(query) ||

                item.description
                    ?.toLowerCase()
                    .includes(query) ||

                item.donor_name
                    ?.toLowerCase()
                    .includes(query) ||

                item.location
                    ?.toLowerCase()
                    .includes(query);

            const matchesCategory =
                category === "All" ||
                item.category === category;

            return (
                matchesSearch &&
                matchesCategory
            );

        });

    }, [foodItems, search, category]);


    // =====================================================
    // DERIVED STATS
    // =====================================================

    const deliveredClaims =
        claims.filter(
            claim =>
                getClaimStatus(claim) === "Delivered"
        ).length;


    const activeClaims =
        claims.filter(
            claim => {
                const status =
                    getClaimStatus(claim);

                return (
                    status !== "Delivered" &&
                    status !== "Collected"
                );
            }
        ).length;


    // =====================================================
    // LOADING USER
    // =====================================================

    if (!user) {
        return null;
    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    return (

        <div className="recipient-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="recipient-sidebar">

                <div className="recipient-brand">

                    <div className="recipient-brand-icon">
                        <HeartHandshake size={24} />
                    </div>

                    <div>
                        <strong>FoodRescue</strong>
                        <span>Food Recovery Platform</span>
                    </div>

                </div>


                <div className="recipient-profile">

                    <div className="recipient-profile-avatar">
                        <User size={21} />
                    </div>

                    <div className="recipient-profile-info">

                        <strong>
                            {user.name}
                        </strong>

                        <span>
                            Recipient
                        </span>

                    </div>

                </div>


                <div className="recipient-sidebar-label">
                    WORKSPACE
                </div>


                <nav className="recipient-nav">

                    <button
                        className="recipient-nav-item active"
                        onClick={() =>
                            document
                                .getElementById("available-food")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >
                        <Package size={19} />
                        <span>Available Food</span>
                    </button>


                    <button
                        className="recipient-nav-item"
                        onClick={() =>
                            document
                                .getElementById("my-claims")
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        <CheckCircle size={19} />

                        <span>
                            My Claims
                        </span>

                        {claims.length > 0 && (
                            <span className="nav-count">
                                {claims.length}
                            </span>
                        )}

                    </button>


                    <button
                        className="recipient-nav-item"
                        onClick={() =>
                            navigate("/organizations")
                        }
                    >
                        <Building2 size={19} />
                        <span>Organizations</span>
                    </button>

                </nav>


                <div className="recipient-sidebar-bottom">

                    <div className="sidebar-help-card">

                        <Sparkles size={17} />

                        <div>
                            <strong>
                                Make an impact
                            </strong>

                            <span>
                                Every claim helps reduce food waste.
                            </span>
                        </div>

                    </div>


                    <button
                        className="recipient-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="recipient-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="recipient-header">

                    <div className="recipient-header-copy">

                        <div className="recipient-eyebrow">
                            <span className="eyebrow-dot"></span>
                            RECIPIENT WORKSPACE
                        </div>

                        <h1>
                            Find food.
                            <span> Make a difference.</span>
                        </h1>

                        <p>
                            Discover verified surplus food,
                            claim what you need, and help
                            prevent good food from going to waste.
                        </p>

                    </div>


                    <div className="recipient-header-actions">

                        <button
                            className="recipient-refresh"
                            onClick={handleRefresh}
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>


                        <div className="recipient-header-user">

                            <div className="header-avatar">
                                <User size={18} />
                            </div>

                            <div>
                                <strong>
                                    {user.name}
                                </strong>

                                <small>
                                    {user.email}
                                </small>
                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                {message && (

                    <div
                        className={`recipient-message ${messageType}`}
                    >

                        <div className="message-icon">

                            {messageType === "success"
                                ? <CheckCircle size={18} />
                                : <X size={18} />
                            }

                        </div>

                        <span>
                            {message}
                        </span>

                    </div>

                )}


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="recipient-stats">

                    <div className="recipient-stat-card">

                        <div className="recipient-stat-icon">
                            <Utensils size={21} />
                        </div>

                        <div>
                            <span>Available Donations</span>
                            <strong>{foodItems.length}</strong>
                        </div>

                    </div>


                    <div className="recipient-stat-card">

                        <div className="recipient-stat-icon">
                            <CheckCircle size={21} />
                        </div>

                        <div>
                            <span>Total Claims</span>
                            <strong>{claims.length}</strong>
                        </div>

                    </div>


                    <div className="recipient-stat-card">

                        <div className="recipient-stat-icon">
                            <Truck size={21} />
                        </div>

                        <div>
                            <span>Active Claims</span>
                            <strong>{activeClaims}</strong>
                        </div>

                    </div>


                    <div className="recipient-stat-card">

                        <div className="recipient-stat-icon">
                            <HeartHandshake size={21} />
                        </div>

                        <div>
                            <span>Food Received</span>
                            <strong>{deliveredClaims}</strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <section className="recipient-discovery">

                    <div className="discovery-top">

                        <div>

                            <div className="section-kicker">
                                DISCOVER
                            </div>

                            <h2>
                                Available food
                            </h2>

                            <p>
                                Browse verified donations currently
                                available through FoodRescue.
                            </p>

                        </div>

                        <div className="result-count">
                            {filteredFood.length}{" "}
                            {filteredFood.length === 1
                                ? "donation"
                                : "donations"}
                        </div>

                    </div>


                    <div className="recipient-controls">

                        <div className="recipient-search">

                            <Search size={19} />

                            <input
                                type="text"
                                placeholder="Search food, donor or location..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            {search && (
                                <button
                                    className="clear-search"
                                    onClick={() => setSearch("")}
                                >
                                    <X size={15} />
                                </button>
                            )}

                        </div>


                        <div className="recipient-category-list">

                            {categories.map(
                                (currentCategory) => (

                                    <button
                                        key={currentCategory}
                                        className={
                                            category === currentCategory
                                                ? "recipient-category active"
                                                : "recipient-category"
                                        }
                                        onClick={() =>
                                            setCategory(
                                                currentCategory
                                            )
                                        }
                                    >
                                        {currentCategory}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    AVAILABLE FOOD
                ================================================= */}

                <section
                    className="recipient-food-section"
                    id="available-food"
                >

                    {loading ? (

                        <div className="recipient-empty-state">

                            <div className="empty-icon spinning">
                                <RefreshCw size={28} />
                            </div>

                            <h3>
                                Loading available food
                            </h3>

                            <p>
                                Finding verified donations for you...
                            </p>

                        </div>

                    ) : filteredFood.length === 0 ? (

                        <div className="recipient-empty-state">

                            <div className="empty-icon">
                                <Package size={32} />
                            </div>

                            <h3>
                                No food found
                            </h3>

                            <p>
                                Try changing your search or selecting
                                another category.
                            </p>

                            {(search || category !== "All") && (
                                <button
                                    className="reset-filters"
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("All");
                                    }}
                                >
                                    Clear filters
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="recipient-food-grid">

                            {filteredFood.map((item) => (

                                <article
                                    className="recipient-food-card"
                                    key={item.id}
                                >

                                    <div className="food-card-top">

                                        <div className="food-card-icon">
                                            <Utensils size={21} />
                                        </div>

                                        <span className="verified-badge">
                                            <CheckCircle size={14} />
                                            Verified
                                        </span>

                                    </div>


                                    <div className="food-card-content">

                                        <div className="food-card-category">
                                            {item.category || "Food Donation"}
                                        </div>

                                        <h3>
                                            {item.food_name}
                                        </h3>

                                        <p className="food-card-description">
                                            {item.description ||
                                                "Fresh surplus food available for donation."}
                                        </p>


                                        <div className="food-card-details">

                                            <div className="food-detail-row">

                                                <Package size={16} />

                                                <span>
                                                    <strong>
                                                        {item.quantity}
                                                    </strong>
                                                    {" "}servings
                                                </span>

                                            </div>


                                            <div className="food-detail-row">

                                                <MapPin size={16} />

                                                <span>
                                                    {item.location}
                                                </span>

                                            </div>


                                            <div className="food-detail-row">

                                                <Clock size={16} />

                                                <span>
                                                    Available until{" "}
                                                    {new Date(
                                                        item.expiry_date
                                                    ).toLocaleString()}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="food-card-donor">

                                            <div className="donor-avatar">
                                                <User size={15} />
                                            </div>

                                            <div>
                                                <small>
                                                    DONATED BY
                                                </small>

                                                <strong>
                                                    {item.donor_name}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        className="recipient-claim-button"
                                        disabled={
                                            claiming === item.id
                                        }
                                        onClick={() =>
                                            handleClaim(item.id)
                                        }
                                    >

                                        {claiming === item.id ? (
                                            <>
                                                <RefreshCw
                                                    size={17}
                                                    className="button-spin"
                                                />
                                                Claiming...
                                            </>
                                        ) : (
                                            <>
                                                Claim Food
                                                <ArrowRight size={17} />
                                            </>
                                        )}

                                    </button>

                                </article>

                            ))}

                        </div>

                    )}

                </section>


                {/* =================================================
                    MY CLAIMS
                ================================================= */}

                <section
                    className="recipient-claims-section"
                    id="my-claims"
                >

                    <div className="claims-header">

                        <div>

                            <div className="section-kicker">
                                TRACKING
                            </div>

                            <h2>
                                My claims
                            </h2>

                            <p>
                                Follow the progress of food you have claimed.
                            </p>

                        </div>

                        <div className="claims-total">
                            {claims.length}
                            <span>
                                {claims.length === 1
                                    ? " claim"
                                    : " claims"}
                            </span>
                        </div>

                    </div>


                    {claims.length === 0 ? (

                        <div className="recipient-empty-state compact">

                            <div className="empty-icon">
                                <CheckCircle size={31} />
                            </div>

                            <h3>
                                No claims yet
                            </h3>

                            <p>
                                When you claim available food,
                                its progress will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="recipient-claims-list">

                            {claims.map((claim) => {

                                const currentStatus =
                                    getClaimStatus(claim);

                                return (

                                    <div
                                        className="recipient-claim-card"
                                        key={claim.id}
                                    >

                                        <div className="claim-main">

                                            <div className="claim-food-icon">
                                                <Package size={20} />
                                            </div>

                                            <div className="claim-food-info">

                                                <h3>
                                                    {claim.food_name}
                                                </h3>

                                                <div className="claim-location">
                                                    <MapPin size={14} />
                                                    {claim.location}
                                                </div>

                                            </div>

                                        </div>


                                        <div className="claim-progress">

                                            <span className="claim-progress-label">
                                                CLAIM STATUS
                                            </span>

                                            <span
                                                className={`recipient-claim-status ${getClaimStatusClass(
                                                    currentStatus
                                                )}`}
                                            >
                                                {currentStatus}
                                            </span>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </section>


                {/* =================================================
                    ORGANIZATION CTA
                ================================================= */}

                <section className="recipient-organization-cta">

                    <div className="organization-cta-content">

                        <div className="organization-cta-icon">
                            <HeartHandshake size={26} />
                        </div>

                        <div>

                            <div className="section-kicker">
                                COMMUNITY NETWORK
                            </div>

                            <h2>
                                Explore organizations in Mumbai
                            </h2>

                            <p>
                                Discover NGOs, restaurants and other
                                organizations listed in the FoodRescue directory.
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={() =>
                            navigate("/organizations")
                        }
                    >
                        Explore Organizations
                        <ArrowRight size={17} />
                    </button>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="recipient-footer">

                    <div>
                        <strong>FoodRescue</strong>

                        <span>
                            Connecting surplus food with communities in need.
                        </span>
                    </div>

                    <span className="footer-status">
                        <span></span>
                        Platform Active
                    </span>

                </footer>

            </main>

        </div>

    );

}


export default RecipientDashboard;
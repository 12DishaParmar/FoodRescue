import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import {
    Utensils,
    Plus,
    Package,
    MapPin,
    Clock,
    LogOut,
    X,
    CheckCircle,
    AlertCircle,
    Building2
} from "lucide-react";


function DonorDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [organizations, setOrganizations] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [loading, setLoading] = useState(false);
    const [organizationsLoading, setOrganizationsLoading] = useState(false);


    // =========================
    // FORM DATA
    // =========================

    const [formData, setFormData] = useState({
        food_name: "",
        description: "",
        category: "Cooked Food",
        quantity: "",
        location: "",
        expiry_date: "",
        pickup_deadline: "",
        contact: "",
        organization_id: ""
    });


    // =========================
    // LOAD LOGGED-IN USER
    // =========================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("foodrescue_user");

        if (!savedUser) {
            navigate("/");
            return;
        }

        const parsedUser =
            JSON.parse(savedUser);

        if (parsedUser.role !== "Donor") {
            navigate("/");
            return;
        }

        setUser(parsedUser);

        fetchFoodItems();
        fetchOrganizations();

    }, [navigate]);


    // =========================
    // FETCH FOOD ITEMS
    // =========================

    const fetchFoodItems = async () => {

        try {

            const response =
                await API.get("/food-items");

            const savedUser =
                localStorage.getItem("foodrescue_user");

            if (savedUser) {

                const currentUser =
                    JSON.parse(savedUser);

                const myItems =
                    response.data.filter(
                        item =>
                            Number(item.donor_id) ===
                            Number(currentUser.id)
                    );

                setFoodItems(myItems);

            } else {

                setFoodItems([]);

            }

        } catch (error) {

            console.error(
                "Unable to load food items:",
                error
            );

        }

    };


    // =========================
    // FETCH ORGANIZATIONS
    // =========================

    const fetchOrganizations = async () => {

        setOrganizationsLoading(true);

        try {

            const response =
                await API.get("/organizations");

            /*
             * IMPORTANT:
             *
             * Only FoodRescue-verified organizations
             * can be selected as partner organizations.
             *
             * Public directory listings are still visible
             * on the Organizations page, but they cannot
             * be assigned to a donation as a FoodRescue partner.
             */

            const verifiedOrganizations =
                response.data.filter(
                    organization =>
                        organization.verified === true ||
                        organization.verified === 1
                );

            setOrganizations(
                verifiedOrganizations
            );

        } catch (error) {

            console.error(
                "Unable to load organizations:",
                error
            );

            setOrganizations([]);

        } finally {

            setOrganizationsLoading(false);

        }

    };


    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // =========================
    // SHOW MESSAGE
    // =========================

    const showMessage = (
        text,
        type = "success"
    ) => {

        setMessage(text);
        setMessageType(type);

    };


    // =========================
    // ADD FOOD
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!user) {

            showMessage(
                "User session not found.",
                "error"
            );

            return;

        }


        setLoading(true);
        setMessage("");


        try {

            const params =
                new URLSearchParams();


            // =========================
            // FOOD DETAILS
            // =========================

            params.append(
                "food_name",
                formData.food_name
            );

            params.append(
                "description",
                formData.description
            );

            params.append(
                "category",
                formData.category
            );

            params.append(
                "quantity",
                formData.quantity
            );

            params.append(
                "location",
                formData.location
            );

            params.append(
                "expiry_date",
                formData.expiry_date
            );

            if (formData.pickup_deadline) {
                params.append(
                    "pickup_deadline",
                    formData.pickup_deadline
                );
            }


            // =========================
            // DONOR DETAILS
            // =========================

            params.append(
                "donor_name",
                user.name
            );

            params.append(
                "contact",
                formData.contact
            );

            params.append(
                "donor_id",
                user.id
            );


            // =========================
            // ORGANIZATION
            // =========================
            //
            // Only send organization_id
            // if the donor selected one.
            //
            // This keeps organization selection optional.

            if (formData.organization_id) {

                params.append(
                    "organization_id",
                    formData.organization_id
                );

            }


            console.log(
                "Submitting food donation:",
                Object.fromEntries(params)
            );


            const response =
                await API.post(
                    `/food-items?${params.toString()}`
                );


            console.log(
                "Food API response:",
                response.data
            );


            // =========================
            // CHECK REAL SUCCESS
            // =========================

            if (response.data.success) {

                showMessage(
                    "Food donation added successfully!",
                    "success"
                );


                // Reset form

                setFormData({
                    food_name: "",
                    description: "",
                    category: "Cooked Food",
                    quantity: "",
                    location: "",
                    expiry_date: "",
                    pickup_deadline: "",
                    contact: "",
                    organization_id: ""
                });


                // Reload donor listings

                await fetchFoodItems();


                // Close modal after delay

                setTimeout(() => {

                    setShowForm(false);
                    setMessage("");

                }, 1200);


            } else {

                showMessage(
                    response.data.message ||
                    "Unable to add food donation.",
                    "error"
                );

            }


        } catch (error) {

            console.error(
                "Food donation error:",
                error
            );


            // FastAPI validation error

            if (
                error.response &&
                error.response.data &&
                error.response.data.detail
            ) {

                showMessage(
                    error.response.data.detail,
                    "error"
                );

            }

            // Backend error

            else if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {

                showMessage(
                    error.response.data.message,
                    "error"
                );

            }

            else {

                showMessage(
                    "Unable to add food donation. Please check that the backend server is running.",
                    "error"
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem(
            "foodrescue_user"
        );

        navigate("/");

    };


    // =========================
    // WAIT FOR USER
    // =========================

    if (!user) {
        return null;
    }


    return (

        <div className="dashboard-page">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <div className="sidebar-logo-icon">

                        <Utensils size={22} />

                    </div>

                    <span>
                        Food<span>Rescue</span>
                    </span>

                </div>


                <nav className="sidebar-nav">

                    <div className="nav-item active">

                        <Package size={19} />

                        Dashboard

                    </div>


                    <div
                        className="nav-item"
                        onClick={() =>
                            navigate("/organizations")
                        }
                    >

                        <Building2 size={19} />

                        Organizations

                    </div>

                </nav>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >

                    <LogOut size={18} />

                    Logout

                </button>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="dashboard-main">


                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <p className="dashboard-label">
                            DONOR DASHBOARD
                        </p>

                        <h1>
                            Welcome, {user.name} 
                        </h1>

                        <p>
                            Help reduce food waste by sharing
                            surplus food.
                        </p>

                    </div>


                    <button
                        className="add-food-button"
                        onClick={() => {

                            setMessage("");

                            setShowForm(true);

                        }}
                    >

                        <Plus size={19} />

                        Add Surplus Food

                    </button>

                </header>


                {/* =========================
                    STATS
                ========================= */}

                <section className="stats-grid">


                    <div className="stat-card">

                        <div className="stat-icon">

                            <Package size={22} />

                        </div>

                        <div>

                            <span>
                                Total Listings
                            </span>

                            <strong>
                                {foodItems.length}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">

                            <CheckCircle size={22} />

                        </div>

                        <div>

                            <span>
                                Verified
                            </span>

                            <strong>

                                {
                                    foodItems.filter(
                                        item =>
                                            item.status ===
                                            "Verified"
                                    ).length
                                }

                            </strong>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">

                            <Utensils size={22} />

                        </div>

                        <div>

                            <span>
                                Food Portions
                            </span>

                            <strong>

                                {
                                    foodItems.reduce(
                                        (total, item) =>
                                            total +
                                            Number(
                                                item.quantity || 0
                                            ),
                                        0
                                    )
                                }

                            </strong>

                        </div>

                    </div>


                </section>


                {/* =========================
                    LISTINGS
                ========================= */}

                <section className="listings-section">


                    <div className="section-heading">

                        <div>

                            <h2>
                                My Food Listings
                            </h2>

                            <p>
                                Track your shared food, verification status,
                                pickup deadlines and partner organizations.
                            </p>

                        </div>

                    </div>


                    {foodItems.length === 0 ? (

                        <div className="empty-state">

                            <Package size={45} />

                            <h3>
                                No food listings yet
                            </h3>

                            <p>
                                Start by adding your first
                                surplus food donation.
                            </p>

                            <button
                                onClick={() =>
                                    setShowForm(true)
                                }
                            >

                                <Plus size={18} />

                                Add Food

                            </button>

                        </div>

                    ) : (

                        <div className="food-grid">


                            {foodItems.map(
                                (item) => (

                                    <div
                                        className="food-card"
                                        key={item.id}
                                    >


                                        <div className="food-card-top">


                                            <div className="food-category">

                                                {item.category}

                                            </div>


                                            <span
                                                className="status-badge"
                                            >

                                                {item.status}

                                            </span>


                                        </div>


                                        <h3>
                                            {item.food_name}
                                        </h3>


                                        <p className="food-description">

                                            {item.description ||
                                                "No description available."}

                                        </p>


                                        <div className="food-details">


                                            <div>

                                                <Package size={16} />

                                                {item.quantity}
                                                {" "}
                                                portions

                                            </div>


                                            <div>

                                                <MapPin size={16} />

                                                {item.location}

                                            </div>


                                            <div>

                                                <Clock size={16} />

                                                <span>
                                                    Expires:{" "}
                                                    {new Date(
                                                        item.expiry_date
                                                    ).toLocaleString()}
                                                </span>

                                            </div>

                                            {item.pickup_deadline && (
                                                <div>
                                                    <Clock size={16} />

                                                    <span>
                                                        Pickup by:{" "}
                                                        {new Date(
                                                            item.pickup_deadline
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}


                                        </div>


                                        {/* =========================
                                            ORGANIZATION
                                        ========================= */}

                                        {item.organization_id && (

                                            <div className="food-donor">

                                                <Building2
                                                    size={15}
                                                />

                                                Organization:

                                                <strong>

                                                    {
                                                        item.organization_name ||
                                                        "FoodRescue Partner"
                                                    }

                                                </strong>

                                            </div>

                                        )}


                                        <div className="food-donor">

                                            Donated by:

                                            <strong>
                                                {item.donor_name}
                                            </strong>

                                        </div>


                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


            </main>


            {/* =========================
                ADD FOOD MODAL
            ========================= */}

            {showForm && (

                <div className="modal-overlay">


                    <div className="modal">


                        <div className="modal-header">


                            <div>

                                <h2>
                                    Add Surplus Food
                                </h2>

                                <p>
                                    Share surplus food with clear pickup
                                    and expiry information.
                                </p>

                            </div>


                            <button
                                className="close-button"
                                onClick={() => {

                                    setShowForm(false);
                                    setMessage("");

                                }}
                            >

                                <X size={20} />

                            </button>


                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >


                            {/* FOOD NAME + CATEGORY */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        Food Name
                                    </label>

                                    <input
                                        name="food_name"
                                        value={
                                            formData.food_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Vegetable Biryani"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option>
                                            Cooked Food
                                        </option>

                                        <option>
                                            Bakery
                                        </option>

                                        <option>
                                            Fruits & Vegetables
                                        </option>

                                        <option>
                                            Packaged Food
                                        </option>

                                        <option>
                                            Beverages
                                        </option>

                                        <option>
                                            Other
                                        </option>

                                    </select>

                                </div>


                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the food..."
                                    rows="3"
                                />

                            </div>


                            {/* QUANTITY + LOCATION */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        Quantity / Portions
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. 20"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Pickup Location
                                    </label>

                                    <input
                                        name="location"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Kandivali West"
                                        required
                                    />

                                </div>


                            </div>


                            {/* EXPIRY + PICKUP DEADLINE */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        Food Expiry Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="expiry_date"
                                        value={
                                            formData.expiry_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: "7px",
                                            opacity: 0.7
                                        }}
                                    >
                                        When the food should no longer be
                                        considered available.
                                    </small>

                                </div>


                                <div className="form-group">

                                    <label>
                                        Pickup Deadline
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="pickup_deadline"
                                        value={
                                            formData.pickup_deadline
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: "7px",
                                            opacity: 0.7
                                        }}
                                    >
                                        Set the latest time a volunteer
                                        should collect the donation.
                                    </small>

                                </div>


                            </div>


                            {/* CONTACT */}

                            <div className="form-group">

                                <label>
                                    Contact Number
                                </label>

                                <input
                                    type="tel"
                                    name="contact"
                                    value={
                                        formData.contact
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. 9876543210"
                                    required
                                />

                            </div>


                            {/* =========================
                                ORGANIZATION
                            ========================= */}

                            <div className="form-group">

                                <label>
                                    Partner Organization
                                </label>

                                <select
                                    name="organization_id"
                                    value={
                                        formData.organization_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        organizationsLoading
                                    }
                                >

                                    <option value="">
                                        {organizationsLoading
                                            ? "Loading organizations..."
                                            : organizations.length === 0
                                                ? "No verified organizations available"
                                                : "Direct donation — no organization"}
                                    </option>


                                    {organizations.map(
                                        (organization) => (

                                            <option
                                                key={
                                                    organization.id
                                                }
                                                value={
                                                    organization.id
                                                }
                                            >

                                                {organization.name}
                                                {" — "}
                                                {organization.area ||
                                                    organization.city}

                                            </option>

                                        )
                                    )}

                                </select>


                                <small
                                    style={{
                                        display: "block",
                                        marginTop: "7px",
                                        opacity: 0.7
                                    }}
                                >

                                    Select an organization only if
                                    your donation is being routed
                                    through a FoodRescue-verified
                                    partner.

                                </small>

                            </div>


                            {/* MESSAGE */}

                            {message && (

                                <div
                                    className={
                                        messageType === "success"
                                            ? "success-message"
                                            : "error-message"
                                    }
                                >

                                    {messageType ===
                                    "success" ? (

                                        <CheckCircle
                                            size={18}
                                        />

                                    ) : (

                                        <AlertCircle
                                            size={18}
                                        />

                                    )}

                                    <span>
                                        {message}
                                    </span>

                                </div>

                            )}


                            <div
                                style={{
                                    marginBottom: "14px",
                                    fontSize: "12px",
                                    opacity: 0.72,
                                    lineHeight: 1.5
                                }}
                            >
                                Your donation will be submitted as
                                <strong> Pending </strong>
                                and can be verified before recipients claim it.
                            </div>


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="submit-food-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Adding Food..."
                                    : "Add Food Donation"}

                            </button>


                        </form>


                    </div>

                </div>

            )}


        </div>

    );

}

export default DonorDashboard;

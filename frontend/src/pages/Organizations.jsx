import React, { useEffect, useState } from "react";

import {
    Search,
    MapPin,
    Building2,
    Utensils,
    HeartHandshake,
    RefreshCw,
    Mail,
    Phone,
    ExternalLink,
    ShieldCheck,
    Database,
    Target,
} from "lucide-react";

import API from "../api";
import "./Organizations.css";


function Organizations() {

    const [organizations, setOrganizations] = useState([]);

    const [search, setSearch] = useState("");

    const [type, setType] = useState("All");

    const [area, setArea] = useState("All");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // -----------------------------------------
    // FETCH ORGANIZATIONS
    // -----------------------------------------

    const fetchOrganizations = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await API.get("/organizations");

            setOrganizations(response.data);

        } catch (err) {

            console.error(err);

            setError("Unable to load organizations.");

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchOrganizations();

    }, []);


    // -----------------------------------------
    // AREAS
    // -----------------------------------------

    const areas = [
        "All",
        ...new Set(
            organizations
                .map((org) => org.area)
                .filter(Boolean)
        )
    ];


    // -----------------------------------------
    // FILTER ORGANIZATIONS
    // -----------------------------------------

    const filteredOrganizations = organizations.filter((org) => {

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            org.name?.toLowerCase().includes(searchText) ||
            org.area?.toLowerCase().includes(searchText) ||
            org.address?.toLowerCase().includes(searchText) ||
            org.focus_area?.toLowerCase().includes(searchText) ||
            org.type?.toLowerCase().includes(searchText);

        const matchesType =
            type === "All" ||
            org.type === type;

        const matchesArea =
            area === "All" ||
            org.area === area;

        return (
            matchesSearch &&
            matchesType &&
            matchesArea
        );

    });


    // -----------------------------------------
    // ORGANIZATION ICON
    // -----------------------------------------

    const getIcon = (organizationType) => {

        if (organizationType === "NGO") {

            return <HeartHandshake size={25} />;

        }

        if (organizationType === "Hotel") {

            return <Building2 size={25} />;

        }

        return <Utensils size={25} />;

    };


    // -----------------------------------------
    // TYPE CSS CLASS
    // -----------------------------------------

    const getTypeClass = (organizationType) => {

        if (organizationType === "NGO") {

            return "ngo";

        }

        if (organizationType === "Hotel") {

            return "hotel";

        }

        return "restaurant";

    };


    // -----------------------------------------
    // STATISTICS
    // -----------------------------------------

    const restaurantCount =
        organizations.filter(
            (org) => org.type === "Restaurant"
        ).length;


    const hotelCount =
        organizations.filter(
            (org) => org.type === "Hotel"
        ).length;


    const ngoCount =
        organizations.filter(
            (org) => org.type === "NGO"
        ).length;


    const publicListingCount =
        organizations.filter(
            (org) =>
                org.data_status === "Directory Listing" ||
                org.data_status === "Public Organization Listing"
        ).length;


    // -----------------------------------------
    // PAGE
    // -----------------------------------------

    return (

        <div className="organizations-page">


            {/* =====================================
                HEADER
            ====================================== */}

            <header className="organizations-header">

                <div>

                    <div className="brand-small">
                        FOODRESCUE
                    </div>


                    <h1>
                        Mumbai Organizations
                    </h1>


                    <p>
                        Discover NGOs, restaurants and hotels
                        that can support food recovery and
                        community distribution.
                    </p>

                </div>


                <button
                    className="refresh-btn"
                    onClick={fetchOrganizations}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={loading ? "spin-icon" : ""}
                    />

                    {loading ? "Refreshing..." : "Refresh"}

                </button>

            </header>


            {/* =====================================
                INFORMATION BANNER
            ====================================== */}

            <section className="organization-info-banner">

                <div className="info-banner-icon">

                    <Database size={22} />

                </div>


                <div>

                    <strong>
                        Mumbai Organization Directory
                    </strong>

                    <p>
                        This directory combines FoodRescue
                        records with publicly available
                        organization information. Public
                        listings are not automatically
                        FoodRescue partners.
                    </p>

                </div>

            </section>


            {/* =====================================
                STATISTICS
            ====================================== */}

            <section className="organization-stats">


                <div className="org-stat-card">

                    <div className="stat-number">
                        {organizations.length}
                    </div>

                    <div className="stat-label">
                        Organizations
                    </div>

                </div>


                <div className="org-stat-card">

                    <div className="stat-number">
                        {restaurantCount}
                    </div>

                    <div className="stat-label">
                        Restaurants
                    </div>

                </div>


                <div className="org-stat-card">

                    <div className="stat-number">
                        {hotelCount}
                    </div>

                    <div className="stat-label">
                        Hotels
                    </div>

                </div>


                <div className="org-stat-card">

                    <div className="stat-number">
                        {ngoCount}
                    </div>

                    <div className="stat-label">
                        NGOs
                    </div>

                </div>


                <div className="org-stat-card">

                    <div className="stat-number">
                        {publicListingCount}
                    </div>

                    <div className="stat-label">
                        Public Listings
                    </div>

                </div>


            </section>


            {/* =====================================
                SEARCH + FILTERS
            ====================================== */}

            <section className="organization-controls">


                <div className="organization-search">

                    <Search size={20} />

                    <input
                        type="text"
                        placeholder="Search organization, area, address or focus..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <div className="filter-group">


                    <select
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value)
                        }
                    >

                        <option value="All">
                            All Types
                        </option>

                        <option value="Restaurant">
                            Restaurants
                        </option>

                        <option value="Hotel">
                            Hotels
                        </option>

                        <option value="NGO">
                            NGOs
                        </option>

                    </select>


                    <select
                        value={area}
                        onChange={(e) =>
                            setArea(e.target.value)
                        }
                    >

                        {areas.map((currentArea) => (

                            <option
                                key={currentArea}
                                value={currentArea}
                            >

                                {currentArea === "All"
                                    ? "All Areas"
                                    : currentArea}

                            </option>

                        ))}

                    </select>

                </div>

            </section>


            {/* =====================================
                RESULT COUNT
            ====================================== */}

            {!loading && !error && (

                <div className="organization-result-count">

                    Showing{" "}

                    <strong>
                        {filteredOrganizations.length}
                    </strong>

                    {" "}of{" "}

                    <strong>
                        {organizations.length}
                    </strong>

                    {" "}organizations

                </div>

            )}


            {/* =====================================
                ERROR
            ====================================== */}

            {error && (

                <div className="organization-error">

                    {error}

                </div>

            )}


            {/* =====================================
                LOADING
            ====================================== */}

            {loading && (

                <div className="organization-message">

                    <RefreshCw
                        size={22}
                        className="spin-icon"
                    />

                    Loading organizations...

                </div>

            )}


            {/* =====================================
                EMPTY
            ====================================== */}

            {!loading &&
                filteredOrganizations.length === 0 && (

                    <div className="organization-message">

                        <Search size={28} />

                        <span>
                            No organizations found.
                        </span>

                        <small>
                            Try changing your search or filters.
                        </small>

                    </div>

                )}


            {/* =====================================
                ORGANIZATION GRID
            ====================================== */}

            {!loading &&
                filteredOrganizations.length > 0 && (

                    <section className="organization-grid">


                        {filteredOrganizations.map((org) => (

                            <div
                                className="organization-card"
                                key={org.id}
                            >


                                {/* CARD TOP */}

                                <div className="organization-card-top">


                                    <div
                                        className={`organization-icon ${getTypeClass(org.type)}`}
                                    >

                                        {getIcon(org.type)}

                                    </div>


                                    <span
                                        className={`organization-type ${getTypeClass(org.type)}`}
                                    >

                                        {org.type}

                                    </span>


                                    <span className="listing-badge">

                                        {org.data_status ===
                                        "Directory Listing"
                                            ? "Public Listing"
                                            : org.data_status ||
                                              "Organization"}

                                    </span>

                                </div>


                                {/* NAME */}

                                <h2>
                                    {org.name}
                                </h2>


                                {/* LOCATION */}

                                <div className="organization-location">

                                    <MapPin size={17} />

                                    <span>

                                        {org.area || "Mumbai"}

                                        {org.city
                                            ? `, ${org.city}`
                                            : ""}

                                    </span>

                                </div>


                                {/* ADDRESS */}

                                {org.address && (

                                    <p className="organization-address">

                                        {org.address}

                                    </p>

                                )}


                                {/* FOCUS AREA */}

                                {org.focus_area && (

                                    <div className="organization-focus">

                                        <Target size={16} />

                                        <div>

                                            <span>
                                                Focus Area
                                            </span>

                                            <strong>
                                                {org.focus_area}
                                            </strong>

                                        </div>

                                    </div>

                                )}


                                {/* CONTACT INFORMATION */}

                                <div className="organization-contact-section">


                                    {org.contact && (

                                        <a
                                            href={`tel:${org.contact}`}
                                            className="organization-contact-link"
                                        >

                                            <Phone size={16} />

                                            <span>
                                                {org.contact}
                                            </span>

                                        </a>

                                    )}


                                    {org.email && (

                                        <a
                                            href={`mailto:${org.email}`}
                                            className="organization-contact-link"
                                        >

                                            <Mail size={16} />

                                            <span>
                                                {org.email}
                                            </span>

                                        </a>

                                    )}

                                </div>


                                {/* SOURCE */}

                                {org.source_name && (

                                    <div className="organization-source">

                                        <div className="source-icon">

                                            <ShieldCheck size={16} />

                                        </div>


                                        <div className="source-content">

                                            <span>
                                                Information Source
                                            </span>

                                            <strong>
                                                {org.source_name}
                                            </strong>

                                        </div>


                                        {org.source_url && (

                                            <a
                                                href={org.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="source-link"
                                                title="Open source"
                                            >

                                                <ExternalLink size={17} />

                                            </a>

                                        )}

                                    </div>

                                )}


                                {/* STATUS */}

                                <div
                                    className={
                                        org.verified
                                            ? "verified-badge verified"
                                            : "verified-badge public-listing"
                                    }
                                >

                                    {org.verified ? (

                                        <>
                                            <ShieldCheck size={15} />

                                            FoodRescue Verified

                                        </>

                                    ) : (

                                        <>
                                            <Database size={15} />

                                            Public Directory Listing

                                        </>

                                    )}

                                </div>


                            </div>

                        ))}

                    </section>

                )}


            {/* =====================================
                FOOTER
            ====================================== */}

            <footer className="organizations-footer">

                <strong>
                    FoodRescue
                </strong>

                <span>
                    Helping connect surplus food with
                    communities in need.
                </span>

            </footer>


        </div>

    );

}


export default Organizations;
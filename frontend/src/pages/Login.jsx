import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { Utensils, Mail, Lock, ArrowRight } from "lucide-react";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await API.post("/login", {
                email: email,
                password: password
            });

            if (response.data.success) {

                const user = response.data.user;

                localStorage.setItem(
                    "foodrescue_user",
                    JSON.stringify(user)
                );

                if (user.role === "Donor") {
                    navigate("/donor-dashboard");

                } else if (user.role === "Recipient") {
                    navigate("/recipient-dashboard");

                } else if (user.role === "Admin") {
                    navigate("/admin-dashboard");

                } else if (user.role === "Volunteer") {
                    navigate("/volunteer-dashboard");

                } else {
                    setMessage("Unknown user role.");
                }

            } else {
                setMessage(response.data.message);
            }

        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to FoodRescue server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="logo-section">
                    <div className="logo-icon">
                        <Utensils size={28} />
                    </div>

                    <h1>
                        Food<span>Rescue</span>
                    </h1>

                    <p>
                        Rescue food. Reduce waste. Feed communities.
                    </p>
                </div>

                <div className="form-section">

                    <h2>Welcome Back</h2>

                    <p className="form-subtitle">
                        Login to continue to your account
                    </p>

                    <form onSubmit={handleLogin}>

                        <label>Email Address</label>

                        <div className="input-wrapper">
                            <Mail size={19} />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <label>Password</label>

                        <div className="input-wrapper">
                            <Lock size={19} />

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className="error-message">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}

                            {!loading && (
                                <ArrowRight size={19} />
                            )}
                        </button>

                    </form>

                    <div className="switch-auth">
                        Don't have an account?

                        <Link to="/register">
                            Create Account
                        </Link>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;
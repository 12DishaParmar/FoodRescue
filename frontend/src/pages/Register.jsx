import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import {
    Utensils,
    User,
    Mail,
    Lock,
    Store,
    HeartHandshake
} from "lucide-react";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Donor");

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {

            const response = await API.post("/register", {
                name: name,
                email: email,
                password: password,
                role: role
            });

            if (response.data.success) {

                setSuccess(true);
                setMessage("Registration successful! You can now login.");

                setName("");
                setEmail("");
                setPassword("");

                setTimeout(() => {
                    navigate("/");
                }, 1500);

            } else {

                setSuccess(false);
                setMessage(response.data.message);

            }

        } catch (error) {

            console.error(error);

            setSuccess(false);
            setMessage(
                "Unable to connect to FoodRescue server."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card register-card">

                <div className="logo-section">

                    <div className="logo-icon">
                        <Utensils size={28} />
                    </div>

                    <h1>
                        Food<span>Rescue</span>
                    </h1>

                    <p>
                        Join the movement against food waste.
                    </p>

                </div>


                <div className="form-section">

                    <h2>Create Account</h2>

                    <p className="form-subtitle">
                        Choose how you want to use FoodRescue
                    </p>


                    <form onSubmit={handleRegister}>

                        <label>Name / Organization</label>

                        <div className="input-wrapper">

                            <User size={19} />

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                            />

                        </div>


                        <label>Email Address</label>

                        <div className="input-wrapper">

                            <Mail size={19} />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <label>Password</label>

                        <div className="input-wrapper">

                            <Lock size={19} />

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        <label>I am registering as</label>

                        <div className="role-selection">

                            <button
                                type="button"
                                className={
                                    role === "Donor"
                                        ? "role-card active"
                                        : "role-card"
                                }
                                onClick={() => setRole("Donor")}
                            >

                                <Store size={24} />

                                <div>
                                    <strong>Donor</strong>
                                    <small>
                                        Donate surplus food
                                    </small>
                                </div>

                            </button>


                            <button
                                type="button"
                                className={
                                    role === "Recipient"
                                        ? "role-card active"
                                        : "role-card"
                                }
                                onClick={() => setRole("Recipient")}
                            >

                                <HeartHandshake size={24} />

                                <div>
                                    <strong>Recipient</strong>
                                    <small>
                                        Receive available food
                                    </small>
                                </div>

                            </button>

                        </div>


                        {message && (

                            <div
                                className={
                                    success
                                        ? "success-message"
                                        : "error-message"
                                }
                            >
                                {message}
                            </div>

                        )}


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>


                    <div className="switch-auth">

                        Already have an account?

                        <Link to="/">
                            Login
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Register;
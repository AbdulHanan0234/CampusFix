import { useState } from "react";
import logo from "../assets/logo.png";
import clock from "../assets/clock.png";
import google from "../assets/google.png";
import flash from "../assets/flash.png";
import users from "../assets/users.png";
import rightarrow from "../assets/right-arrow.png";
import signupheroimg from "../assets/signupheroimg.png";
import loginheroimg from "../assets/loginheroimg.png";
import "./loginsignup.css";

const FEATURES = [
  {
    icon: flash,
    title: "Report Quickly",
    text: "Submit issues in just a few clicks.",
  },
  { icon: clock, title: "Track Progress", text: "Stay updated in real time." },
  {
    icon: users,
    title: "Build a Better Campus",
    text: "Your voice makes a difference.",
  },
];

const STATS = [
  ["5,000+", "Active Students"],
  ["200+", "Issues Resolved"],
  ["15+", "Departments"],
];

const Field = ({ label, type = "text", show, onToggle, ...props }) => (
  <label className="field">
    <span className="label">{label}</span>
    <span className="control">
      <input type={onToggle ? (show ? "text" : "password") : type} {...props} />
      {onToggle && (
        <button type="button" className="toggle" onClick={onToggle}>
          {show ? "Hide" : "Show"}
        </button>
      )}
    </span>
  </label>
);

export default function LoginSignup({ initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const signup = mode === "signup";

  const submit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (signup && data.password !== data.confirm)
      return setError("Passwords do not match.");
    setError("");
    console.log(signup ? "signup" : "login", data); // TODO: replace with your API call
  };

  const switchMode = () => {
    setMode(signup ? "login" : "signup");
    setError("");
  };

  return (
    <div className="auth">
      {/* ---------- left hero ---------- */}
      <aside className={signup ? "hero" : "hero hero-login"}>
        <a className="brand" href="/">
          <img src={logo} alt="CampusFix" />
        </a>

        <div className="hero-body">
          {signup ? (
            <>
              <h1>
                Fix Campus Issues <span>Together</span>
              </h1>
              <p className="lead">
                Report issues, track progress and help make your campus a better
                place — all in one place.
              </p>
              <ul className="features">
                {FEATURES.map(({ icon, title, text }) => (
                  <li key={title}>
                    <span className="feature-ic" aria-hidden="true">
                      <img src={icon} alt="" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h1>
                Better Campus. <span>Together.</span>
              </h1>
              <p className="lead">
                Report issues, track their progress, and help your campus become
                a better place — all from one platform.
              </p>
            </>
          )}
        </div>

        <img
          className="hero-art"
          src={signup ? signupheroimg : loginheroimg}
          alt=""
        />

        {!signup && (
          <ul className="stats">
            {STATS.map(([value, label]) => (
              <li key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ---------- right form panel ---------- */}
      <main className="panel">
        <section className={signup ? "card" : "card card-login"}>
          <h2>{signup ? "Create Your Account" : "Welcome Back! 👋"}</h2>
          <p className="sub">
            {signup
              ? "Join CampusFix and be part of a better campus."
              : "Sign in to your CampusFix account to continue."}
          </p>

          <form onSubmit={submit}>
            {error && <p className="error">{error}</p>}

            {signup && (
              <Field
                label="Full Name"
                name="name"
                placeholder="Enter your full name"
                required
              />
            )}
            <Field
              label={signup ? "Email Address" : "Email or Username"}
              name="email"
              type="email"
              placeholder={
                signup ? "Enter your email address" : "you@example.com"
              }
              required
            />
            <Field
              label="Password"
              name="password"
              placeholder={signup ? "Create a password" : "Enter your password"}
              minLength={6}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              required
            />
            {signup && (
              <Field
                label="Confirm Password"
                name="confirm"
                placeholder="Confirm your password"
                minLength={6}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                required
              />
            )}

            {!signup && (
              <div className="row">
                <label className="remember">
                  <input type="checkbox" name="remember" /> Remember me
                </label>
                <a className="text-link" href="#forgot">
                  Forgot password?
                </a>
              </div>
            )}

            <button className="btn" type="submit">
              {signup ? "Sign Up" : "Login"}
            </button>
          </form>

          <div className="divider">{signup ? "or" : "or continue with"}</div>

          {signup ? (
            <button className="btn-outline" type="button">
              <img className="provider-ic" src={google} alt="" />
              Continue with Google
            </button>
          ) : (
            <div className="providers">
              <button className="btn-outline" type="button">
                <img className="provider-ic" src={google} alt="" />
                Google
              </button>
            </div>
          )}

          {signup && (
            <p className="switch">
              Already have an account?{" "}
              <a
                className="text-link"
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  switchMode();
                }}
              >
                Log in <img className="arrow-ic" src={rightarrow} alt="" />
              </a>
            </p>
          )}

          {signup && (
            <p className="terms">
              By creating an account, you agree to our{" "}
              <a className="text-link" href="#terms">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-link" href="#privacy">
                Privacy Policy
              </a>
              .
            </p>
          )}

          {!signup && (
            <p className="switch">
              Don&apos;t have an account?{" "}
              <a
                className="text-link"
                href="#register"
                onClick={(e) => {
                  e.preventDefault();
                  switchMode();
                }}
              >
                Register
              </a>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

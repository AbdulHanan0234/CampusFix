import { Fragment } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import flash from "../assets/flash.png";
import clock from "../assets/clock.png";
import users from "../assets/users.png";
import rightarrow from "../assets/right-arrow.png";
import sun from "../assets/sun.png";
import homepagehero from "../assets/homepagehero.png";
import "./homepage.css";

/* ---------------------------------------------------------------------------
   Assets still missing from src/assets — each renders as an empty slot:
   chip/AI, target, bell, heart, report doc, route hub, check circle, tag,
   building, send, social icons, user avatars,
   service illustrations (report / lost & found), home icon (hero button)
--------------------------------------------------------------------------- */

// Renders the asset if available, otherwise a tinted placeholder block.
const Slot = ({ src, size = 24 }) =>
  src ? (
    <img
      src={src}
      alt=""
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  ) : (
    <span
      className="slot"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );

const FEATURES = [
  {
    icon: null, // TODO: chip/AI icon
    tone: "indigo",
    title: "AI-Powered Organization",
    text: "Our AI helps structure your complaint, suggest categories, and set the right priority.",
  },
  {
    icon: flash,
    tone: "green",
    title: "Fast & Easy Reporting",
    text: "Report issues in seconds with a simple, natural language interface.",
  },
  {
    icon: clock,
    tone: "blue",
    title: "Track Progress",
    text: "See real-time updates from report to resolution.",
  },
  {
    icon: users,
    tone: "orange",
    title: "Department Routing",
    text: "Issues are automatically assigned to the right department.",
  },
  {
    icon: null, // TODO: bell icon
    tone: "purple",
    title: "Instant Notifications",
    text: "Get updates via in-app notifications and email.",
  },
  {
    icon: null, // TODO: heart icon
    tone: "pink",
    title: "A Better Campus",
    text: "Together we can create a safer, cleaner and more comfortable campus.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: null, // TODO: report/document icon
    title: "Report",
    text: "Tell us what's wrong using a simple form or natural language.",
  },
  {
    n: "02",
    icon: null, // TODO: route/hub icon
    title: "We Route It",
    text: "CampusFix categorizes the issue and sends it to the relevant department.",
  },
  {
    n: "03",
    icon: clock,
    title: "Track",
    text: "Follow your issue's status and receive updates in real-time.",
  },
  {
    n: "04",
    icon: null, // TODO: check-circle icon
    title: "Get It Resolved",
    text: "The responsible department resolves the issue and closes the report.",
  },
];

const SERVICES = [
  {
    title: "Report an Issue",
    text: "Report maintenance, IT, safety, cleanliness and other campus problems.",
  },
  {
    title: "Lost & Found",
    text: "Report lost items or help return things found around campus.",
  },
];

const IMPACT = [
  {
    icon: users,
    title: "Built for Students & Staff",
    text: "A platform for the entire campus community.",
  },
  {
    icon: null, // TODO: tag icon
    title: "Issue Tracking",
    text: "Keep track of every report from start to finish.",
  },
  {
    icon: null, // TODO: building icon
    stat: "15+",
    title: "Departments Supported",
    text: "From maintenance to IT and more.",
  },
  {
    icon: null, // TODO: heart icon
    title: "A Safer, Cleaner Campus",
    text: "Because your voice matters.",
  },
];

// sample data for the dashboard mockup in the hero
const DASH_NAV = [
  "Dashboard",
  "Report Issue",
  "My Issues",
  "Notifications",
  "Profile",
];

const ISSUES = [
  {
    title: "Projector not working",
    meta: "Lab 3 · IT Department",
    priority: "High",
    tone: "high",
    status: "In Progress",
    stone: "progress",
  },
  {
    title: "Water cooler leaking",
    meta: "CS Department · Maintenance",
    priority: "Medium",
    tone: "med",
    status: "Open",
    stone: "open",
  },
  {
    title: "Broken chair",
    meta: "Room 204 · Maintenance",
    priority: "Low",
    tone: "low",
    status: "Assigned",
    stone: "assigned",
  },
];

const NAV_LINKS = [
  { label: "Home", href: "#home", active: true },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#impact" },
];

const SOCIALS = ["GitHub", "LinkedIn", "Instagram", "Facebook"];

export default function HomePage() {
  return (
    <>
      {/* ---------- navbar ---------- */}
      <header className="nav">
        <div className="container nav-inner">
          <Link className="nav-brand" to="/">
            <img src={logo} alt="CampusFix" />
          </Link>
          <nav className="nav-links">
            {NAV_LINKS.map(({ label, href, active }) => (
              <a key={label} href={href} className={active ? "active" : ""}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="theme-toggle"
              type="button"
              aria-label="Toggle theme"
            >
              <Slot src={sun} size={26} />
            </button>
            <Link className="btn btn-ghost" to="/login">
              Login
            </Link>
            <Link className="btn btn-primary btn-sm" to="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="pill">Smarter Campuses. Happier Students.</span>
              <h1>
                Fix campus problems. <span>Together.</span>
              </h1>
              <p className="lead">
                Report campus issues, track their progress, and stay updated
                until they're resolved — all from one platform.
              </p>
              <div className="hero-cta">
                <Link to="/login" className="btn btn-primary">
                  <Slot size={18} /> {/* TODO: home/report icon */}
                  Report an Issue
                  <img className="btn-arrow" src={rightarrow} alt="" />
                </Link>
                <a href="#features" className="btn btn-outline">
                  Explore CampusFix
                </a>
              </div>
              <div className="hero-stats">
                <div className="hstat">
                  <b>120+</b>
                  <small>Issues Resolved</small>
                </div>
                <div className="hstat">
                  <b>15+</b>
                  <small>Departments</small>
                </div>
                <div className="hstat">
                  <b>24h</b>
                  <small>Avg. Response</small>
                </div>
              </div>
            </div>

            {/* dashboard mockup (decorative) */}
            <div className="hero-visual" aria-hidden="true">
              <img className="hero-frame" src={homepagehero} alt="" />
              <div className="dash">
                <aside className="dash-side">
                  <img className="dash-logo" src={logo} alt="" />
                  <ul className="dash-nav">
                    {DASH_NAV.map((item, i) => (
                      <li key={item} className={i === 0 ? "on" : ""}>
                        <Slot size={12} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </aside>
                <div className="dash-main">
                  <p className="dash-greet">Good morning, Ahmed 👋</p>
                  <div className="dash-stats">
                    <div className="stat">
                      <span className="stat-ic tone-blue">
                        <Slot size={13} />
                      </span>
                      <span>
                        <b>12</b>
                        <small>Total</small>
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-ic tone-orange">
                        <Slot size={13} />
                      </span>
                      <span>
                        <b>3</b>
                        <small>Pending</small>
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-ic tone-green">
                        <Slot size={13} />
                      </span>
                      <span>
                        <b>8</b>
                        <small>Resolved</small>
                      </span>
                    </div>
                  </div>
                  <div className="dash-recent">
                    <div className="dash-recent-head">
                      <h4>Recent Issues</h4>
                      <span className="view-all">
                        View all <img src={rightarrow} alt="" />
                      </span>
                    </div>
                    {ISSUES.map((issue) => (
                      <div className="issue" key={issue.title}>
                        <span className="avatar-sm" />
                        <span className="issue-info">
                          <b>{issue.title}</b>
                          <small>{issue.meta}</small>
                        </span>
                        <span className={`badge b-${issue.tone}`}>
                          {issue.priority}
                        </span>
                        <span className={`st st-${issue.stone}`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ai-card">
                <p className="ai-head">
                  <Slot size={13} /> AI Assistant
                </p>
                <p className="ai-sub">We've organized your issue!</p>
                <div className="ai-row">
                  <span className="ai-ic tone-blue" />
                  <span>
                    <small>Category</small>
                    <b>IT / Hardware</b>
                  </span>
                </div>
                <div className="ai-row">
                  <span className="ai-ic tone-orange" />
                  <span>
                    <small>Priority</small>
                    <b>Medium</b>
                  </span>
                </div>
                <div className="ai-row">
                  <span className="ai-ic tone-indigo" />
                  <span>
                    <small>Location</small>
                    <b>Computer Lab 3</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- features ---------- */}
        <section className="section tint" id="features">
          <div className="container">
            <div className="sec-head">
              <span className="pill">Why CampusFix?</span>
              <h2>More than just a complaint box</h2>
              <p>
                CampusFix uses smart technology and a streamlined process to get
                things fixed — faster.
              </p>
            </div>
            <div className="features-grid">
              {FEATURES.map(({ icon, tone, title, text }) => (
                <article className="feature" key={title}>
                  <span className={`feature-ic tone-${tone}`}>
                    <Slot src={icon} size={26} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="sec-head">
              <span className="pill">How It Works</span>
              <h2>Simple steps. Real solutions.</h2>
              <p>
                From reporting to resolution, CampusFix makes the process easy
                and transparent.
              </p>
            </div>
            <div className="steps">
              {STEPS.map((step, i) => (
                <Fragment key={step.n}>
                  {i > 0 && (
                    <img className="step-arrow" src={rightarrow} alt="" />
                  )}
                  <div className="step">
                    <span className="step-ic">
                      <Slot src={step.icon} size={26} />
                    </span>
                    <span className="step-n">{step.n}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- services ---------- */}
        <section className="section tint" id="services">
          <div className="container">
            <div className="sec-head">
              <span className="pill">Our Services</span>
              <h2>More ways to improve campus life</h2>
              <p>
                CampusFix isn't just for issues — it also helps you find what
                you've lost.
              </p>
            </div>
            <div className="services-grid">
              {SERVICES.map(({ title, text }) => (
                <article className="service" key={title}>
                  {/* TODO: illustration — add artwork to src/assets and render it here */}
                  <div className="service-art" />
                  <div className="service-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <a className="learn" href="#how-it-works">
                      Learn More <img src={rightarrow} alt="" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- impact ---------- */}
        <section className="section" id="impact">
          <div className="container">
            <div className="sec-head">
              <span className="pill">Our Impact</span>
              <h2>Building a better campus, together</h2>
            </div>
            <div className="impact-grid">
              {IMPACT.map(({ icon, stat, title, text }) => (
                <div className="impact" key={title}>
                  <span className="impact-ic">
                    <Slot src={icon} size={26} />
                  </span>
                  {stat && <p className="impact-stat">{stat}</p>}
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- cta banner ---------- */}
        <section className="cta-wrap">
          <div className="container">
            <div className="cta">
              <div>
                <h2>Ready to make your campus better?</h2>
                <p>Join CampusFix today and be part of the change.</p>
              </div>
              <Link to="/signup" className="btn btn-white">
                Get Started{" "}
                <img className="btn-arrow" src={rightarrow} alt="" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="CampusFix" />
            <p>Fix campus problems. Together.</p>
          </div>
          <nav className="footer-links">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="footer-right">
            <div className="socials">
              {SOCIALS.map((name) => (
                <a key={name} href="#" aria-label={name}>
                  <Slot size={18} /> {/* TODO: social icon */}
                </a>
              ))}
            </div>
            <p className="copyright">© 2026 CampusFix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

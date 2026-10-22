// static demo data shared by every dashboard tab — swap for API calls later

export const USER = {
  name: "Abdul Hanan",
  role: "Student",
  dept: "Computer Science",
  email: "abdul.hanan@uni.edu",
  studentId: "F2021-1042",
};

// the 4 greeting stat cards — icon keys map to the blue icon set in dashboard.jsx
export const ISSUE_STATS = [
  { label: "Total Issues", value: 12, icon: "report", delta: 2, up: true },
  { label: "Pending", value: 3, icon: "clock", delta: 1, up: false },
  { label: "Resolved", value: 8, icon: "tick", delta: 3, up: true },
  { label: "In Progress", value: 1, icon: "hub", delta: 1, up: false },
];

export const ISSUES = [
  {
    id: "1042",
    title: "Projector not working in Lab 3",
    location: "Lab 3",
    dept: "IT Department",
    category: "IT",
    priority: "High",
    status: "In Progress",
    ago: "2 hours ago",
    thumbTone: "indigo",
    photos: 2,
    desc: "The projector in Lab 3 is not displaying anything despite multiple restart attempts. The power light is on, but there is no image on the screen. This is affecting our classes and needs to be fixed as soon as possible.",
  },
  {
    id: "1041",
    title: "Water cooler leaking",
    location: "CS Department",
    dept: "Maintenance",
    category: "Maintenance",
    priority: "Medium",
    status: "Open",
    ago: "5 hours ago",
    thumbTone: "blue",
    photos: 1,
    desc: "The water cooler outside the CS department is leaking from the bottom. The floor gets wet and slippery, which is unsafe for students walking by.",
  },
  {
    id: "1039",
    title: "Broken chair",
    location: "Room 204",
    dept: "Maintenance",
    category: "Maintenance",
    priority: "Low",
    status: "Assigned",
    ago: "1 day ago",
    thumbTone: "orange",
    photos: 1,
    desc: "One of the chairs in Room 204 has a broken leg and can't be used. Someone could get hurt if they sit on it without noticing.",
  },
  {
    id: "1036",
    title: "Wi-Fi not working",
    location: "Library",
    dept: "IT Department",
    category: "IT",
    priority: "Medium",
    status: "In Progress",
    ago: "1 day ago",
    thumbTone: "violet",
    photos: 0,
    desc: "The Wi-Fi in the library keeps disconnecting every few minutes. It makes it hard to attend online lectures or submit assignments from there.",
  },
  {
    id: "1031",
    title: "Lights not working",
    location: "Block C",
    dept: "Electrical",
    category: "Electrical",
    priority: "Low",
    status: "Resolved",
    ago: "2 days ago",
    thumbTone: "green",
    photos: 1,
    desc: "Half of the tube lights in the Block C corridor are out, making it very dark in the evenings after prayer timings.",
  },
  {
    id: "1028",
    title: "Restroom unclean",
    location: "Block A",
    dept: "Cleanliness",
    category: "Cleanliness",
    priority: "Medium",
    status: "Open",
    ago: "2 days ago",
    thumbTone: "pink",
    photos: 0,
    desc: "The restroom on the ground floor of Block A has not been cleaned since morning. It smells bad and there is no soap in the dispenser.",
  },
];

export const TIMELINE = [
  {
    title: "Issue reported",
    text: "You reported this issue with photos and description.",
    ago: "2 hours ago",
    state: "done",
  },
  {
    title: "AI categorized",
    text: "Issue was analyzed and categorized as IT / Hardware.",
    ago: "2 hours ago",
    state: "done",
  },
  {
    title: "Assigned to IT Department",
    text: "Issue has been assigned to the IT Department.",
    ago: "1 hour ago",
    state: "done",
  },
  {
    title: "Technician started working",
    text: "The technician has started working on this issue.",
    ago: "30 minutes ago",
    state: "current",
  },
  {
    title: "Waiting for resolution",
    text: "Awaiting final update from the technician.",
    ago: "--",
    state: "todo",
  },
];

export const COMMENTS = [
  {
    by: "You",
    text: "The projector is completely not working. I tried restarting it multiple times but it still doesn't turn on.",
    ago: "2 hours ago",
    tone: "indigo",
  },
  {
    by: "IT Staff",
    text: "We have assigned this issue to the IT team. They will check it shortly.",
    ago: "1 hour ago",
    tone: "violet",
  },
  {
    by: "Technician",
    text: "I'm on my way to check the projector. Will update once I find the issue.",
    ago: "30 minutes ago",
    tone: "green",
  },
];

export const NOTIFICATIONS = [
  {
    tone: "green",
    glyph: "✓",
    title: "Your issue #1042 has been assigned",
    ago: "2 hours ago",
    unread: true,
  },
  {
    tone: "blue",
    glyph: "i",
    title: "Status updated: Water cooler leaking",
    ago: "5 hours ago",
    unread: true,
  },
  {
    tone: "violet",
    glyph: "✦",
    title: "AI has analyzed your new issue",
    ago: "1 day ago",
    unread: false,
  },
  {
    tone: "amber",
    glyph: "!",
    title: "New announcement from university",
    ago: "2 days ago",
    unread: false,
  },
];

export const LOST_STATS = [
  { value: 3, label: "Lost Items", tone: "red" },
  { value: 4, label: "Found Items", tone: "green" },
  { value: 1, label: "Matched Items", tone: "indigo" },
  { value: 2, label: "Returned Items", tone: "blue" },
];

export const LOST_ITEMS = [
  {
    title: "Black Wallet",
    kind: "Lost",
    cat: "Personal",
    desc: "Black leather wallet with a student card inside. Has some cash and ID card.",
    location: "Cafeteria",
    date: "Sep 17, 2025",
    match: "High",
  },
  {
    title: "Water Bottle",
    kind: "Found",
    cat: "Personal",
    desc: "Found near the library entrance. Blue water bottle with a white cap.",
    location: "Library",
    date: "Sep 18, 2025",
    match: null,
  },
  {
    title: "Student ID Card",
    kind: "Found",
    cat: "Academic",
    desc: "Found in the main block, near the stairs. Looks like a university ID card.",
    location: "Main Block",
    date: "Sep 16, 2025",
    match: null,
  },
  {
    title: "Calculator",
    kind: "Lost",
    cat: "Academic",
    desc: "Scientific calculator (Casio). Last seen in the classroom (CS-101).",
    location: "CS Department",
    date: "Sep 15, 2025",
    match: "Medium",
  },
  {
    title: "Earbuds",
    kind: "Found",
    cat: "Electronics",
    desc: "Found near the sports complex. White wireless earbuds (no brand visible).",
    location: "Sports Complex",
    date: "Sep 14, 2025",
    match: null,
  },
  {
    title: "Backpack",
    kind: "Lost",
    cat: "Personal",
    desc: "Black backpack with laptop compartment. Last seen in the library.",
    location: "Library",
    date: "Sep 13, 2025",
    match: "1 potential match",
  },
];

export const LOST_STEPS = [
  "Post your lost or found item with details and photos (optional).",
  "Our AI helps categorize and find potential matches.",
  "If there's a match, you'll be notified and can verify the item.",
  "Arrange a safe handover and get your item back!",
];

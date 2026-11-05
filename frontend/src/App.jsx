import { Route, Routes, useParams } from 'react-router-dom'
import { storedUser } from './Api'
import HomePage from './pages/Homepage'
import LoginSignup from './pages/LoginSignup'
import DashboardLayout from './pages/Dashboard'
import StudentDashboard from './pages/StudentDashboard'
import StaffDashboard from './pages/StaffDashboard'
import ReportIssue from './pages/ReportIssue'
import MyIssues from './pages/MyIssues'
import IssueDetail from './pages/IssueDetail'
import LostFound from './pages/LostFound'
import PostItem from './pages/PostItem'
import ItemDetail from './pages/ItemDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

// students land on their personal overview; staff/admin land on the work
// overview (all issues + lost & found at a glance)
function RoleHome() {
  const role = storedUser()?.role || 'student'
  return role === 'student' ? <StudentDashboard /> : <StaffDashboard />
}

// keyed by id so navigating issue→issue remounts the page with fresh state
function IssueDetailPage() {
  const { id } = useParams()
  return <IssueDetail key={id} id={id} />
}

function ItemDetailPage() {
  const { id } = useParams()
  return <ItemDetail key={id} id={id} />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginSignup key="login" initialMode="login" />} />
      <Route path="/signup" element={<LoginSignup key="signup" initialMode="signup" />} />
      {/* one jsx file per dashboard tab, shared shell, nested routing */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<RoleHome />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="my-issues" element={<MyIssues />} />
        <Route path="my-issues/:id" element={<IssueDetailPage />} />
        <Route path="lost-found" element={<LostFound />} />
        <Route path="lost-found/new" element={<PostItem />} />
        <Route path="lost-found/:id" element={<ItemDetailPage />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="admin" element={<Admin />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}

export default App

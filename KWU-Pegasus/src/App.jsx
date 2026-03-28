import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import styles from './styles/App.module.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './layouts/Header'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Unauthorized from './pages/Unauthorized'
import Schedule from './pages/Schedule'
import Roster from './pages/Roster'
import Notice from './pages/notice/Notice'
import NoticeDetail from './pages/notice/NoticeDetail'
import Board from './pages/board/Board'
import BoardDetail from './pages/board/BoardDetail'
import NoticeWrite from './pages/notice/NoticeWrite'
import BoardWrite from './pages/board/BoardWrite'
import Admin from './pages/Admin'
import MyPage from './pages/MyPage'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (requiredRoles && !requiredRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <div className={styles.appRoot}>
        <Header />
        <div className={styles.contentContainer}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="/notice/write" element={
              <ProtectedRoute requiredRoles={['manager', 'staff', 'root']}>
                <NoticeWrite />
              </ProtectedRoute>
            } />
            <Route path="/board/write" element={
              <ProtectedRoute requiredRoles={['member', 'manager', 'staff', 'root']}>
                <BoardWrite />
              </ProtectedRoute>
            } />
            <Route path="/mypage" element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['manager', 'staff', 'root']}>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App

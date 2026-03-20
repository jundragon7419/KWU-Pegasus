import { BrowserRouter, Routes, Route } from 'react-router-dom'
import styles from './styles/App.module.css'
import Header from './layouts/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Unauthorized from './pages/Unauthorized'
import Schedule from './pages/Schedule'
import Roster from './pages/Roster'
import Notice from './pages/Notice'
import NoticeDetail from './pages/NoticeDetail'
import Board from './pages/Board'
import BoardDetail from './pages/BoardDetail'
import NoticeWrite from './pages/NoticeWrite'
import BoardWrite from './pages/BoardWrite'
import NotFound from './pages/NotFound'

function App() {
  return (
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
            <Route path="/notice/write" element={<NoticeWrite />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/board" element={<Board />} />
            <Route path="/board/write" element={<BoardWrite />} />
            <Route path="/board/:id" element={<BoardDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App

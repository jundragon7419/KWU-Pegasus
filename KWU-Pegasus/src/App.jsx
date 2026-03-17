import styles from './styles/App.module.css'
import Header from './layouts/Header'
import Home from './pages/Home'

function App() {
  return (
    <div className={styles.appRoot}>
      <Header />
      <Home />
    </div>
  )
}

export default App

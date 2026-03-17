import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src="/kwu-pegasus.svg" alt="KWU Pegasus" className={styles.logoImage} />
        <span className={styles.logo}>KWU Pegasus</span>
      </div>

      <nav className={styles.center}>
        <a className={styles.navItem} href="#">Home</a>
        <a className={styles.navItem} href="#">About</a>
        <a className={styles.navItem} href="#">Docs</a>
      </nav>

      <div className={styles.right}>
        <button className={styles.loginButton}>로그인</button>
      </div>
    </header>
  )
}

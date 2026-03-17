import styles from './Home.module.css'

export default function Home() {
  return (
    <section className={styles.home}>
      <h2 className={styles.title}>홈 화면 더미 페이지</h2>
      <p className={styles.description}>
        이곳이 홈 화면입니다. 나중에 실제 콘텐츠와 컴포넌트를 추가해주세요.
      </p>
    </section>
  )
}

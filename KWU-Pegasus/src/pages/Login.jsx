import { useState } from 'react'
import styles from './Login.module.css'

export default function Login() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: 로그인 로직
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">아이디</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="아이디를 입력하세요"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <label className={styles.checkboxLabel}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={autoLogin}
              onChange={e => setAutoLogin(e.target.checked)}
            />
            자동 로그인
          </label>

          <button className={styles.submitButton} type="submit">로그인</button>
        </form>
      </div>
    </div>
  )
}

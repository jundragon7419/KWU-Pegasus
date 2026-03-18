import { useState } from 'react'
import styles from './Signup.module.css'

export default function Signup() {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [role, setRole] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: 회원가입 로직
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="id">아이디</label>
            <input
              id="id"
              className={styles.input}
              type="text"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={e => setId(e.target.value)}
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
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="passwordConfirm">비밀번호 재입력</label>
            <input
              id="passwordConfirm"
              className={`${styles.input} ${passwordConfirm && password !== passwordConfirm ? styles.inputError : ''}`}
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {passwordConfirm && password !== passwordConfirm && (
              <span className={styles.errorText}>비밀번호가 일치하지 않습니다.</span>
            )}
          </div>

          <div className={styles.field}>
            <span className={styles.label}>구분</span>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioLabel} ${role === 'OB' ? styles.radioSelected : ''}`}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="role"
                  value="OB"
                  checked={role === 'OB'}
                  onChange={e => setRole(e.target.value)}
                />
                OB
              </label>
              <label className={`${styles.radioLabel} ${role === 'YB' ? styles.radioSelected : ''}`}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="role"
                  value="YB"
                  checked={role === 'YB'}
                  onChange={e => setRole(e.target.value)}
                />
                YB
              </label>
            </div>
          </div>

          <button className={styles.submitButton} type="submit">회원가입</button>
        </form>
      </div>
    </div>
  )
}

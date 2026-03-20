import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, onPageChange }) {
  const half = 2
  let start = Math.max(1, page - half)
  const end = Math.min(totalPages, start + 4)
  start = Math.max(1, end - 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className={styles.pagination}>
      <button className={styles.pageArrow} onClick={() => onPageChange(Math.max(1, page - 5))} disabled={page === 1}>{'«'}</button>
      <button className={styles.pageArrow} onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>{'‹'}</button>
      {pages.map(p => (
        <button
          key={p}
          className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button className={styles.pageArrow} onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>{'›'}</button>
      <button className={styles.pageArrow} onClick={() => onPageChange(Math.min(totalPages, page + 5))} disabled={page === totalPages}>{'»'}</button>
    </div>
  )
}

import styles from './VoterModal.module.css'

export default function VoterModal({ option, voters, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            "{option.text}" 투표자 ({voters.length}명)
          </h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.voterList}>
          {voters.length === 0 ? (
            <p className={styles.empty}>투표자가 없습니다.</p>
          ) : (
            voters.map((voter, index) => (
              <div key={index} className={styles.voterItem}>
                <span className={styles.voterName}>{voter}</span>
                <span className={styles.voterNumber}>#{index + 1}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

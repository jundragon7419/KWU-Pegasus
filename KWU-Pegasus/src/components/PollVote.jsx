import { useState } from 'react'
import VoterModal from './VoterModal'
import styles from './PollVote.module.css'

export default function PollVote({ poll, onVote, user }) {
  const [selectedOptions, setSelectedOptions] = useState(
    poll.userVotes.length > 0 ? poll.userVotes : []
  )
  const [voting, setVoting] = useState(false)
  const [selectedVotersOption, setSelectedVotersOption] = useState(null)

  function handleOptionClick(optionId) {
    if (poll.poll.isMultiple) {
      // 다중선택: 토글
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      // 단일선택
      setSelectedOptions([optionId])
    }
  }

  async function handleSubmit() {
    if (selectedOptions.length === 0) {
      alert('옵션을 선택하세요.')
      return
    }
    setVoting(true)
    await onVote(selectedOptions)
    setVoting(false)
  }

  const hasVoted = poll.userVotes.length > 0
  const canVote = user && onVote

  // 투표 설정 텍스트 생성
  const pollSettings = []
  if (poll.poll.isMultiple) pollSettings.push('다중선택')
  if (poll.poll.isAnonymous) pollSettings.push('익명투표')
  if (poll.poll.isPrivate) pollSettings.push('비공개')
  const settingsText = pollSettings.length > 0 ? pollSettings.join(' / ') : ''

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.pollTitle}>{poll.poll.title}</h3>
        {settingsText && <span className={styles.settings}>{settingsText}</span>}
      </div>
      <div className={styles.options}>
        {poll.options.map(option => (
          <div
            key={option.id}
            className={`${styles.option} ${
              selectedOptions.includes(option.id) ? styles.selected : ''
            }`}
          >
            <div className={styles.optionContent}>
              <div className={styles.optionHeader}>
                {canVote ? (
                  <label className={styles.optionLabel}>
                    <input
                      type={poll.poll.isMultiple ? 'checkbox' : 'radio'}
                      name="poll-option"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionClick(option.id)}
                      disabled={voting}
                    />
                    <span className={styles.optionText}>{option.text}</span>
                  </label>
                ) : (
                  <span className={styles.optionText}>{option.text}</span>
                )}
              </div>

              <div className={styles.pollBar}>
                {poll.canSeeResults && option.percentage !== null && (
                  <div
                    className={styles.pollFill}
                    style={{ width: `${option.percentage}%` }}
                  />
                )}
                {poll.canSeeResults && option.votes !== null ? (
                  <span className={styles.pollPercentage}>
                    {option.votes} ({option.percentage}%)
                  </span>
                ) : (
                  <span className={styles.pollPercentage}>비공개</span>
                )}
              </div>

              {/* 투표자 확인 버튼 (기명 투표 + 권한이 있을 때만) */}
              {!poll.poll.isAnonymous && option.voters.length > 0 && (
                <button
                  type="button"
                  className={styles.votersButton}
                  onClick={() => setSelectedVotersOption(option)}
                >
                  투표자 확인 ({option.voters.length}명)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.totalVotes}>
          {poll.canSeeResults && poll.totalVotes !== null ? `총 ${poll.totalVotes}표` : '비공개'}
        </span>
        {canVote && (
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={voting || selectedOptions.length === 0}
          >
            {voting ? (hasVoted ? '투표 변경 중…' : '투표 중…') : (hasVoted ? '투표 변경하기' : '투표하기')}
          </button>
        )}
      </div>

      {/* 투표자 모달 */}
      {selectedVotersOption && (
        <VoterModal
          option={selectedVotersOption}
          onClose={() => setSelectedVotersOption(null)}
        />
      )}
    </div>
  )
}

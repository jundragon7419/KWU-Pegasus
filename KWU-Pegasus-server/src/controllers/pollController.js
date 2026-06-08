const pool = require('../db')

// 게시글 ID로 투표 조회
exports.getPollByPostId = async (req, res, next) => {
  try {
    const { postId } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // 투표 정보 조회
    const [pollRows] = await pool.query(
      'SELECT * FROM polls WHERE post_id = ?',
      [postId]
    )
    if (pollRows.length === 0) {
      return res.status(404).json({ message: '투표를 찾을 수 없습니다.' })
    }

    const poll = pollRows[0]

    // 게시글 작성자 확인
    const [postRows] = await pool.query(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    )
    const postAuthorId = postRows[0]?.user_id

    // 결과 공개 여부 결정 (비공개는 작성자/root만 결과 공개)
    const canSeeResults = !poll.is_private || userId === postAuthorId || userRole === 'root' || userRole === 'staff'

    // 투표 옵션 조회
    const [options] = await pool.query(
      'SELECT id, option_text, vote_count FROM poll_options WHERE poll_id = ?',
      [poll.id]
    )

    // 총 투표 수
    const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0)

    // 현재 사용자의 투표 여부
    let userVotes = []
    if (userId) {
      const [votes] = await pool.query(
        'SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?',
        [poll.id, userId]
      )
      userVotes = votes.map(v => v.option_id)
    }

    // 투표자 정보 (기명 투표인 경우만 조회 - 비공개는 작성자/관리자만)
    let voters = {}
    const canSeeVoters = !poll.is_anonymous && (!poll.is_private || userId === postAuthorId || userRole === 'root' || userRole === 'staff')
    if (canSeeVoters) {
      const [voteRecords] = await pool.query(
        `SELECT pv.option_id, u.username, u.name
         FROM poll_votes pv
         LEFT JOIN users u ON pv.user_id = u.id
         WHERE pv.poll_id = ?`,
        [poll.id]
      )
      voters = voteRecords.reduce((acc, record) => {
        if (!acc[record.option_id]) {
          acc[record.option_id] = []
        }
        if (record.username) {
          const voterDisplay = record.name ? `${record.username}(${record.name})` : record.username
          acc[record.option_id].push(voterDisplay)
        }
        return acc
      }, {})
    }

    res.json({
      poll: {
        id: poll.id,
        title: poll.title,
        isMultiple: poll.is_multiple === 1,
        isAnonymous: poll.is_anonymous === 1,
        isPrivate: poll.is_private === 1,
      },
      options: options.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        votes: canSeeResults ? opt.vote_count : null,
        percentage: canSeeResults ? (totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0) : null,
        voters: voters[opt.id] || [],
      })),
      totalVotes: canSeeResults ? totalVotes : null,
      userVotes,
      canSeeResults,
    })
  } catch (err) {
    next(err)
  }
}

// 투표 조회
exports.getPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params
    const userId = req.user?.id
    const userRole = req.user?.role

    // 투표 정보 조회
    const [pollRows] = await pool.query(
      'SELECT * FROM polls WHERE id = ?',
      [pollId]
    )
    if (pollRows.length === 0) {
      return res.status(404).json({ message: '투표를 찾을 수 없습니다.' })
    }

    const poll = pollRows[0]
    const postId = poll.post_id

    // 게시글 작성자 확인
    const [postRows] = await pool.query(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    )
    const postAuthorId = postRows[0]?.user_id

    // 결과 공개 여부 결정 (비공개는 작성자/root만 결과 공개)
    const canSeeResults = !poll.is_private || userId === postAuthorId || userRole === 'root' || userRole === 'staff'

    // 투표 옵션 조회
    const [options] = await pool.query(
      'SELECT id, option_text, vote_count FROM poll_options WHERE poll_id = ?',
      [pollId]
    )

    // 총 투표 수
    const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0)

    // 현재 사용자의 투표 여부
    let userVotes = []
    if (userId) {
      const [votes] = await pool.query(
        'SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?',
        [pollId, userId]
      )
      userVotes = votes.map(v => v.option_id)
    }

    // 투표자 정보 (기명 투표인 경우만 조회 - 비공개는 작성자/관리자만)
    let voters = {}
    const canSeeVoters = !poll.is_anonymous && (!poll.is_private || userId === postAuthorId || userRole === 'root' || userRole === 'staff')
    if (canSeeVoters) {
      const [voteRecords] = await pool.query(
        `SELECT pv.option_id, u.username, u.name
         FROM poll_votes pv
         LEFT JOIN users u ON pv.user_id = u.id
         WHERE pv.poll_id = ?`,
        [pollId]
      )
      voters = voteRecords.reduce((acc, record) => {
        if (!acc[record.option_id]) {
          acc[record.option_id] = []
        }
        if (record.username) {
          const voterDisplay = record.name ? `${record.username}(${record.name})` : record.username
          acc[record.option_id].push(voterDisplay)
        }
        return acc
      }, {})
    }

    res.json({
      poll: {
        id: poll.id,
        title: poll.title,
        isMultiple: poll.is_multiple === 1,
        isAnonymous: poll.is_anonymous === 1,
        isPrivate: poll.is_private === 1,
      },
      options: options.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        votes: canSeeResults ? opt.vote_count : null,
        percentage: canSeeResults ? (totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0) : null,
        voters: voters[opt.id] || [],
      })),
      totalVotes: canSeeResults ? totalVotes : null,
      userVotes,
      canSeeResults,
    })
  } catch (err) {
    next(err)
  }
}

// 투표 제출
exports.submitVote = async (req, res, next) => {
  try {
    const { pollId } = req.params
    const { optionIds } = req.body
    const userId = req.user?.id

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ message: '선택한 옵션이 없습니다.' })
    }

    // 투표 정보 조회
    const [pollRows] = await pool.query(
      'SELECT * FROM polls WHERE id = ?',
      [pollId]
    )
    if (pollRows.length === 0) {
      return res.status(404).json({ message: '투표를 찾을 수 없습니다.' })
    }

    const poll = pollRows[0]

    // 단일선택인 경우 1개만 선택 가능
    if (poll.is_multiple === 0 && optionIds.length > 1) {
      return res.status(400).json({ message: '단일선택 투표는 1개만 선택 가능합니다.' })
    }

    // 옵션 존재 확인
    const [options] = await pool.query(
      'SELECT id FROM poll_options WHERE poll_id = ? AND id IN (?)',
      [pollId, optionIds]
    )
    if (options.length !== optionIds.length) {
      return res.status(400).json({ message: '유효하지 않은 옵션입니다.' })
    }

    // 기존 투표 삭제 (변경 가능하도록) - 항상 userId를 저장하므로 익명/기명 구분 없이 처리
    const [existingVotes] = await pool.query(
      'SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?',
      [pollId, userId]
    )

    // 기존 투표 삭제
    if (existingVotes.length > 0) {
      for (const vote of existingVotes) {
        await pool.query(
          'UPDATE poll_options SET vote_count = vote_count - 1 WHERE id = ?',
          [vote.option_id]
        )
      }
      await pool.query(
        'DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?',
        [pollId, userId]
      )
    }

    // 새로운 투표 저장 (익명/기명 여부와 관계없이 userId를 저장)
    for (const optionId of optionIds) {
      await pool.query(
        'INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES (?, ?, ?)',
        [pollId, userId, optionId]
      )
      // 투표 수 증가
      await pool.query(
        'UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?',
        [optionId]
      )
    }

    res.json({ message: '투표가 저장되었습니다.' })
  } catch (err) {
    next(err)
  }
}

// 투표 삭제 (게시글 삭제 시 자동 처리되므로 수동 호출 불필요)
exports.deletePoll = async (req, res, next) => {
  try {
    const { pollId } = req.params
    const userId = req.user?.id

    // 투표 정보 조회
    const [pollRows] = await pool.query(
      'SELECT post_id FROM polls WHERE id = ?',
      [pollId]
    )
    if (pollRows.length === 0) {
      return res.status(404).json({ message: '투표를 찾을 수 없습니다.' })
    }

    // 게시글 작성자 확인
    const [postRows] = await pool.query(
      'SELECT user_id FROM posts WHERE id = ?',
      [pollRows[0].post_id]
    )
    if (postRows[0].user_id !== userId) {
      return res.status(403).json({ message: '권한이 없습니다.' })
    }

    // 투표 삭제
    await pool.query('DELETE FROM polls WHERE id = ?', [pollId])

    res.json({ message: '투표가 삭제되었습니다.' })
  } catch (err) {
    next(err)
  }
}

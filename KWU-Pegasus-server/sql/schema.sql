-- ================================================================
-- KWU PEGASUS DATABASE SCHEMA
-- ================================================================

CREATE DATABASE IF NOT EXISTS kwu_pegasus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kwu_pegasus;

-- ── 유저 ────────────────────────────────────────────────────────
-- role:              user | player | manager | staff | root
-- staff_type:        president(회장) | coach(감독) — staff일 때만 사용
-- membership_status: none(미신청) | pending(신청중) | approved(승인) | rejected(거부)
CREATE TABLE IF NOT EXISTS users (
  id                INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username          VARCHAR(50)   NOT NULL UNIQUE,
  password          VARCHAR(255)  NOT NULL,
  email             VARCHAR(100)  NOT NULL UNIQUE,
  name              VARCHAR(50)   NULL DEFAULT NULL,
  student_id        CHAR(10)      NULL DEFAULT NULL UNIQUE,
  ob_yb             ENUM('ob','yb') NULL DEFAULT NULL,
  role              ENUM('user','player','manager','staff','root') NOT NULL DEFAULT 'user',
  staff_type        ENUM('president','coach') DEFAULT NULL,
  membership_status ENUM('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 로스터 ──────────────────────────────────────────────────────
-- role: coach(감독) | president(회장) | player(선수)
-- user_id: 로스터 신청 승인 시 연결
CREATE TABLE IF NOT EXISTS roster (
  year     INT          NOT NULL,
  number   INT          NOT NULL,
  name     VARCHAR(50)  NOT NULL,
  role     ENUM('coach','president','player') NOT NULL DEFAULT 'player',
  user_id  INT          NULL DEFAULT NULL,
  PRIMARY KEY (year, number)
);

-- ── 영구결번 ─────────────────────────────────────────────────────
-- 연도 무관하게 관리자가 직접 등록/삭제
CREATE TABLE IF NOT EXISTS retired_numbers (
  number   INT          NOT NULL PRIMARY KEY,
  name     VARCHAR(50)  NOT NULL
);

-- ── 로스터 신청 ─────────────────────────────────────────────────
-- 멤버 승인 후 해당 연도 로스터 등재 신청
-- 관리자가 승인 시 등번호 지정 → roster 테이블에 삽입
CREATE TABLE IF NOT EXISTS roster_requests (
  id         INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    INT      NOT NULL,
  year       INT      NOT NULL,
  status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roster_req (user_id, year),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── 설정 (활성 로스터 연도 등) ────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  `key`    VARCHAR(50)  NOT NULL PRIMARY KEY,
  `value`  VARCHAR(100) NOT NULL
);

-- ── 게시판 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL
);

-- ── 공지사항 ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category   ENUM('notice','event','game') NOT NULL DEFAULT 'notice',
  is_pinned  TINYINT(1)   NOT NULL DEFAULT 0,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(50)  NOT NULL,
  date       DATE         NOT NULL,
  views      INT          NOT NULL DEFAULT 0,
  content    TEXT         NOT NULL
);

-- ── 팀 일정 ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year   INT          NOT NULL,
  month  INT          NOT NULL,
  day    INT          NOT NULL,
  type   ENUM('game','training','meeting','anniversary') NOT NULL,
  name   VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_event (year, month, day, name)
);

-- ── 공휴일 ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS holidays (
  id       INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  year     INT          NOT NULL,
  month    INT          NOT NULL,
  day      INT          NOT NULL,
  type     VARCHAR(20)  NOT NULL DEFAULT 'holiday',
  name     VARCHAR(100) NOT NULL,
  is_fixed TINYINT(1)   NOT NULL DEFAULT 0
);

-- ================================================================
-- SEED DATA
-- ================================================================

-- ── 설정 ────────────────────────────────────────────────────────
INSERT IGNORE INTO settings (`key`, `value`) VALUES ('active_roster_year', '2026');

-- ── 로스터 ──────────────────────────────────────────────────────
INSERT IGNORE INTO roster (year, number, name, role, user_id) VALUES
(2026,0,'김승원','player',NULL),(2026,1,'김규민','player',NULL),(2026,2,'박재민','player',NULL),
(2026,3,'방현빈','player',NULL),(2026,4,'이종현','player',NULL),(2026,5,'송원준','player',NULL),
(2026,6,'이재현','player',NULL),(2026,7,'장우진','player',NULL),(2026,8,'한종원','player',NULL),
(2026,9,'정현수','player',NULL),(2026,10,'강상현','player',NULL),(2026,11,'심동현','coach',NULL),
(2026,12,'유지현','player',NULL),(2026,13,'이찬영','player',NULL),(2026,14,'박기훈','player',NULL),
(2026,15,'윤주강','player',NULL),(2026,16,'김민석','player',NULL),(2026,17,'최민기','player',NULL),
(2026,18,'김기민','president',NULL),(2026,19,'안지언','player',NULL),(2026,20,'이준용','player',NULL),
(2026,21,'김주헌','player',NULL),(2026,22,'이희승','player',NULL),(2026,23,'배성우','player',NULL),
(2026,24,'김건희','player',NULL),(2026,27,'박종현','player',NULL),(2026,28,'신찬혁','player',NULL),
(2026,29,'이우성','player',NULL),(2026,32,'배윤재','player',NULL),(2026,33,'오진택','player',NULL),
(2026,34,'정선우','player',NULL),(2026,35,'이가온','player',NULL),(2026,36,'한규혁','player',NULL),
(2026,37,'이승주','player',NULL),(2026,38,'이운하','player',NULL),(2026,39,'신현재','player',NULL),
(2026,41,'임세훈','player',NULL),(2026,43,'최승민','player',NULL),
(2026,44,'권민수','player',NULL),(2026,45,'신호정','player',NULL),(2026,46,'장현호','player',NULL),
(2026,47,'김지환','player',NULL),(2026,49,'이송주','player',NULL),(2026,50,'김성현','player',NULL),
(2026,51,'박찬진','player',NULL),(2026,52,'유주찬','player',NULL),(2026,53,'한윤호','player',NULL),
(2026,54,'정성훈','player',NULL),(2026,55,'정민재','player',NULL),(2026,56,'이제영','player',NULL),
(2026,57,'최재원','player',NULL),(2026,58,'지건희','player',NULL),(2026,59,'신주환','player',NULL),
(2026,60,'임준규','player',NULL),(2026,61,'장현우','player',NULL),(2026,63,'이지용','player',NULL),
(2026,64,'양민우','player',NULL),(2026,66,'원정빈','player',NULL),(2026,68,'안현규','player',NULL),
(2026,71,'심부근','player',NULL),(2026,79,'안선우','player',NULL),(2026,92,'유재혁','player',NULL),
(2026,93,'한희성','player',NULL),(2026,95,'정우인','player',NULL),(2026,98,'최강민','player',NULL);

-- ── 영구결번 ─────────────────────────────────────────────────────
INSERT IGNORE INTO retired_numbers (number, name) VALUES
(42, '김종선');

-- ── 게시판 ──────────────────────────────────────────────────────
INSERT IGNORE INTO posts (title, author, date, views, content) VALUES
('2026 시즌 첫 훈련 후기', '김승원', '2026-03-02', 142, '오늘 시즌 첫 훈련이 있었습니다. 다들 겨울 동안 체력을 잘 키워왔는지 컨디션이 좋아 보였습니다. 올 시즌도 열심히 해봅시다!'),
('지난 주 연습 경기 총평', '심동현', '2026-03-08', 98, '지난 주 연습 경기에서 아쉬운 부분들이 있었습니다. 수비 위치 선정과 타격 타이밍을 집중적으로 보완해야 할 것 같습니다.'),
('새 유니폼 어떤가요?', '김기민', '2026-03-10', 215, '이번 시즌 새로 맞춘 유니폼 다들 받으셨죠? 착용감이나 디자인에 대한 의견 자유롭게 남겨주세요.'),
('훈련 자유 참여 안내', '김기민', '2026-03-12', 77, '이번 주 목요일 훈련은 자유 참여입니다. 참석 가능한 분들은 오후 4시까지 운동장으로 와주세요.'),
('스트레칭 중요성에 대해', '이찬영', '2026-03-15', 63, '부상 방지를 위해 훈련 전후 스트레칭을 꼭 챙겨주세요. 특히 어깨와 허리 스트레칭을 꼼꼼히 해주시면 좋겠습니다.'),
('3월 첫 공식전 준비 현황', '심동현', '2026-03-17', 189, '다음 달 첫 공식전을 앞두고 포지션 배치를 확정했습니다. 각자 역할에 맞게 집중 훈련 부탁드립니다.'),
('운동장 사용 일정 공유', '김기민', '2026-03-19', 54, '4월 운동장 사용 일정을 공유합니다. 개인 일정과 겹치는 분들은 미리 말씀해 주세요.');

-- ── 공지사항 ────────────────────────────────────────────────────
INSERT IGNORE INTO notices (category, is_pinned, title, author, date, views, content) VALUES
('notice', 1, '2026 시즌 운영 방침 안내', '김기민', '2026-02-20', 320, '2026 시즌을 맞아 팀 운영 방침을 안내드립니다. 훈련 결석 시 사전 연락 필수, 공식전 2회 이상 무단 결석 시 출전 제한 등 기본 규칙을 준수해 주시기 바랍니다.'),
('notice', 1, '회비 납부 안내', '김기민', '2026-02-25', 278, '2026 시즌 회비 납부 기한은 3월 31일입니다. 계좌번호는 개별 연락드린 내용을 참고해 주세요. 기한 내 미납 시 시즌 참가가 제한될 수 있습니다.'),
('event',  0, '4월 OB-YB 친선전 개최', '김기민', '2026-03-05', 198, '매년 진행되는 OB-YB 친선전을 4월 중 개최할 예정입니다. 졸업생 분들의 많은 참여 부탁드립니다. 일정은 추후 확정 후 공지하겠습니다.'),
('game',   0, '2026 봄 리그 첫 경기 일정', '심동현', '2026-03-10', 412, '봄 리그 첫 경기가 4월 5일로 확정되었습니다. 상대팀은 건국대학교입니다. 전원 참석 부탁드리며 응원 나와주실 분들도 환영합니다.'),
('notice', 0, '훈련복 수령 안내', '김기민', '2026-03-13', 145, '새 훈련복이 입고되었습니다. 이번 주 훈련 때 수령 가능합니다. 못 받으신 분은 총무에게 개별 연락 주세요.'),
('game',   0, '4월 경기 일정 전체 공개', '심동현', '2026-03-18', 233, '4월 경기 일정을 공개합니다. 4/5 건국대, 4/12 성균관대, 4/19 연세대 순으로 진행됩니다. 각 경기 장소는 추후 개별 공지합니다.'),
('event',  0, '종강 뒤풀이 장소 투표', '김기민', '2026-03-20', 167, '1학기 종강 뒤풀이 장소를 투표로 결정하려 합니다. 의견 있으신 분들은 단체 채팅방에 댓글 달아주세요.');

-- ── 팀 일정 ─────────────────────────────────────────────────────
INSERT IGNORE INTO events (year, month, day, type, name) VALUES
(2026,3,7,'training','정기 훈련'),
(2026,3,14,'training','정기 훈련'),
(2026,3,21,'training','정기 훈련'),
(2026,3,22,'anniversary','KWU 페가수스 창단기념일'),
(2026,3,28,'training','정기 훈련'),
(2026,3,15,'meeting','2026 시즌 팀 미팅'),
(2026,4,4,'training','정기 훈련'),
(2026,4,5,'game','봄 리그 1차전 vs 건국대'),
(2026,4,11,'training','정기 훈련'),
(2026,4,12,'game','봄 리그 2차전 vs 성균관대'),
(2026,4,18,'training','정기 훈련'),
(2026,4,19,'game','봄 리그 3차전 vs 연세대'),
(2026,4,20,'meeting','4월 정기 회의'),
(2026,4,25,'training','정기 훈련'),
(2026,5,2,'training','정기 훈련'),
(2026,5,9,'training','정기 훈련'),
(2026,5,16,'training','정기 훈련'),
(2026,5,17,'game','봄 리그 4차전 vs 고려대'),
(2026,5,23,'training','정기 훈련'),
(2026,5,30,'training','정기 훈련'),
(2026,6,6,'game','봄 리그 최종전');

-- ── 공휴일 ──────────────────────────────────────────────────────
INSERT IGNORE INTO holidays (year, month, day, type, name, is_fixed) VALUES
(2026,1,1,'holiday','신정',1),
(2026,3,1,'holiday','삼일절',1),
(2026,5,5,'holiday','어린이날',1),
(2026,6,6,'holiday','현충일',1),
(2026,8,15,'holiday','광복절',1),
(2026,10,3,'holiday','개천절',1),
(2026,10,9,'holiday','한글날',1),
(2026,12,25,'holiday','크리스마스',1),
(2026,1,28,'holiday','설날 연휴',0),
(2026,1,29,'holiday','설날',0),
(2026,1,30,'holiday','설날 연휴',0),
(2026,5,15,'holiday','부처님오신날',0),
(2026,10,4,'holiday','추석 연휴',0),
(2026,10,5,'holiday','추석',0),
(2026,10,6,'holiday','추석 연휴',0);

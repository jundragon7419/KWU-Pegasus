-- ================================================================
-- KWU PEGASUS SEED DATA
-- ================================================================
-- 실행 방법:
--   mysql -u root -p kwu_pegasus < seed.sql
-- ================================================================

USE kwu_pegasus;

-- ── 설정 ────────────────────────────────────────────────────────
INSERT IGNORE INTO settings (setting_key, setting_val) VALUES ('active_roster_year', '2026');

-- ── 로스터 2026 ──────────────────────────────────────────────────
INSERT IGNORE INTO roster (year, number, name, student_id, generation, role) VALUES
-- 40기
(2026, '23',  '배성우', '2020734020', 40, 'roster_player'),
(2026, '4',   '이종현', '2020742057', 40, 'roster_player'),
(2026, '54',  '정성훈', '2020508046', 40, 'roster_player'),
-- 41기
(2026, '16',  '김민석', '2021802012', 41, 'roster_player'),
(2026, '33',  '오진택', '2021322033', 41, 'roster_player'),
(2026, '22',  '이희승', '2021508038', 41, 'roster_player'),
(2026, '98',  '최강민', '2021741048', 41, 'roster_player'),
-- 42기
(2026, '44',  '권민수', '2022202041', 42, 'roster_player'),
(2026, '50',  '김성현', '2022732007', 42, 'roster_player'),
(2026, '21',  '김주헌', '2022706076', 42, 'roster_player'),
(2026, '14',  '박기훈', '2022127011', 42, 'roster_player'),
(2026, '11',  '심동현', '2022323044', 42, 'roster_headcoach'),
(2026, '40',  '이도연', '2022323033', 42, 'roster_player'),
(2026, '35',  '이가온', '2022117008', 42, 'roster_player'),
-- 43기
(2026, '10',  '강상현', '2023321047', 43, 'roster_player'),
(2026, '18',  '김기민', '2023706132', 43, 'roster_president'),
(2026, '47',  '김지환', '2023613015', 43, 'roster_player'),
(2026, '64',  '양민우', '2023203066', 43, 'roster_player'),
(2026, '52',  '유주찬', '2023742034', 43, 'roster_player'),
(2026, '49',  '이송주', '2023603006', 43, 'roster_player'),
(2026, '37',  '이승주', '2023742011', 43, 'roster_player'),
(2026, '38',  '이윤하', '2023732028', 43, 'roster_player'),
(2026, '20',  '이준용', '2023203056', 43, 'roster_player'),
(2026, '36',  '한규혁', '2023742024', 43, 'roster_player'),
-- 44기
(2026, '24',  '김건희', '2024404064', 44, 'roster_player'),
(2026, '27',  '박종현', '2024734043', 44, 'roster_player'),
(2026, '51',  '박찬진', '2024803006', 44, 'roster_player'),
(2026, '28',  '신찬혁', '2024803075', 44, 'roster_player'),
(2026, '6',   '이재현', '2024402088', 44, 'roster_player'),
(2026, '13',  '이찬영', '2024746082', 44, 'roster_player'),
(2026, '41',  '임세훈', '2024321034', 44, 'roster_player'),
(2026, '7',   '장우진', '2024311001', 44, 'roster_player'),
(2026, '57',  '최재원', '2024746045', 44, 'roster_player'),
(2026, '99',  '조승이', '2024802033', 44, 'roster_manager'),
-- 45기
(2026, '1',   '김규민', '2025304009', 45, 'roster_player'),
(2026, '0',   '김승원', '2025613037', 45, 'roster_player'),
(2026, '2',   '박재민', '2025510026', 45, 'roster_player'),
(2026, '59',  '신주환', '2025734025', 45, 'roster_player'),
(2026, '39',  '신현재', '2025734021', 45, 'roster_player'),
(2026, '45',  '신호정', '2025803023', 45, 'roster_player'),
(2026, '71',  '심부근', '2025205130', 45, 'roster_player'),
(2026, '66',  '원정빈', '2025742032', 45, 'roster_player'),
(2026, '92',  '유재혁', '2025803063', 45, 'roster_player'),
(2026, '15',  '윤주강', '2025402014', 45, 'roster_player'),
(2026, '29',  '이우성', '2025746035', 45, 'roster_player'),
(2026, '56',  '이제영', '2025204229', 45, 'roster_player'),
(2026, '63',  '이지용', '2025742007', 45, 'roster_player'),
(2026, '61',  '장현우', '2025114043', 45, 'roster_player'),
(2026, '55',  '정민재', '2025404065', 45, 'roster_player'),
(2026, '95',  '정우인', '2025510004', 45, 'roster_player'),
(2026, '58',  '지건희', '2025404054', 45, 'roster_player'),
(2026, '43',  '최승민', '2025742031', 45, 'roster_player'),
(2026, '93',  '한희성', '2025402031', 45, 'roster_player'),
(2026, '88',  '이채은', '2025511019', 45, 'roster_manager'),
-- 46기
(2026, '3',   '방현빈', '2026127005', 46, 'roster_player'),
(2026, '32',  '배윤재', '2026706079', 46, 'roster_player'),
(2026, '5',   '송원준', '2026746037', 46, 'roster_player'),
(2026, '79',  '안선우', '2026402068', 46, 'roster_player'),
(2026, '19',  '안지언', '2026613010', 46, 'roster_player'),
(2026, '68',  '안현규', '2026509057', 46, 'roster_player'),
(2026, '12',  '유지현', '2026509060', 46, 'roster_player'),
(2026, '60',  '임준규', '2026742014', 46, 'roster_player'),
(2026, '46',  '장현호', '2026205037', 46, 'roster_player'),
(2026, '34',  '정선우', '2026734040', 46, 'roster_player'),
(2026, '9',   '정현수', '2026509043', 46, 'roster_player'),
(2026, '17',  '최민기', '2026205092', 46, 'roster_player'),
(2026, '53',  '한윤호', '2026734010', 46, 'roster_player'),
(2026, '8',   '한종원', '2026707007', 46, 'roster_player'),
(2026, '31',  '윤정원', '2026734005', 46, 'roster_manager'),
-- 번호 없는 매니저 (기수 오름차순)
(2026, 'M',   '민재영', '2021603036', 41, 'roster_manager'),
(2026, 'M',   '김은우', '2022610039', 42, 'roster_manager'),
(2026, 'M',   '정수빈', '2024605052', 44, 'roster_manager'),
(2026, 'M',   '김수민', '2024605041', 44, 'roster_manager'),
(2026, 'M',   '정해근', '2024605030', 44, 'roster_manager'),
(2026, 'M',   '박세빈', '2025205112', 45, 'roster_manager'),
(2026, 'M',   '손은채', '2026613028', 46, 'roster_manager'),
(2026, 'M',   '허은채', '2026404033', 46, 'roster_manager');

-- ── 팀 일정 ──────────────────────────────────────────────────────
-- 일정은 관리자 페이지에서 직접 추가합니다.

-- ── 공휴일 ────────────────────────────────────────────────────────
-- 공휴일은 관리자 페이지에서 공공 API(POST /admin/sync-holidays)로 동기화합니다.

-- ── 테스트 유저 ──────────────────────────────────────────────────
-- 비밀번호 모두 'test1234' (bcrypt, 10 rounds)
INSERT IGNORE INTO users (username, password, email, authority, membership_status) VALUES
('test_basic',  '$2b$10$nPKh.YAmQVVEY2MREL/ciOErvGC5ho4Vww0mq.XwoZfumx.oSyqXq', 'basic@test.com',  'basic',  'none');

INSERT IGNORE INTO users (username, password, email, name, student_id, ob_yb, authority, membership_status) VALUES
('test_member', '$2b$10$nPKh.YAmQVVEY2MREL/ciOErvGC5ho4Vww0mq.XwoZfumx.oSyqXq', 'member@test.com', '박준호', '2022200001', 'yb', 'member', 'approved');

INSERT IGNORE INTO users (username, password, email, name, student_id, ob_yb, authority, staff_type, membership_status) VALUES
('test_staff',  '$2b$10$nPKh.YAmQVVEY2MREL/ciOErvGC5ho4Vww0mq.XwoZfumx.oSyqXq', 'staff@test.com',  '심동현', '2021100004', 'yb', 'staff', 'president', 'approved');

INSERT IGNORE INTO users (username, password, email, authority, membership_status) VALUES
('test_root',   '$2b$10$nPKh.YAmQVVEY2MREL/ciOErvGC5ho4Vww0mq.XwoZfumx.oSyqXq', 'root@test.com',   'root',   'none');

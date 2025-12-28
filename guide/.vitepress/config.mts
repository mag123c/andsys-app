import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '4ndSYS 가이드',
  description: '웹소설 작가를 위한 글쓰기 플랫폼 사용 가이드',
  lang: 'ko-KR',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '가이드', link: '/getting-started/what-is-4ndsys' },
      { text: 'FAQ', link: '/getting-started/faq' },
      { text: '4ndSYS', link: 'https://4ndsys.net' },
    ],

    sidebar: [
      {
        text: '시작하기',
        items: [
          { text: '4ndSYS란?', link: '/getting-started/what-is-4ndsys' },
          { text: '게스트 vs 회원', link: '/getting-started/guest-vs-member' },
          { text: 'FAQ', link: '/getting-started/faq' },
        ],
      },
      {
        text: '소설 관리',
        items: [
          { text: '새 소설 만들기', link: '/novel/create' },
          { text: '소설 정보 수정', link: '/novel/edit' },
          { text: '표지 이미지 설정', link: '/novel/cover-image' },
          { text: '소설 삭제', link: '/novel/delete' },
        ],
      },
      {
        text: '회차 관리',
        items: [
          { text: '회차 추가하기', link: '/novel/chapter-create' },
          { text: '회차 순서 변경', link: '/novel/chapter-reorder' },
        ],
      },
      {
        text: '집필 에디터',
        items: [
          { text: '에디터 기본 사용법', link: '/editor/basics' },
          { text: '서식 적용하기', link: '/editor/formatting' },
          { text: '폰트 변경', link: '/editor/font' },
          { text: '자동 저장', link: '/editor/auto-save' },
          { text: '키보드 단축키', link: '/editor/shortcuts' },
          { text: '우측 패널 활용', link: '/editor/right-panel' },
        ],
      },
      {
        text: '시놉시스',
        items: [
          { text: '시놉시스 작성', link: '/novel/synopsis' },
          { text: '버전 히스토리', link: '/novel/synopsis-history' },
        ],
      },
      {
        text: '캐릭터 관리',
        items: [
          { text: '캐릭터 추가', link: '/character/create' },
          { text: '커스텀 필드', link: '/character/custom-fields' },
          { text: '캐릭터 순서 변경', link: '/character/reorder' },
          { text: '히스토리 복원', link: '/character/history' },
        ],
      },
      {
        text: '관계도',
        items: [
          { text: '관계도 보기', link: '/relationship/view' },
          { text: '관계 만들기', link: '/relationship/create' },
          { text: '필터링 & 조작', link: '/relationship/filter' },
        ],
      },
      {
        text: '설정',
        items: [
          { text: '테마 변경', link: '/settings/theme' },
          { text: '기본 폰트', link: '/settings/default-font' },
          { text: '데이터 백업', link: '/settings/backup' },
        ],
      },
    ],

    footer: {
      message: '웹소설 작가를 위한 무료 글쓰기 플랫폼',
      copyright: '© 2025 4ndSYS',
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '검색',
            buttonAriaLabel: '검색',
          },
          modal: {
            noResultsText: '검색 결과가 없습니다',
            resetButtonTitle: '초기화',
            footer: {
              selectText: '선택',
              navigateText: '이동',
              closeText: '닫기',
            },
          },
        },
      },
    },

    outline: {
      label: '목차',
    },

    docFooter: {
      prev: '이전',
      next: '다음',
    },

    lastUpdated: {
      text: '최종 수정',
    },

    returnToTopLabel: '맨 위로',
    sidebarMenuLabel: '메뉴',
    darkModeSwitchLabel: '테마',
  },
})

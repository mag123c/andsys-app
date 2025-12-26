/**
 * 춘향전 목업 데이터
 * 저작권: 퍼블릭 도메인 (작자 미상, 조선시대 고전소설)
 */

import type { JSONContent } from "@tiptap/core";

// ID 생성 (클라이언트에서 실행되므로 crypto.randomUUID 사용)
const generateId = () => crypto.randomUUID();

// 현재 날짜
const now = () => new Date();

// Tiptap JSON Content 헬퍼
function createTiptapContent(paragraphs: string[]): JSONContent {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    })),
  };
}

// 텍스트 추출
function extractPlainText(paragraphs: string[]): string {
  return paragraphs.join("\n");
}

// 글자 수 계산
function countWords(paragraphs: string[]): number {
  return paragraphs.join("").length;
}

export interface MockupData {
  project: {
    id: string;
    title: string;
    description: string;
    genre: string;
  };
  synopsis: {
    id: string;
    content: JSONContent;
    plainText: string;
    wordCount: number;
  };
  characters: Array<{
    id: string;
    name: string;
    nickname: string | null;
    age: number | null;
    gender: string;
    personality: string;
    background: string;
    order: number;
  }>;
  relationships: Array<{
    id: string;
    fromCharacterId: string;
    toCharacterId: string;
    type: "family" | "friend" | "lover" | "rival" | "enemy" | "colleague" | "master" | "custom";
    description: string;
    bidirectional: boolean;
  }>;
  chapters: Array<{
    id: string;
    title: string;
    content: JSONContent;
    contentText: string;
    wordCount: number;
    order: number;
  }>;
}

export function generateChunhyangData(): MockupData {
  // IDs
  const projectId = generateId();
  const synopsisId = generateId();

  // 캐릭터 IDs
  const chunhyangId = generateId();
  const mongryongId = generateId();
  const wolmaeId = generateId();
  const byunhakdoId = generateId();

  // 시놉시스
  const synopsisParagraphs = [
    "조선 숙종 때, 남원부사의 아들 이몽룡은 광한루에서 그네 타는 성춘향을 보고 첫눈에 반한다.",
    "",
    "춘향은 퇴기 월매의 딸이지만 기생 신분이 아닌 양인의 신분으로, 이몽룡과 백년가약을 맺는다. 그러나 이몽룡의 아버지가 한양으로 전임되면서 두 사람은 이별하게 된다.",
    "",
    "이몽룡이 떠난 후, 새로 부임한 탐관오리 변학도는 춘향의 미모에 반해 수청을 강요한다. 춘향은 이를 거부하고 옥에 갇히게 된다.",
    "",
    "한편 한양에서 과거에 급제한 이몽룡은 암행어사가 되어 남원으로 내려온다. 변학도의 생일잔치 날, 이몽룡은 '암행어사 출도'를 외치며 변학도를 파직시키고 춘향을 구출한다.",
    "",
    "마침내 두 사람은 재회하여 행복하게 살게 된다.",
  ];

  // 회차 내용
  const chapter1Paragraphs = [
    "때는 조선 숙종 대왕 즉위 초년이라.",
    "",
    "전라도 남원부에 사는 이한림의 아들 이몽룡은 열여섯 살의 총명한 도령이었다. 어느 화창한 봄날, 몽룡은 방자를 데리고 광한루로 나들이를 나갔다.",
    "",
    "\"방자야, 저기 그네 타는 처자가 누구냐?\"",
    "",
    "광한루 뜰에서 그네를 타는 한 처녀가 있었으니, 그 고운 자태와 맑은 웃음소리에 몽룡은 그만 넋을 잃고 말았다.",
    "",
    "\"소인이 알아보겠습니다.\"",
    "",
    "방자가 알아보니, 그 처녀는 퇴기 월매의 딸 성춘향이라 하였다. 비록 천한 신분이나, 월매가 양인 남자와의 사이에서 낳은 딸이라 기적에 오르지 않은 처녀였다.",
    "",
    "몽룡은 방자를 시켜 춘향에게 청을 넣었고, 그날 밤 춘향의 집을 찾아가게 되었다.",
  ];

  const chapter2Paragraphs = [
    "춘향의 방에 들어선 몽룡은 그 곱고 단아한 모습에 또 한 번 반하고 말았다.",
    "",
    "\"아가씨, 나는 남원부사의 아들 이몽룡이오. 오늘 광한루에서 그대를 보고 한눈에 반했소.\"",
    "",
    "춘향이 부끄러워하며 대답하였다.",
    "",
    "\"도령님, 저는 비록 천한 집안의 자식이오나, 한 번 정한 마음은 변치 않을 것입니다.\"",
    "",
    "그날 밤, 두 사람은 백년가약을 맺었다. 몽룡은 춘향에게 맹세하였다.",
    "",
    "\"내 반드시 과거에 급제하여 그대를 정식으로 맞이하리다.\"",
    "",
    "춘향도 눈물을 글썽이며 답하였다.",
    "",
    "\"도령님, 저는 오직 도령님만을 기다리겠습니다. 설령 죽음이 온다 해도 이 마음은 변치 않을 것입니다.\"",
  ];

  const chapter3Paragraphs = [
    "행복한 나날도 잠시, 몽룡의 아버지 이한림이 한양으로 전임 발령을 받았다.",
    "",
    "\"춘향아, 나는 아버지를 따라 한양으로 가야 한다.\"",
    "",
    "춘향은 몽룡의 손을 잡고 눈물을 흘렸다.",
    "",
    "\"도령님, 저를 두고 가시면 어찌 살라고 하십니까?\"",
    "",
    "\"울지 마라. 내 반드시 과거에 급제하여 돌아오마. 그때까지 몸 성히 기다려 다오.\"",
    "",
    "몽룡은 춘향에게 옥가락지를 건네며 말했다.",
    "",
    "\"이것을 증표로 삼아라. 내가 돌아올 때까지 이것을 보며 나를 기억해 다오.\"",
    "",
    "두 사람은 오작교에서 마지막 작별 인사를 나누었다. 몽룡이 탄 가마가 멀어져 가는 것을 춘향은 눈물로 바라보았다.",
  ];

  const chapter4Paragraphs = [
    "몽룡이 떠난 후, 남원에는 새로운 부사 변학도가 부임해 왔다.",
    "",
    "변학도는 탐욕스럽고 음흉한 자로, 부임하자마자 고을의 미녀들을 수소문하였다. 그러다 춘향의 미모에 대한 소문을 듣게 되었다.",
    "",
    "\"당장 그 춘향이란 년을 데려오너라!\"",
    "",
    "관아로 끌려온 춘향에게 변학도가 말했다.",
    "",
    "\"네가 춘향이로구나. 오늘부터 내 수청을 들어라.\"",
    "",
    "춘향이 단호하게 거절하였다.",
    "",
    "\"사또, 저는 이미 이 도령과 백년가약을 맺은 몸입니다. 죽어도 그 약속을 어길 수 없습니다.\"",
    "",
    "변학도는 격노하였다.",
    "",
    "\"네 이년! 감히 내 명을 거역해? 당장 옥에 가두고 매질을 하여라!\"",
    "",
    "춘향은 곤장을 맞으면서도 끝내 굴하지 않았다. 그녀의 절개에 남원 백성들은 눈물을 흘렸다.",
  ];

  const chapter5Paragraphs = [
    "한양에서 몽룡은 과거에 장원급제하였다.",
    "",
    "그러나 기뻐할 틈도 없이 남원에서 날아온 소식에 가슴이 찢어지는 듯했다. 춘향이 옥에 갇혀 죽을 날만 기다리고 있다는 것이었다.",
    "",
    "몽룡은 암행어사에 제수되어 전라도로 내려갔다. 남루한 옷차림으로 변장한 그는 남원에 도착하여 춘향을 면회하였다.",
    "",
    "\"춘향아, 내가 왔다.\"",
    "",
    "춘향은 반가우면서도 몽룡의 초라한 행색에 눈물을 흘렸다.",
    "",
    "\"도령님, 과거는 어찌 되셨습니까?\"",
    "",
    "\"낙방하였다. 하지만 걱정 마라. 내가 반드시 너를 구하리라.\"",
    "",
    "변학도의 생일잔치 날이 밝았다. 거지꼴을 한 몽룡이 잔치에 나타나 시를 지어 바쳤다.",
    "",
    "\"금잔에 가득한 술은 만백성의 피요, 옥반에 놓인 고기는 만백성의 기름이라...\"",
    "",
    "변학도가 노하여 끌어내라 명하는 순간, 몽룡이 외쳤다.",
    "",
    "\"암행어사 출도야!\"",
    "",
    "순식간에 상황이 역전되었다. 변학도는 파직되어 끌려가고, 춘향은 풀려났다.",
    "",
    "\"춘향아, 이제 우리는 헤어지지 않으리라.\"",
    "",
    "두 사람은 굳게 손을 잡았다. 남원 백성들의 환호 속에 두 사람의 사랑은 마침내 결실을 맺었다.",
  ];

  return {
    project: {
      id: projectId,
      title: "춘향전",
      description: "조선시대 판소리계 소설. 신분을 초월한 사랑과 절개를 그린 고전문학의 걸작.",
      genre: "고전소설",
    },
    synopsis: {
      id: synopsisId,
      content: createTiptapContent(synopsisParagraphs),
      plainText: extractPlainText(synopsisParagraphs),
      wordCount: countWords(synopsisParagraphs),
    },
    characters: [
      {
        id: chunhyangId,
        name: "성춘향",
        nickname: "춘향",
        age: 16,
        gender: "여성",
        personality: "정숙하고 절개가 굳음. 한 번 정한 마음은 죽어도 변치 않는 굳은 의지의 소유자.",
        background: "남원 퇴기 월매의 딸. 기생 신분이 아닌 양인으로, 이몽룡과 백년가약을 맺었다.",
        order: 0,
      },
      {
        id: mongryongId,
        name: "이몽룡",
        nickname: "몽룡",
        age: 16,
        gender: "남성",
        personality: "총명하고 의로움. 과거에 급제하여 암행어사가 될 만큼 학식이 높다.",
        background: "남원부사 이한림의 아들. 광한루에서 춘향을 만나 사랑에 빠졌다.",
        order: 1,
      },
      {
        id: wolmaeId,
        name: "월매",
        nickname: null,
        age: 40,
        gender: "여성",
        personality: "현실적이고 세상 물정에 밝음. 딸을 아끼는 어머니.",
        background: "춘향의 어머니. 퇴기(은퇴한 기생)로, 양인 남자와의 사이에서 춘향을 낳았다.",
        order: 2,
      },
      {
        id: byunhakdoId,
        name: "변학도",
        nickname: "변 사또",
        age: 50,
        gender: "남성",
        personality: "탐욕스럽고 음흉함. 권력을 앞세워 백성을 괴롭히는 탐관오리.",
        background: "이한림의 후임으로 남원에 부임한 신임 부사. 춘향에게 수청을 강요하다 암행어사에게 파직된다.",
        order: 3,
      },
    ],
    relationships: [
      {
        id: generateId(),
        fromCharacterId: chunhyangId,
        toCharacterId: mongryongId,
        type: "lover",
        description: "백년가약을 맺은 연인",
        bidirectional: true,
      },
      {
        id: generateId(),
        fromCharacterId: chunhyangId,
        toCharacterId: wolmaeId,
        type: "family",
        description: "모녀 관계",
        bidirectional: true,
      },
      {
        id: generateId(),
        fromCharacterId: byunhakdoId,
        toCharacterId: chunhyangId,
        type: "enemy",
        description: "수청을 강요하며 괴롭힘",
        bidirectional: false,
      },
      {
        id: generateId(),
        fromCharacterId: mongryongId,
        toCharacterId: byunhakdoId,
        type: "rival",
        description: "춘향을 구하기 위해 대립",
        bidirectional: false,
      },
    ],
    chapters: [
      {
        id: generateId(),
        title: "제1화: 광한루의 만남",
        content: createTiptapContent(chapter1Paragraphs),
        contentText: extractPlainText(chapter1Paragraphs),
        wordCount: countWords(chapter1Paragraphs),
        order: 0,
      },
      {
        id: generateId(),
        title: "제2화: 백년가약",
        content: createTiptapContent(chapter2Paragraphs),
        contentText: extractPlainText(chapter2Paragraphs),
        wordCount: countWords(chapter2Paragraphs),
        order: 1,
      },
      {
        id: generateId(),
        title: "제3화: 오작교의 이별",
        content: createTiptapContent(chapter3Paragraphs),
        contentText: extractPlainText(chapter3Paragraphs),
        wordCount: countWords(chapter3Paragraphs),
        order: 2,
      },
      {
        id: generateId(),
        title: "제4화: 변학도의 횡포",
        content: createTiptapContent(chapter4Paragraphs),
        contentText: extractPlainText(chapter4Paragraphs),
        wordCount: countWords(chapter4Paragraphs),
        order: 3,
      },
      {
        id: generateId(),
        title: "제5화: 암행어사 출도",
        content: createTiptapContent(chapter5Paragraphs),
        contentText: extractPlainText(chapter5Paragraphs),
        wordCount: countWords(chapter5Paragraphs),
        order: 4,
      },
    ],
  };
}

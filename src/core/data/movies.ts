import type { CollectionWork } from "./collection.ts";

// A one-time import of confirmed films from the owner’s Notion movie list, in its shelf order.
// Poster sources and release references are recorded in public/collection/ASSETS.json.
export const movies: CollectionWork[] = [
  {
    key: "avatar-2009",
    title: { "zh-CN": "阿凡达", "zh-TW": "阿凡達", ja: "アバター", en: "Avatar" },
    year: 2009, genres: ["sci-fi", "fantasy"], cover: { file: "avatar-2009.webp" },
  },
  {
    key: "avatar-fire-and-ash-2025",
    title: { "zh-CN": "阿凡达：火与烬", "zh-TW": "阿凡達：火與燼", ja: "アバター:ファイヤー・アンド・アッシュ", en: "Avatar: Fire and Ash" },
    year: 2025, genres: ["sci-fi", "fantasy"], cover: { file: "avatar-fire-and-ash-2025.webp" },
  },
  {
    key: "avatar-the-way-of-water-2022",
    title: { "zh-CN": "阿凡达：水之道", "zh-TW": "阿凡達：水之道", ja: "アバター:ウェイ・オブ・ウォーター", en: "Avatar: The Way of Water" },
    year: 2022, genres: ["sci-fi", "fantasy"], cover: { file: "avatar-the-way-of-water-2022.webp" },
  },
  {
    key: "forrest-gump-1994",
    title: { "zh-CN": "阿甘正传", "zh-TW": "阿甘正傳", ja: "フォレスト・ガンプ/一期一会", en: "Forrest Gump" },
    year: 1994, genres: ["coming-of-age", "life"], cover: { file: "forrest-gump-1994.webp" },
  },
  {
    key: "la-la-land-2016",
    title: { "zh-CN": "爱乐之城", "zh-TW": "樂來越愛你", ja: "ラ・ラ・ランド", en: "La La Land" },
    year: 2016, genres: ["music", "romance"], cover: { file: "la-la-land-2016.webp" },
  },
  {
    key: "oppenheimer-2023",
    title: { "zh-CN": "奥本海默", "zh-TW": "奧本海默", ja: "オッペンハイマー", en: "Oppenheimer" },
    year: 2023, genres: ["life"], cover: { file: "oppenheimer-2023.webp" },
  },
  {
    key: "the-odyssey-2026",
    title: { "zh-CN": "奥德赛", "zh-TW": "奧德賽", ja: "オデュッセイア", en: "The Odyssey" },
    year: 2026, genres: ["fantasy"], cover: { file: "the-odyssey-2026.webp" },
  },
  {
    key: "the-eight-hundred-2020",
    title: { "zh-CN": "八佰", "zh-TW": "八佰", ja: "エイト・ハンドレッド －戦場の英雄たち－", en: "The Eight Hundred" },
    year: 2020, genres: ["action"], cover: { file: "the-eight-hundred-2020.webp" },
  },
  {
    key: "the-secret-life-of-walter-mitty-2013",
    title: { "zh-CN": "白日梦想家", "zh-TW": "白日夢冒險王", ja: "LIFE!/ライフ", en: "The Secret Life of Walter Mitty" },
    year: 2013, genres: ["coming-of-age", "road"], cover: { file: "the-secret-life-of-walter-mitty-2013.webp" },
  },
  {
    key: "whiplash-2014",
    title: { "zh-CN": "爆裂鼓手", "zh-TW": "進擊的鼓手", ja: "セッション", en: "Whiplash" },
    year: 2014, genres: ["music", "mystery"], cover: { file: "whiplash-2014.webp" },
  },
  {
    key: "the-dark-knight-2008",
    title: { "zh-CN": "蝙蝠侠：黑暗骑士", "zh-TW": "黑暗騎士", ja: "ダークナイト", en: "The Dark Knight" },
    year: 2008, genres: ["action", "mystery"], cover: { file: "the-dark-knight-2008.webp" },
  },
  {
    key: "the-dark-knight-rises-2012",
    title: { "zh-CN": "蝙蝠侠：黑暗骑士崛起", "zh-TW": "黑暗騎士：黎明昇起", ja: "ダークナイト ライジング", en: "The Dark Knight Rises" },
    year: 2012, genres: ["action", "mystery"], cover: { file: "the-dark-knight-rises-2012.webp" },
  },
  {
    key: "batman-begins-2005",
    title: { "zh-CN": "蝙蝠侠：侠影之谜", "zh-TW": "蝙蝠俠：開戰時刻", ja: "バットマン ビギンズ", en: "Batman Begins" },
    year: 2005, genres: ["action", "mystery"], cover: { file: "batman-begins-2005.webp" },
  },
  {
    key: "transformers-2007",
    title: { "zh-CN": "变形金刚", "zh-TW": "變形金剛", ja: "トランスフォーマー", en: "Transformers" },
    year: 2007, genres: ["sci-fi", "action"], cover: { file: "transformers-2007.webp" },
  },
  {
    key: "transformers-revenge-of-the-fallen-2009",
    title: { "zh-CN": "变形金刚2：卷土重来", "zh-TW": "變形金剛：復仇之戰", ja: "トランスフォーマー/リベンジ", en: "Transformers: Revenge of the Fallen" },
    year: 2009, genres: ["sci-fi", "action"], cover: { file: "transformers-revenge-of-the-fallen-2009.webp" },
  },
  {
    key: "transformers-dark-of-the-moon-2011",
    title: { "zh-CN": "变形金刚3：月黑之时", "zh-TW": "變形金剛3", ja: "トランスフォーマー/ダークサイド・ムーン", en: "Transformers: Dark of the Moon" },
    year: 2011, genres: ["sci-fi", "action"], cover: { file: "transformers-dark-of-the-moon-2011.webp" },
  },
  {
    key: "transformers-age-of-extinction-2014",
    title: { "zh-CN": "变形金刚4：绝迹重生", "zh-TW": "變形金剛4：絕跡重生", ja: "トランスフォーマー/ロストエイジ", en: "Transformers: Age of Extinction" },
    year: 2014, genres: ["sci-fi", "action"], cover: { file: "transformers-age-of-extinction-2014.webp" },
  },
  {
    key: "transformers-the-last-knight-2017",
    title: { "zh-CN": "变形金刚5：最后的骑士", "zh-TW": "變形金剛5：最終騎士", ja: "トランスフォーマー/最後の騎士王", en: "Transformers: The Last Knight" },
    year: 2017, genres: ["sci-fi", "action"], cover: { file: "transformers-the-last-knight-2017.webp" },
  },
  {
    key: "transformers-rise-of-the-beasts-2023",
    title: { "zh-CN": "变形金刚：超能勇士崛起", "zh-TW": "變形金剛：萬獸崛起", ja: "トランスフォーマー/ビースト覚醒", en: "Transformers: Rise of the Beasts" },
    year: 2023, genres: ["sci-fi", "action"], cover: { file: "transformers-rise-of-the-beasts-2023.webp" },
  },
  {
    key: "the-amazing-spider-man-2012",
    title: { "zh-CN": "超凡蜘蛛侠", "zh-TW": "蜘蛛人：驚奇再起", ja: "アメイジング・スパイダーマン", en: "The Amazing Spider-Man" },
    year: 2012, genres: ["coming-of-age", "action"], cover: { file: "the-amazing-spider-man-2012.webp" },
  },
  {
    key: "the-amazing-spider-man-2-2014",
    title: { "zh-CN": "超凡蜘蛛侠2", "zh-TW": "蜘蛛人驚奇再起2：電光之戰", ja: "アメイジング・スパイダーマン2", en: "The Amazing Spider-Man 2" },
    year: 2014, genres: ["coming-of-age", "action"], cover: { file: "the-amazing-spider-man-2-2014.webp" },
  },
  {
    key: "the-truman-show-1998",
    title: { "zh-CN": "楚门的世界", "zh-TW": "楚門的世界", ja: "トゥルーマン・ショー", en: "The Truman Show" },
    year: 1998, genres: ["road", "life"], cover: { file: "the-truman-show-1998.webp" },
  },
  {
    key: "bumblebee-2018",
    title: { "zh-CN": "大黄蜂", "zh-TW": "大黃蜂", ja: "バンブルビー", en: "Bumblebee" },
    year: 2018, genres: ["sci-fi", "action"], cover: { file: "bumblebee-2018.webp" },
  },
  {
    key: "the-pursuit-of-happyness-2006",
    title: { "zh-CN": "当幸福来敲门", "zh-TW": "當幸福來敲門", ja: "幸せのちから", en: "The Pursuit of Happyness" },
    year: 2006, genres: ["coming-of-age", "romance", "life"], cover: { file: "the-pursuit-of-happyness-2006.webp" },
  },
  {
    key: "inception-2010",
    title: { "zh-CN": "盗梦空间", "zh-TW": "全面啟動", ja: "インセプション", en: "Inception" },
    year: 2010, genres: ["sci-fi", "mystery"], cover: { file: "inception-2010.webp" },
  },
  {
    key: "mission-impossible-1996",
    title: { "zh-CN": "碟中谍", "zh-TW": "不可能的任務", ja: "ミッション:インポッシブル", en: "Mission: Impossible" },
    year: 1996, genres: ["action"], cover: { file: "mission-impossible-1996.webp" },
  },
  {
    key: "mission-impossible-2-2000",
    title: { "zh-CN": "碟中谍2", "zh-TW": "不可能的任務2", ja: "ミッション:インポッシブル2", en: "Mission: Impossible 2" },
    year: 2000, genres: ["action"], cover: { file: "mission-impossible-2-2000.webp" },
  },
  {
    key: "mission-impossible-iii-2006",
    title: { "zh-CN": "碟中谍3", "zh-TW": "不可能的任務3", ja: "ミッション:インポッシブル3", en: "Mission: Impossible III" },
    year: 2006, genres: ["action"], cover: { file: "mission-impossible-iii-2006.webp" },
  },
  {
    key: "mission-impossible-ghost-protocol-2011",
    title: { "zh-CN": "碟中谍4：幽灵协议", "zh-TW": "不可能的任務：鬼影行動", ja: "ミッション:インポッシブル/ゴースト・プロトコル", en: "Mission: Impossible – Ghost Protocol" },
    year: 2011, genres: ["action"], cover: { file: "mission-impossible-ghost-protocol-2011.webp" },
  },
  {
    key: "mission-impossible-rogue-nation-2015",
    title: { "zh-CN": "碟中谍5：神秘国度", "zh-TW": "不可能的任務：失控國度", ja: "ミッション:インポッシブル/ローグ・ネイション", en: "Mission: Impossible – Rogue Nation" },
    year: 2015, genres: ["action"], cover: { file: "mission-impossible-rogue-nation-2015.webp" },
  },
  {
    key: "mission-impossible-fallout-2018",
    title: { "zh-CN": "碟中谍6：全面瓦解", "zh-TW": "不可能的任務：全面瓦解", ja: "ミッション:インポッシブル/フォールアウト", en: "Mission: Impossible – Fallout" },
    year: 2018, genres: ["action"], cover: { file: "mission-impossible-fallout-2018.webp" },
  },
  {
    key: "mission-impossible-dead-reckoning-part-one-2023",
    title: { "zh-CN": "碟中谍7：致命清算（上）", "zh-TW": "不可能的任務：致命清算", ja: "ミッション:インポッシブル/デッドレコニング PART ONE", en: "Mission: Impossible – Dead Reckoning Part One" },
    year: 2023, genres: ["action"], cover: { file: "mission-impossible-dead-reckoning-part-one-2023.webp" },
  },
  {
    key: "mission-impossible-the-final-reckoning-2025",
    title: { "zh-CN": "碟中谍8：最终清算", "zh-TW": "不可能的任務：最終清算", ja: "ミッション:インポッシブル/ファイナル・レコニング", en: "Mission: Impossible – The Final Reckoning" },
    year: 2025, genres: ["action"], cover: { file: "mission-impossible-the-final-reckoning-2025.webp" },
  },
  {
    key: "dunkirk-2017",
    title: { "zh-CN": "敦刻尔克", "zh-TW": "敦克爾克大行動", ja: "ダンケルク", en: "Dunkirk" },
    year: 2017, genres: ["life"], cover: { file: "dunkirk-2017.webp" },
  },
  {
    key: "raiders-of-the-lost-ark-1981",
    title: { "zh-CN": "夺宝奇兵", "zh-TW": "法櫃奇兵", ja: "レイダース/失われたアーク《聖櫃》", en: "Raiders of the Lost Ark" },
    year: 1981, genres: ["fantasy", "action"], cover: { file: "raiders-of-the-lost-ark-1981.webp" },
  },
  {
    key: "indiana-jones-and-the-temple-of-doom-1984",
    title: { "zh-CN": "夺宝奇兵2：魔宫传奇", "zh-TW": "魔宮傳奇", ja: "インディ・ジョーンズ/魔宮の伝説", en: "Indiana Jones and the Temple of Doom" },
    year: 1984, genres: ["fantasy", "action"], cover: { file: "indiana-jones-and-the-temple-of-doom-1984.webp" },
  },
  {
    key: "indiana-jones-and-the-last-crusade-1989",
    title: { "zh-CN": "夺宝奇兵3：圣战奇兵", "zh-TW": "聖戰奇兵", ja: "インディ・ジョーンズ/最後の聖戦", en: "Indiana Jones and the Last Crusade" },
    year: 1989, genres: ["fantasy", "action"], cover: { file: "indiana-jones-and-the-last-crusade-1989.webp" },
  },
  {
    key: "indiana-jones-and-the-kingdom-of-the-crystal-skull-2008",
    title: { "zh-CN": "夺宝奇兵4：水晶骷髅王国", "zh-TW": "印第安納瓊斯：水晶骷髏王國", ja: "インディ・ジョーンズ/クリスタル・スカルの王国", en: "Indiana Jones and the Kingdom of the Crystal Skull" },
    year: 2008, genres: ["fantasy", "action"], cover: { file: "indiana-jones-and-the-kingdom-of-the-crystal-skull-2008.webp" },
  },
  {
    key: "indiana-jones-and-the-dial-of-destiny-2023",
    title: { "zh-CN": "夺宝奇兵5：命运转盘", "zh-TW": "印第安納瓊斯：命運輪盤", ja: "インディ・ジョーンズと運命のダイヤル", en: "Indiana Jones and the Dial of Destiny" },
    year: 2023, genres: ["fantasy", "action"], cover: { file: "indiana-jones-and-the-dial-of-destiny-2023.webp" },
  },
  {
    key: "f1-the-movie-2025",
    title: { "zh-CN": "F1：狂飙飞车", "zh-TW": "F1電影", ja: "F1/エフワン", en: "F1 The Movie" },
    year: 2025, genres: ["coming-of-age", "action"], cover: { file: "f1-the-movie-2025.webp" },
  },
  {
    key: "the-avengers-2012",
    title: { "zh-CN": "复仇者联盟", "zh-TW": "復仇者聯盟", ja: "アベンジャーズ", en: "The Avengers" },
    year: 2012, genres: ["action"], cover: { file: "the-avengers-2012.webp" },
  },
  {
    key: "avengers-age-of-ultron-2015",
    title: { "zh-CN": "复仇者联盟2：奥创纪元", "zh-TW": "復仇者聯盟2：奧創紀元", ja: "アベンジャーズ/エイジ・オブ・ウルトロン", en: "Avengers: Age of Ultron" },
    year: 2015, genres: ["action"], cover: { file: "avengers-age-of-ultron-2015.webp" },
  },
  {
    key: "avengers-infinity-war-2018",
    title: { "zh-CN": "复仇者联盟3：无限战争", "zh-TW": "復仇者聯盟：無限之戰", ja: "アベンジャーズ/インフィニティ・ウォー", en: "Avengers: Infinity War" },
    year: 2018, genres: ["action"], cover: { file: "avengers-infinity-war-2018.webp" },
  },
  {
    key: "avengers-endgame-2019",
    title: { "zh-CN": "复仇者联盟4：终局之战", "zh-TW": "復仇者聯盟：終局之戰", ja: "アベンジャーズ/エンドゲーム", en: "Avengers: Endgame" },
    year: 2019, genres: ["action"], cover: { file: "avengers-endgame-2019.webp" },
  },
  {
    key: "iron-man-2008",
    title: { "zh-CN": "钢铁侠", "zh-TW": "鋼鐵人", ja: "アイアンマン", en: "Iron Man" },
    year: 2008, genres: ["sci-fi", "action"], cover: { file: "iron-man-2008.webp" },
  },
  {
    key: "iron-man-2-2010",
    title: { "zh-CN": "钢铁侠2", "zh-TW": "鋼鐵人2", ja: "アイアンマン2", en: "Iron Man 2" },
    year: 2010, genres: ["sci-fi", "action"], cover: { file: "iron-man-2-2010.webp" },
  },
  {
    key: "iron-man-3-2013",
    title: { "zh-CN": "钢铁侠3", "zh-TW": "鋼鐵人3", ja: "アイアンマン3", en: "Iron Man 3" },
    year: 2013, genres: ["sci-fi", "action"], cover: { file: "iron-man-3-2013.webp" },
  },
  {
    key: "kung-fu-hustle-2004",
    title: { "zh-CN": "功夫", "zh-TW": "功夫", ja: "カンフーハッスル", en: "Kung Fu Hustle" },
    year: 2004, genres: ["action"], cover: { file: "kung-fu-hustle-2004.webp" },
  },
  {
    key: "gran-turismo-2023",
    title: { "zh-CN": "GT跑车浪漫旅（Gran Turismo）", "zh-TW": "GT：跨界玩家", ja: "グランツーリスモ", en: "Gran Turismo" },
    year: 2023, genres: ["coming-of-age", "action"], cover: { file: "gran-turismo-2023.webp" },
  },
  {
    key: "aquaman-2018",
    title: { "zh-CN": "海王", "zh-TW": "水行俠", ja: "アクアマン", en: "Aquaman" },
    year: 2018, genres: ["fantasy", "action"], cover: { file: "aquaman-2018.webp" },
  },
  {
    key: "aquaman-and-the-lost-kingdom-2023",
    title: { "zh-CN": "海王2：失落的王国", "zh-TW": "水行俠 失落王國", ja: "アクアマン/失われた王国", en: "Aquaman and the Lost Kingdom" },
    year: 2023, genres: ["fantasy", "action"], cover: { file: "aquaman-and-the-lost-kingdom-2023.webp" },
  },
  {
    key: "the-wolf-of-wall-street-2013",
    title: { "zh-CN": "华尔街之狼", "zh-TW": "華爾街之狼", ja: "ウルフ・オブ・ウォールストリート", en: "The Wolf of Wall Street" },
    year: 2013, genres: ["mystery", "life"], cover: { file: "the-wolf-of-wall-street-2013.webp" },
  },
  {
    key: "in-the-mood-for-love-2000",
    title: { "zh-CN": "花样年华", "zh-TW": "花樣年華", ja: "花様年華", en: "In the Mood for Love" },
    year: 2000, genres: ["romance"], cover: { file: "in-the-mood-for-love-2000.webp" },
  },
  {
    key: "world-war-z-2013",
    title: { "zh-CN": "僵尸世界大战", "zh-TW": "末日之戰", ja: "ワールド・ウォーZ", en: "World War Z" },
    year: 2013, genres: ["mystery"], cover: { file: "world-war-z-2013.webp" },
  },
  {
    key: "shutter-island-2010",
    title: { "zh-CN": "禁闭岛", "zh-TW": "隔離島", ja: "シャッター アイランド", en: "Shutter Island" },
    year: 2010, genres: ["mystery"], cover: { file: "shutter-island-2010.webp" },
  },
  {
    key: "captain-marvel-2019",
    title: { "zh-CN": "惊奇队长", "zh-TW": "驚奇隊長", ja: "キャプテン・マーベル", en: "Captain Marvel" },
    year: 2019, genres: ["sci-fi", "action"], cover: { file: "captain-marvel-2019.webp" },
  },
  {
    key: "extraction-2020",
    title: { "zh-CN": "惊天营救", "zh-TW": "驚天營救", ja: "タイラー・レイク -命の奪還-", en: "Extraction" },
    year: 2020, genres: ["action"], cover: { file: "extraction-2020.webp" },
  },
  {
    key: "extraction-2-2023",
    title: { "zh-CN": "惊天营救2", "zh-TW": "驚天營救 2", ja: "タイラー・レイク -命の奪還-2", en: "Extraction 2" },
    year: 2023, genres: ["action"], cover: { file: "extraction-2-2023.webp" },
  },
  {
    key: "john-wick-2014",
    title: { "zh-CN": "疾速追杀", "zh-TW": "捍衛任務", ja: "ジョン・ウィック", en: "John Wick" },
    year: 2014, genres: ["action", "mystery"], cover: { file: "john-wick-2014.webp" },
  },
  {
    key: "john-wick-chapter-2-2017",
    title: { "zh-CN": "疾速追杀2", "zh-TW": "捍衛任務2：殺神回歸", ja: "ジョン・ウィック:チャプター2", en: "John Wick: Chapter 2" },
    year: 2017, genres: ["action", "mystery"], cover: { file: "john-wick-chapter-2-2017.webp" },
  },
  {
    key: "john-wick-chapter-3-parabellum-2019",
    title: { "zh-CN": "疾速追杀3", "zh-TW": "捍衛任務3：全面開戰", ja: "ジョン・ウィック:パラベラム", en: "John Wick: Chapter 3 – Parabellum" },
    year: 2019, genres: ["action", "mystery"], cover: { file: "john-wick-chapter-3-parabellum-2019.webp" },
  },
  {
    key: "john-wick-chapter-4-2023",
    title: { "zh-CN": "疾速追杀4", "zh-TW": "捍衛任務4", ja: "ジョン・ウィック:コンセクエンス", en: "John Wick: Chapter 4" },
    year: 2023, genres: ["action", "mystery"], cover: { file: "john-wick-chapter-4-2023.webp" },
  },
  {
    key: "from-the-world-of-john-wick-ballerina-2025",
    title: { "zh-CN": "疾速追杀：芭蕾杀姬", "zh-TW": "捍衛任務：復仇芭蕾", ja: "バレリーナ:The World of John Wick", en: "From the World of John Wick: Ballerina" },
    year: 2025, genres: ["action", "mystery"], cover: { file: "from-the-world-of-john-wick-ballerina-2025.webp" },
  },
  {
    key: "memento-2000",
    title: { "zh-CN": "记忆碎片", "zh-TW": "記憶拼圖", ja: "メメント", en: "Memento" },
    year: 2000, genres: ["mystery"], cover: { file: "memento-2000.webp" },
  },
  {
    key: "knives-out-2019",
    title: { "zh-CN": "利刃出鞘", "zh-TW": "鋒迴路轉", ja: "ナイブズ・アウト/名探偵と刃の館の秘密", en: "Knives Out" },
    year: 2019, genres: ["mystery"], cover: { file: "knives-out-2019.webp" },
  },
  {
    key: "roman-holiday-1953",
    title: { "zh-CN": "罗马假日", "zh-TW": "羅馬假期", ja: "ローマの休日", en: "Roman Holiday" },
    year: 1953, genres: ["romance"], cover: { file: "roman-holiday-1953.webp" },
  },
  {
    key: "green-book-2018",
    title: { "zh-CN": "绿皮书", "zh-TW": "幸福綠皮書", ja: "グリーンブック", en: "Green Book" },
    year: 2018, genres: ["coming-of-age", "romance", "road"], cover: { file: "green-book-2018.webp" },
  },
  {
    key: "catch-me-if-you-can-2002",
    title: { "zh-CN": "猫鼠游戏", "zh-TW": "神鬼交鋒", ja: "キャッチ・ミー・イフ・ユー・キャン", en: "Catch Me If You Can" },
    year: 2002, genres: ["coming-of-age", "mystery"], cover: { file: "catch-me-if-you-can-2002.webp" },
  },
  {
    key: "captain-america-the-first-avenger-2011",
    title: { "zh-CN": "美国队长", "zh-TW": "美國隊長", ja: "キャプテン・アメリカ/ザ・ファースト・アベンジャー", en: "Captain America: The First Avenger" },
    year: 2011, genres: ["action"], cover: { file: "captain-america-the-first-avenger-2011.webp" },
  },
  {
    key: "captain-america-the-winter-soldier-2014",
    title: { "zh-CN": "美国队长2：冬日战士", "zh-TW": "美國隊長2：酷寒戰士", ja: "キャプテン・アメリカ/ウィンター・ソルジャー", en: "Captain America: The Winter Soldier" },
    year: 2014, genres: ["action"], cover: { file: "captain-america-the-winter-soldier-2014.webp" },
  },
  {
    key: "captain-america-civil-war-2016",
    title: { "zh-CN": "美国队长3：内战", "zh-TW": "美國隊長3：英雄內戰", ja: "シビル・ウォー/キャプテン・アメリカ", en: "Captain America: Civil War" },
    year: 2016, genres: ["action"], cover: { file: "captain-america-civil-war-2016.webp" },
  },
  {
    key: "captain-america-brave-new-world-2025",
    title: { "zh-CN": "美国队长4：新世界", "zh-TW": "美國隊長：無畏新世界", ja: "キャプテン・アメリカ:ブレイブ・ニュー・ワールド", en: "Captain America: Brave New World" },
    year: 2025, genres: ["action"], cover: { file: "captain-america-brave-new-world-2025.webp" },
  },
  {
    key: "doctor-strange-2016",
    title: { "zh-CN": "奇异博士", "zh-TW": "奇異博士", ja: "ドクター・ストレンジ", en: "Doctor Strange" },
    year: 2016, genres: ["fantasy", "action"], cover: { file: "doctor-strange-2016.webp" },
  },
  {
    key: "ong-bak-muay-thai-warrior-2003",
    title: { "zh-CN": "拳霸", "zh-TW": "拳霸", ja: "マッハ!!!!!!!!", en: "Ong-Bak: Muay Thai Warrior" },
    year: 2003, genres: ["action"], cover: { file: "ong-bak-muay-thai-warrior-2003.webp" },
  },
  {
    key: "ong-bak-2-2008",
    title: { "zh-CN": "拳霸2", "zh-TW": "拳霸2", ja: "マッハ!弐", en: "Ong Bak 2" },
    year: 2008, genres: ["action"], cover: { file: "ong-bak-2-2008.webp" },
  },
  {
    key: "3-idiots-2009",
    title: { "zh-CN": "三傻大闹宝莱坞", "zh-TW": "三個傻瓜", ja: "きっと、うまくいく", en: "3 Idiots" },
    year: 2009, genres: ["coming-of-age", "life"], cover: { file: "3-idiots-2009.webp" },
  },
  {
    key: "the-shining-1980",
    title: { "zh-CN": "闪灵", "zh-TW": "鬼店", ja: "シャイニング", en: "The Shining" },
    year: 1980, genres: ["mystery"], cover: { file: "the-shining-1980.webp" },
  },
  {
    key: "the-social-network-2010",
    title: { "zh-CN": "社交网络", "zh-TW": "社群網戰", ja: "ソーシャル・ネットワーク", en: "The Social Network" },
    year: 2010, genres: ["sci-fi", "romance", "life"], cover: { file: "the-social-network-2010.webp" },
  },
  {
    key: "resident-evil-2002",
    title: { "zh-CN": "生化危机", "zh-TW": "惡靈古堡", ja: "バイオハザード", en: "Resident Evil" },
    year: 2002, genres: ["action", "mystery"], cover: { file: "resident-evil-2002.webp" },
  },
  {
    key: "resident-evil-apocalypse-2004",
    title: { "zh-CN": "生化危机2：启示录", "zh-TW": "惡靈古堡2：啟示錄", ja: "バイオハザードII アポカリプス", en: "Resident Evil: Apocalypse" },
    year: 2004, genres: ["action", "mystery"], cover: { file: "resident-evil-apocalypse-2004.webp" },
  },
  {
    key: "resident-evil-extinction-2007",
    title: { "zh-CN": "生化危机3：灭绝", "zh-TW": "惡靈古堡3：大滅絕", ja: "バイオハザードIII", en: "Resident Evil: Extinction" },
    year: 2007, genres: ["action", "mystery"], cover: { file: "resident-evil-extinction-2007.webp" },
  },
  {
    key: "resident-evil-afterlife-2010",
    title: { "zh-CN": "生化危机4：战神再生", "zh-TW": "惡靈古堡4：陰陽界", ja: "バイオハザードIV アフターライフ", en: "Resident Evil: Afterlife" },
    year: 2010, genres: ["action", "mystery"], cover: { file: "resident-evil-afterlife-2010.webp" },
  },
  {
    key: "resident-evil-retribution-2012",
    title: { "zh-CN": "生化危机5：惩罚", "zh-TW": "惡靈古堡5：天譴日", ja: "バイオハザードV リトリビューション", en: "Resident Evil: Retribution" },
    year: 2012, genres: ["action", "mystery"], cover: { file: "resident-evil-retribution-2012.webp" },
  },
  {
    key: "resident-evil-2026",
    title: { "zh-CN": "生化危机：爆发夜", "zh-TW": "惡靈古堡：爆發夜", ja: "バイオハザード", en: "Resident Evil" },
    year: 2026, genres: ["action", "mystery"], cover: { file: "resident-evil-2026.webp" },
  },
  {
    key: "resident-evil-welcome-to-raccoon-city-2021",
    title: { "zh-CN": "生化危机：欢迎来到浣熊市", "zh-TW": "惡靈古堡首部曲：拉昆市", ja: "バイオハザード: ウェルカム・トゥ・ラクーンシティ", en: "Resident Evil: Welcome to Raccoon City" },
    year: 2021, genres: ["action", "mystery"], cover: { file: "resident-evil-welcome-to-raccoon-city-2021.webp" },
  },
  {
    key: "resident-evil-the-final-chapter-2016",
    title: { "zh-CN": "生化危机：终章", "zh-TW": "惡靈古堡：最終章", ja: "バイオハザード: ザ・ファイナル", en: "Resident Evil: The Final Chapter" },
    year: 2016, genres: ["action", "mystery"], cover: { file: "resident-evil-the-final-chapter-2016.webp" },
  },
  {
    key: "free-guy-2021",
    title: { "zh-CN": "失控玩家", "zh-TW": "脫稿玩家", ja: "フリー・ガイ", en: "Free Guy" },
    year: 2021, genres: ["sci-fi", "fantasy"], cover: { file: "free-guy-2021.webp" },
  },
  {
    key: "insomnia-2002",
    title: { "zh-CN": "失眠症", "zh-TW": "針鋒相對", ja: "インソムニア", en: "Insomnia" },
    year: 2002, genres: ["mystery"], cover: { file: "insomnia-2002.webp" },
  },
  {
    key: "deadpool-2016",
    title: { "zh-CN": "死侍", "zh-TW": "惡棍英雄：死侍", ja: "デッドプール", en: "Deadpool" },
    year: 2016, genres: ["action"], cover: { file: "deadpool-2016.webp" },
  },
  {
    key: "deadpool-2-2018",
    title: { "zh-CN": "死侍2", "zh-TW": "死侍2", ja: "デッドプール2", en: "Deadpool 2" },
    year: 2018, genres: ["action"], cover: { file: "deadpool-2-2018.webp" },
  },
  {
    key: "deadpool-wolverine-2024",
    title: { "zh-CN": "死侍与金刚狼", "zh-TW": "死侍與金鋼狼", ja: "デッドプール&ウルヴァリン", en: "Deadpool & Wolverine" },
    year: 2024, genres: ["action"], cover: { file: "deadpool-wolverine-2024.webp" },
  },
  {
    key: "the-fast-and-the-furious-2001",
    title: { "zh-CN": "速度与激情", "zh-TW": "玩命關頭", ja: "ワイルド・スピード", en: "The Fast and the Furious" },
    year: 2001, genres: ["action"], cover: { file: "the-fast-and-the-furious-2001.webp" },
  },
  {
    key: "2-fast-2-furious-2003",
    title: { "zh-CN": "速度与激情2", "zh-TW": "玩命關頭2：飆風再起", ja: "ワイルド・スピードX2", en: "2 Fast 2 Furious" },
    year: 2003, genres: ["action"], cover: { file: "2-fast-2-furious-2003.webp" },
  },
  {
    key: "the-fast-and-the-furious-tokyo-drift-2006",
    title: { "zh-CN": "速度与激情3：东京漂移", "zh-TW": "玩命關頭3：東京甩尾", ja: "ワイルド・スピードX3 TOKYO DRIFT", en: "The Fast and the Furious: Tokyo Drift" },
    year: 2006, genres: ["action"], cover: { file: "the-fast-and-the-furious-tokyo-drift-2006.webp" },
  },
  {
    key: "fast-furious-2009",
    title: { "zh-CN": "速度与激情4", "zh-TW": "玩命關頭4", ja: "ワイルド・スピード MAX", en: "Fast & Furious" },
    year: 2009, genres: ["action"], cover: { file: "fast-furious-2009.webp" },
  },
  {
    key: "fast-five-2011",
    title: { "zh-CN": "速度与激情5", "zh-TW": "玩命關頭5", ja: "ワイルド・スピード MEGA MAX", en: "Fast Five" },
    year: 2011, genres: ["action"], cover: { file: "fast-five-2011.webp" },
  },
  {
    key: "fast-furious-6-2013",
    title: { "zh-CN": "速度与激情6", "zh-TW": "玩命關頭6", ja: "ワイルド・スピード EURO MISSION", en: "Fast & Furious 6" },
    year: 2013, genres: ["action"], cover: { file: "fast-furious-6-2013.webp" },
  },
  {
    key: "furious-7-2015",
    title: { "zh-CN": "速度与激情7", "zh-TW": "玩命關頭7", ja: "ワイルド・スピード SKY MISSION", en: "Furious 7" },
    year: 2015, genres: ["action"], cover: { file: "furious-7-2015.webp" },
  },
  {
    key: "the-fate-of-the-furious-2017",
    title: { "zh-CN": "速度与激情8", "zh-TW": "玩命關頭8", ja: "ワイルド・スピード ICE BREAK", en: "The Fate of the Furious" },
    year: 2017, genres: ["action"], cover: { file: "the-fate-of-the-furious-2017.webp" },
  },
  {
    key: "f9-2021",
    title: { "zh-CN": "速度与激情9", "zh-TW": "玩命關頭9", ja: "ワイルド・スピード/ジェットブレイク", en: "F9" },
    year: 2021, genres: ["action"], cover: { file: "f9-2021.webp" },
  },
  {
    key: "fast-x-2023",
    title: { "zh-CN": "速度与激情10", "zh-TW": "玩命關頭X", ja: "ワイルド・スピード/ファイヤーブースト", en: "Fast X" },
    year: 2023, genres: ["action"], cover: { file: "fast-x-2023.webp" },
  },
  {
    key: "fast-furious-presents-hobbs-shaw-2019",
    title: { "zh-CN": "速度与激情：特别行动", "zh-TW": "玩命關頭：特別行動", ja: "ワイルド・スピード/スーパーコンボ", en: "Fast & Furious Presents: Hobbs & Shaw" },
    year: 2019, genres: ["action"], cover: { file: "fast-furious-presents-hobbs-shaw-2019.webp" },
  },
  {
    key: "titanic-1997",
    title: { "zh-CN": "泰坦尼克号", "zh-TW": "鐵達尼號", ja: "タイタニック", en: "Titanic" },
    year: 1997, genres: ["romance"], cover: { file: "titanic-1997.webp" },
  },
  {
    key: "ready-player-one-2018",
    title: { "zh-CN": "头号玩家", "zh-TW": "一級玩家", ja: "レディ・プレイヤー1", en: "Ready Player One" },
    year: 2018, genres: ["sci-fi", "fantasy"], cover: { file: "ready-player-one-2018.webp" },
  },
  {
    key: "the-shawshank-redemption-1994",
    title: { "zh-CN": "肖申克的救赎", "zh-TW": "刺激1995", ja: "ショーシャンクの空に", en: "The Shawshank Redemption" },
    year: 1994, genres: ["road", "life"], cover: { file: "the-shawshank-redemption-1994.webp" },
  },
  {
    key: "interstellar-2014",
    title: { "zh-CN": "星际穿越", "zh-TW": "星際效應", ja: "インターステラー", en: "Interstellar" },
    year: 2014, genres: ["sci-fi"], cover: { file: "interstellar-2014.webp" },
  },
  {
    key: "tenet-2020",
    title: { "zh-CN": "信条", "zh-TW": "TENET天能", ja: "TENET テネット", en: "Tenet" },
    year: 2020, genres: ["sci-fi", "action"], cover: { file: "tenet-2020.webp" },
  },
  {
    key: "coco-2017",
    title: { "zh-CN": "寻梦环游记", "zh-TW": "可可夜總會", ja: "リメンバー・ミー", en: "Coco" },
    year: 2017, genres: ["music", "romance"], cover: { file: "coco-2017.webp" },
  },
  {
    key: "ip-man-2008",
    title: { "zh-CN": "叶问", "zh-TW": "葉問", ja: "イップ・マン 序章", en: "Ip Man" },
    year: 2008, genres: ["coming-of-age", "action"], cover: { file: "ip-man-2008.webp" },
  },
  {
    key: "ip-man-2-2010",
    title: { "zh-CN": "叶问2：宗师传奇", "zh-TW": "葉問2", ja: "イップ・マン 葉問", en: "Ip Man 2" },
    year: 2010, genres: ["coming-of-age", "action"], cover: { file: "ip-man-2-2010.webp" },
  },
  {
    key: "ip-man-3-2015",
    title: { "zh-CN": "叶问3", "zh-TW": "葉問3", ja: "イップ・マン 継承", en: "Ip Man 3" },
    year: 2015, genres: ["coming-of-age", "action"], cover: { file: "ip-man-3-2015.webp" },
  },
  {
    key: "ip-man-4-the-finale-2019",
    title: { "zh-CN": "叶问4：完结篇", "zh-TW": "葉問4：完結篇", ja: "イップ・マン 完結", en: "Ip Man 4: The Finale" },
    year: 2019, genres: ["coming-of-age", "action"], cover: { file: "ip-man-4-the-finale-2019.webp" },
  },
  {
    key: "the-maze-runner-2014",
    title: { "zh-CN": "移动迷宫", "zh-TW": "移動迷宮", ja: "メイズ・ランナー", en: "The Maze Runner" },
    year: 2014, genres: ["coming-of-age", "sci-fi"], cover: { file: "the-maze-runner-2014.webp" },
  },
  {
    key: "guardians-of-the-galaxy-2014",
    title: { "zh-CN": "银河护卫队", "zh-TW": "星際異攻隊", ja: "ガーディアンズ・オブ・ギャラクシー", en: "Guardians of the Galaxy" },
    year: 2014, genres: ["sci-fi", "action"], cover: { file: "guardians-of-the-galaxy-2014.webp" },
  },
  {
    key: "guardians-of-the-galaxy-vol-2-2017",
    title: { "zh-CN": "银河护卫队2", "zh-TW": "星際異攻隊2", ja: "ガーディアンズ・オブ・ギャラクシー:リミックス", en: "Guardians of the Galaxy Vol. 2" },
    year: 2017, genres: ["sci-fi", "action"], cover: { file: "guardians-of-the-galaxy-vol-2-2017.webp" },
  },
  {
    key: "guardians-of-the-galaxy-vol-3-2023",
    title: { "zh-CN": "银河护卫队3", "zh-TW": "星際異攻隊3", ja: "ガーディアンズ・オブ・ギャラクシー:VOLUME 3", en: "Guardians of the Galaxy Vol. 3" },
    year: 2023, genres: ["sci-fi", "action"], cover: { file: "guardians-of-the-galaxy-vol-3-2023.webp" },
  },
  {
    key: "ant-man-2015",
    title: { "zh-CN": "蚁人", "zh-TW": "蟻人", ja: "アントマン", en: "Ant-Man" },
    year: 2015, genres: ["sci-fi", "action"], cover: { file: "ant-man-2015.webp" },
  },
  {
    key: "ant-man-and-the-wasp-2018",
    title: { "zh-CN": "蚁人2：黄蜂女现身", "zh-TW": "蟻人與黃蜂女", ja: "アントマン&ワスプ", en: "Ant-Man and the Wasp" },
    year: 2018, genres: ["sci-fi", "action"], cover: { file: "ant-man-and-the-wasp-2018.webp" },
  },
  {
    key: "ant-man-and-the-wasp-quantumania-2023",
    title: { "zh-CN": "蚁人3：量子狂潮", "zh-TW": "蟻人與黃蜂女：量子狂熱", ja: "アントマン&ワスプ:クアントマニア", en: "Ant-Man and the Wasp: Quantumania" },
    year: 2023, genres: ["sci-fi", "action"], cover: { file: "ant-man-and-the-wasp-quantumania-2023.webp" },
  },
  {
    key: "jumanji-1995",
    title: { "zh-CN": "勇敢者的游戏", "zh-TW": "野蠻遊戲", ja: "ジュマンジ", en: "Jumanji" },
    year: 1995, genres: ["fantasy"], cover: { file: "jumanji-1995.webp" },
  },
  {
    key: "jumanji-welcome-to-the-jungle-2017",
    title: { "zh-CN": "勇敢者游戏：决战丛林", "zh-TW": "野蠻遊戲：瘋狂叢林", ja: "ジュマンジ/ウェルカム・トゥ・ジャングル", en: "Jumanji: Welcome to the Jungle" },
    year: 2017, genres: ["fantasy"], cover: { file: "jumanji-welcome-to-the-jungle-2017.webp" },
  },
  {
    key: "the-prestige-2006",
    title: { "zh-CN": "致命魔术", "zh-TW": "頂尖對決", ja: "プレステージ", en: "The Prestige" },
    year: 2006, genres: ["mystery"], cover: { file: "the-prestige-2006.webp" },
  },
  {
    key: "spider-man-2002",
    title: { "zh-CN": "蜘蛛侠", "zh-TW": "蜘蛛人", ja: "スパイダーマン", en: "Spider-Man" },
    year: 2002, genres: ["coming-of-age", "action"], cover: { file: "spider-man-2002.webp" },
  },
  {
    key: "spider-man-2-2004",
    title: { "zh-CN": "蜘蛛侠2", "zh-TW": "蜘蛛人2", ja: "スパイダーマン2", en: "Spider-Man 2" },
    year: 2004, genres: ["coming-of-age", "action"], cover: { file: "spider-man-2-2004.webp" },
  },
  {
    key: "spider-man-3-2007",
    title: { "zh-CN": "蜘蛛侠3", "zh-TW": "蜘蛛人3", ja: "スパイダーマン3", en: "Spider-Man 3" },
    year: 2007, genres: ["coming-of-age", "action"], cover: { file: "spider-man-3-2007.webp" },
  },
  {
    key: "spider-man-homecoming-2017",
    title: { "zh-CN": "蜘蛛侠：英雄归来", "zh-TW": "蜘蛛人：返校日", ja: "スパイダーマン:ホームカミング", en: "Spider-Man: Homecoming" },
    year: 2017, genres: ["coming-of-age", "action"], cover: { file: "spider-man-homecoming-2017.webp" },
  },
  {
    key: "spider-man-no-way-home-2021",
    title: { "zh-CN": "蜘蛛侠：英雄无归", "zh-TW": "蜘蛛人：無家日", ja: "スパイダーマン:ノー・ウェイ・ホーム", en: "Spider-Man: No Way Home" },
    year: 2021, genres: ["coming-of-age", "action"], cover: { file: "spider-man-no-way-home-2021.webp" },
  },
  {
    key: "spider-man-far-from-home-2019",
    title: { "zh-CN": "蜘蛛侠：英雄远征", "zh-TW": "蜘蛛人：離家日", ja: "スパイダーマン:ファー・フロム・ホーム", en: "Spider-Man: Far From Home" },
    year: 2019, genres: ["coming-of-age", "action"], cover: { file: "spider-man-far-from-home-2019.webp" },
  },
  {
    key: "spider-man-brand-new-day-2026",
    title: { "zh-CN": "蜘蛛侠：崭新之日", "zh-TW": "蜘蛛人：重生日", ja: "スパイダーマン:ブランド・ニュー・デイ", en: "Spider-Man: Brand New Day" },
    year: 2026, genres: ["coming-of-age", "action"], cover: { file: "spider-man-brand-new-day-2026.webp" },
  },
  {
    key: "the-terminator-1984",
    title: { "zh-CN": "终结者", "zh-TW": "魔鬼終結者", ja: "ターミネーター", en: "The Terminator" },
    year: 1984, genres: ["sci-fi", "action"], cover: { file: "the-terminator-1984.webp" },
  },
  {
    key: "terminator-2-judgment-day-1991",
    title: { "zh-CN": "终结者2：审判日", "zh-TW": "魔鬼終結者2", ja: "ターミネーター2", en: "Terminator 2: Judgment Day" },
    year: 1991, genres: ["sci-fi", "action"], cover: { file: "terminator-2-judgment-day-1991.webp" },
  },
  {
    key: "terminator-3-rise-of-the-machines-2003",
    title: { "zh-CN": "终结者3", "zh-TW": "魔鬼終結者3", ja: "ターミネーター3", en: "Terminator 3: Rise of the Machines" },
    year: 2003, genres: ["sci-fi", "action"], cover: { file: "terminator-3-rise-of-the-machines-2003.webp" },
  },
  {
    key: "terminator-salvation-2009",
    title: { "zh-CN": "终结者2018", "zh-TW": "魔鬼終結者：未來救贖", ja: "ターミネーター4", en: "Terminator Salvation" },
    year: 2009, genres: ["sci-fi", "action"], cover: { file: "terminator-salvation-2009.webp" },
  },
  {
    key: "terminator-genisys-2015",
    title: { "zh-CN": "终结者：创世纪", "zh-TW": "魔鬼終結者：創世契機", ja: "ターミネーター:新起動/ジェニシス", en: "Terminator Genisys" },
    year: 2015, genres: ["sci-fi", "action"], cover: { file: "terminator-genisys-2015.webp" },
  },
  {
    key: "terminator-dark-fate-2019",
    title: { "zh-CN": "终结者：黑暗命运", "zh-TW": "魔鬼終結者：黑暗宿命", ja: "ターミネーター:ニュー・フェイト", en: "Terminator: Dark Fate" },
    year: 2019, genres: ["sci-fi", "action"], cover: { file: "terminator-dark-fate-2019.webp" },
  },
  {
    key: "top-gun-1986",
    title: { "zh-CN": "壮志凌云", "zh-TW": "捍衛戰士", ja: "トップガン", en: "Top Gun" },
    year: 1986, genres: ["coming-of-age", "action"], cover: { file: "top-gun-1986.webp" },
  },
  {
    key: "top-gun-maverick-2022",
    title: { "zh-CN": "壮志凌云2：独行侠", "zh-TW": "捍衛戰士：獨行俠", ja: "トップガン マーヴェリック", en: "Top Gun: Maverick" },
    year: 2022, genres: ["coming-of-age", "action"], cover: { file: "top-gun-maverick-2022.webp" },
  },
  {
    key: "following-1998",
    title: { "zh-CN": "追随", "zh-TW": "跟蹤", ja: "フォロウィング", en: "Following" },
    year: 1998, genres: ["mystery"], cover: { file: "following-1998.webp" },
  },
  {
    key: "jurassic-park-1993",
    title: { "zh-CN": "侏罗纪公园", "zh-TW": "侏羅紀公園", ja: "ジュラシック・パーク", en: "Jurassic Park" },
    year: 1993, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-park-1993.webp" },
  },
  {
    key: "the-lost-world-jurassic-park-1997",
    title: { "zh-CN": "侏罗纪公园2：失落的世界", "zh-TW": "侏羅紀公園：失落的世界", ja: "ロスト・ワールド/ジュラシック・パーク", en: "The Lost World: Jurassic Park" },
    year: 1997, genres: ["sci-fi", "fantasy"], cover: { file: "the-lost-world-jurassic-park-1997.webp" },
  },
  {
    key: "jurassic-park-iii-2001",
    title: { "zh-CN": "侏罗纪公园3", "zh-TW": "侏羅紀公園3", ja: "ジュラシック・パークIII", en: "Jurassic Park III" },
    year: 2001, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-park-iii-2001.webp" },
  },
  {
    key: "jurassic-world-2015",
    title: { "zh-CN": "侏罗纪世界", "zh-TW": "侏羅紀世界", ja: "ジュラシック・ワールド", en: "Jurassic World" },
    year: 2015, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-world-2015.webp" },
  },
  {
    key: "jurassic-world-fallen-kingdom-2018",
    title: { "zh-CN": "侏罗纪世界2", "zh-TW": "侏羅紀世界：殞落國度", ja: "ジュラシック・ワールド/炎の王国", en: "Jurassic World: Fallen Kingdom" },
    year: 2018, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-world-fallen-kingdom-2018.webp" },
  },
  {
    key: "jurassic-world-dominion-2022",
    title: { "zh-CN": "侏罗纪世界3", "zh-TW": "侏羅紀世界：統霸天下", ja: "ジュラシック・ワールド/新たなる支配者", en: "Jurassic World Dominion" },
    year: 2022, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-world-dominion-2022.webp" },
  },
  {
    key: "jurassic-world-rebirth-2025",
    title: { "zh-CN": "侏罗纪世界：重生", "zh-TW": "侏羅紀世界：重生", ja: "ジュラシック・ワールド/復活の大地", en: "Jurassic World Rebirth" },
    year: 2025, genres: ["sci-fi", "fantasy"], cover: { file: "jurassic-world-rebirth-2025.webp" },
  },
];

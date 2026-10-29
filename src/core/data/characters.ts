// Owner-selected characters, preserving the requested order within each addition.
// Artwork provenance and crop records: public/characters/ASSETS.json.
const characters = [
  {
    "key": "sakura-matou",
    "title": {
      "zh-CN": "间桐樱",
      "zh-TW": "間桐櫻",
      "ja": "間桐桜",
      "en": "Sakura Matou"
    },
    "work": {
      "zh-CN": "Fate/stay night",
      "zh-TW": "Fate/stay night",
      "ja": "Fate/stay night",
      "en": "Fate/stay night"
    },
    "path": "/characters/sakura-matou.webp"
  },
  {
    "key": "saber",
    "title": {
      "zh-CN": "Saber",
      "zh-TW": "Saber",
      "ja": "セイバー",
      "en": "Saber"
    },
    "work": {
      "zh-CN": "Fate/stay night",
      "zh-TW": "Fate/stay night",
      "ja": "Fate/stay night",
      "en": "Fate/stay night"
    },
    "path": "/characters/saber.webp"
  },
  {
    "key": "archer",
    "title": {
      "zh-CN": "Archer",
      "zh-TW": "Archer",
      "ja": "アーチャー",
      "en": "Archer"
    },
    "work": {
      "zh-CN": "Fate/stay night",
      "zh-TW": "Fate/stay night",
      "ja": "Fate/stay night",
      "en": "Fate/stay night"
    },
    "path": "/characters/archer.webp"
  },
  {
    "key": "rin-tohsaka",
    "title": {
      "zh-CN": "远坂凛",
      "zh-TW": "遠坂凜",
      "ja": "遠坂凛",
      "en": "Rin Tohsaka"
    },
    "work": {
      "zh-CN": "Fate/stay night",
      "zh-TW": "Fate/stay night",
      "ja": "Fate/stay night",
      "en": "Fate/stay night"
    },
    "path": "/characters/rin-tohsaka.webp"
  },
  {
    "key": "aoko",
    "title": {
      "zh-CN": "苍崎青子",
      "zh-TW": "蒼崎青子",
      "ja": "蒼崎青子",
      "en": "Aoko Aozaki"
    },
    "work": {
      "zh-CN": "魔法使之夜",
      "zh-TW": "魔法使之夜",
      "ja": "魔法使いの夜",
      "en": "Witch on the Holy Night"
    },
    "path": "/characters/aoko.webp"
  },
  {
    "key": "alice",
    "title": {
      "zh-CN": "久远寺有珠",
      "zh-TW": "久遠寺有珠",
      "ja": "久遠寺有珠",
      "en": "Alice Kuonji"
    },
    "work": {
      "zh-CN": "魔法使之夜",
      "zh-TW": "魔法使之夜",
      "ja": "魔法使いの夜",
      "en": "Witch on the Holy Night"
    },
    "path": "/characters/alice.webp"
  },
  {
    "key": "shiki",
    "title": {
      "zh-CN": "两仪式",
      "zh-TW": "兩儀式",
      "ja": "両儀式",
      "en": "Shiki Ryougi"
    },
    "work": {
      "zh-CN": "空之境界",
      "zh-TW": "空之境界",
      "ja": "空の境界",
      "en": "The Garden of Sinners"
    },
    "path": "/characters/shiki.webp"
  },
  {
    "key": "mimi",
    "title": {
      "zh-CN": "美美",
      "zh-TW": "美美",
      "ja": "ミミ",
      "en": "Mimi"
    },
    "work": {
      "zh-CN": "与你相恋到生命尽头",
      "zh-TW": "與你相戀到生命盡頭",
      "ja": "きみが死ぬまで恋をしたい",
      "en": "I Want to Love You Till Your Dying Day"
    },
    "path": "/characters/mimi.webp"
  },
  {
    "key": "sheena",
    "title": {
      "zh-CN": "席娜",
      "zh-TW": "席娜",
      "ja": "シーナ",
      "en": "Sheena"
    },
    "work": {
      "zh-CN": "与你相恋到生命尽头",
      "zh-TW": "與你相戀到生命盡頭",
      "ja": "きみが死ぬまで恋をしたい",
      "en": "I Want to Love You Till Your Dying Day"
    },
    "path": "/characters/sheena.webp"
  },
  {
    "key": "frieren",
    "title": {
      "zh-CN": "芙莉莲",
      "zh-TW": "芙莉蓮",
      "ja": "フリーレン",
      "en": "Frieren"
    },
    "work": {
      "zh-CN": "葬送的芙莉莲",
      "zh-TW": "葬送的芙莉蓮",
      "ja": "葬送のフリーレン",
      "en": "Frieren: Beyond Journey’s End"
    },
    "path": "/characters/frieren.webp"
  },
  {
    "key": "fern",
    "title": {
      "zh-CN": "菲伦",
      "zh-TW": "費倫",
      "ja": "フェルン",
      "en": "Fern"
    },
    "work": {
      "zh-CN": "葬送的芙莉莲",
      "zh-TW": "葬送的芙莉蓮",
      "ja": "葬送のフリーレン",
      "en": "Frieren: Beyond Journey’s End"
    },
    "path": "/characters/fern.webp"
  },
  {
    "key": "ak-shu",
    "title": {
      "zh-CN": "黍",
      "zh-TW": "黍",
      "ja": "シュウ",
      "en": "Shu"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-shu.webp"
  },
  {
    "key": "ak-wang",
    "title": {
      "zh-CN": "望",
      "zh-TW": "望",
      "ja": "ウァン",
      "en": "Wang"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-wang.webp"
  },
  {
    "key": "ak-civilight-eterna",
    "title": {
      "zh-CN": "魔王（特蕾西娅）",
      "zh-TW": "魔王（特蕾西婭）",
      "ja": "シヴィライト・エテルナ（テレジア）",
      "en": "Civilight Eterna (Theresa)"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-civilight-eterna.webp"
  },
  {
    "key": "ak-wisadel",
    "title": {
      "zh-CN": "维什戴尔",
      "zh-TW": "維什戴爾",
      "ja": "ウィシャデル",
      "en": "Wiš'adel"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-wisadel.webp"
  },
  {
    "key": "ak-texas-omertosa",
    "title": {
      "zh-CN": "缄默德克萨斯",
      "zh-TW": "緘默德克薩斯",
      "ja": "血掟テキサス",
      "en": "Texas the Omertosa"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-texas-omertosa.webp"
  },
  {
    "key": "ak-dusk",
    "title": {
      "zh-CN": "夕",
      "zh-TW": "夕",
      "ja": "シー",
      "en": "Dusk"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-dusk.webp"
  },
  {
    "key": "ak-nian",
    "title": {
      "zh-CN": "年",
      "zh-TW": "年",
      "ja": "ニェン",
      "en": "Nian"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-nian.webp"
  },
  {
    "key": "ak-eyjafjalla",
    "title": {
      "zh-CN": "艾雅法拉",
      "zh-TW": "艾雅法拉",
      "ja": "エイヤフィヤトラ",
      "en": "Eyjafjalla"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-eyjafjalla.webp"
  },
  {
    "key": "ak-hoshiguma-breacher",
    "title": {
      "zh-CN": "斩业星熊",
      "zh-TW": "斬業星熊",
      "ja": "斬業ホシグマ",
      "en": "Hoshiguma the Breacher"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-hoshiguma-breacher.webp"
  },
  {
    "key": "ak-chen-dawnstreak",
    "title": {
      "zh-CN": "赤刃明霄陈",
      "zh-TW": "赤刃明霄陳",
      "ja": "赤刃明霄チェン",
      "en": "Ch'en the Dawnstreak"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-chen-dawnstreak.webp"
  },
  {
    "key": "ak-mon3tr",
    "title": {
      "zh-CN": "Mon3tr",
      "zh-TW": "Mon3tr",
      "ja": "Mon3tr",
      "en": "Mon3tr"
    },
    "work": {
      "zh-CN": "明日方舟",
      "zh-TW": "明日方舟",
      "ja": "アークナイツ",
      "en": "Arknights"
    },
    "path": "/characters/ak-mon3tr.webp"
  },
  {
    "key": "ren-amamiya",
    "title": {
      "zh-CN": "雨宫莲",
      "zh-TW": "雨宮蓮",
      "ja": "雨宮 蓮",
      "en": "Ren Amamiya"
    },
    "work": {
      "zh-CN": "女神异闻录5 皇家版",
      "zh-TW": "女神異聞錄5 皇家版",
      "ja": "ペルソナ5 ザ・ロイヤル",
      "en": "Persona 5 Royal"
    },
    "path": "/characters/ren-amamiya.webp"
  },
  {
    "key": "futaba-sakura",
    "title": {
      "zh-CN": "佐仓双叶",
      "zh-TW": "佐倉雙葉",
      "ja": "佐倉 双葉",
      "en": "Futaba Sakura"
    },
    "work": {
      "zh-CN": "女神异闻录5 皇家版",
      "zh-TW": "女神異聞錄5 皇家版",
      "ja": "ペルソナ5 ザ・ロイヤル",
      "en": "Persona 5 Royal"
    },
    "path": "/characters/futaba-sakura.webp"
  },
  {
    "key": "makoto-yuki",
    "title": {
      "zh-CN": "结城理",
      "zh-TW": "結城理",
      "ja": "結城 理",
      "en": "Makoto Yuki"
    },
    "work": {
      "zh-CN": "女神异闻录3 Reload",
      "zh-TW": "女神異聞錄3 Reload",
      "ja": "ペルソナ3 リロード",
      "en": "Persona 3 Reload"
    },
    "path": "/characters/makoto-yuki.webp"
  },
  {
    "key": "ef-zhuang-fangyi",
    "title": {
      "zh-CN": "庄方宜",
      "zh-TW": "莊方宜",
      "ja": "ゾアン・ファンイ",
      "en": "Zhuang Fangyi"
    },
    "work": {
      "zh-CN": "明日方舟：终末地",
      "zh-TW": "明日方舟：終末地",
      "ja": "アークナイツ：エンドフィールド",
      "en": "Arknights: Endfield"
    },
    "path": "/characters/ef-zhuang-fangyi.webp"
  },
  {
    "key": "ef-laevatain",
    "title": {
      "zh-CN": "莱万汀",
      "zh-TW": "萊萬汀",
      "ja": "レーヴァテイン",
      "en": "Laevatain"
    },
    "work": {
      "zh-CN": "明日方舟：终末地",
      "zh-TW": "明日方舟：終末地",
      "ja": "アークナイツ：エンドフィールド",
      "en": "Arknights: Endfield"
    },
    "path": "/characters/ef-laevatain.webp"
  },
  {
    "key": "ef-rossi",
    "title": {
      "zh-CN": "洛茜",
      "zh-TW": "洛茜",
      "ja": "ロッシ",
      "en": "Rossi"
    },
    "work": {
      "zh-CN": "明日方舟：终末地",
      "zh-TW": "明日方舟：終末地",
      "ja": "アークナイツ：エンドフィールド",
      "en": "Arknights: Endfield"
    },
    "path": "/characters/ef-rossi.webp"
  },
  {
    "key": "arcueid",
    "title": {
      "zh-CN": "爱尔奎特",
      "zh-TW": "愛爾奎特",
      "ja": "アルクェイド",
      "en": "Arcueid Brunestud"
    },
    "work": {
      "zh-CN": "月姬",
      "zh-TW": "月姬",
      "ja": "月姫",
      "en": "Tsukihime"
    },
    "path": "/characters/arcueid.webp"
  },
  {
    "key": "iroha",
    "title": {
      "zh-CN": "酒寄彩叶",
      "zh-TW": "酒寄彩葉",
      "ja": "酒寄彩葉",
      "en": "Iroha Sakayori"
    },
    "work": {
      "zh-CN": "超时空辉夜姬！",
      "zh-TW": "超時空輝夜姬！",
      "ja": "超かぐや姫！",
      "en": "Cosmic Princess Kaguya!"
    },
    "path": "/characters/iroha.webp"
  },
  {
    "key": "kaguya",
    "title": {
      "zh-CN": "辉夜姬",
      "zh-TW": "輝夜姬",
      "ja": "かぐや",
      "en": "Kaguya"
    },
    "work": {
      "zh-CN": "超时空辉夜姬！",
      "zh-TW": "超時空輝夜姬！",
      "ja": "超かぐや姫！",
      "en": "Cosmic Princess Kaguya!"
    },
    "path": "/characters/kaguya.webp"
  },
  {
    "key": "yachiyo",
    "title": {
      "zh-CN": "月见八千代",
      "zh-TW": "月見八千代",
      "ja": "月見ヤチヨ",
      "en": "Yachiyo Runami"
    },
    "work": {
      "zh-CN": "超时空辉夜姬！",
      "zh-TW": "超時空輝夜姬！",
      "ja": "超かぐや姫！",
      "en": "Cosmic Princess Kaguya!"
    },
    "path": "/characters/yachiyo.webp"
  },
  {
    "key": "chisato",
    "title": {
      "zh-CN": "锦木千束",
      "zh-TW": "錦木千束",
      "ja": "錦木千束",
      "en": "Chisato Nishikigi"
    },
    "work": {
      "zh-CN": "莉可丽丝",
      "zh-TW": "莉可麗絲",
      "ja": "リコリス・リコイル",
      "en": "Lycoris Recoil"
    },
    "path": "/characters/chisato.webp"
  },
  {
    "key": "takina",
    "title": {
      "zh-CN": "井上泷奈",
      "zh-TW": "井之上瀧奈",
      "ja": "井ノ上たきな",
      "en": "Takina Inoue"
    },
    "work": {
      "zh-CN": "莉可丽丝",
      "zh-TW": "莉可麗絲",
      "ja": "リコリス・リコイル",
      "en": "Lycoris Recoil"
    },
    "path": "/characters/takina.webp"
  },
  {
    "key": "mahiru",
    "title": {
      "zh-CN": "椎名真昼",
      "zh-TW": "椎名真晝",
      "ja": "椎名真昼",
      "en": "Mahiru Shiina"
    },
    "work": {
      "zh-CN": "邻家的天使大人",
      "zh-TW": "鄰家的天使大人",
      "ja": "お隣の天使様にいつの間にか駄目人間にされていた件",
      "en": "The Angel Next Door Spoils Me Rotten"
    },
    "path": "/characters/mahiru.webp"
  },
  {
    "key": "yui-hirasawa",
    "title": {
      "zh-CN": "平泽唯",
      "zh-TW": "平澤唯",
      "ja": "平沢唯",
      "en": "Yui Hirasawa"
    },
    "work": {
      "zh-CN": "轻音少女",
      "zh-TW": "K-ON! 輕音部",
      "ja": "けいおん！",
      "en": "K-On!"
    },
    "path": "/characters/yui-hirasawa.webp"
  },
  {
    "key": "mio-akiyama",
    "title": {
      "zh-CN": "秋山澪",
      "zh-TW": "秋山澪",
      "ja": "秋山澪",
      "en": "Mio Akiyama"
    },
    "work": {
      "zh-CN": "轻音少女",
      "zh-TW": "K-ON! 輕音部",
      "ja": "けいおん！",
      "en": "K-On!"
    },
    "path": "/characters/mio-akiyama.webp"
  },
  {
    "key": "azusa-nakano",
    "title": {
      "zh-CN": "中野梓",
      "zh-TW": "中野梓",
      "ja": "中野梓",
      "en": "Azusa Nakano"
    },
    "work": {
      "zh-CN": "轻音少女",
      "zh-TW": "K-ON! 輕音部",
      "ja": "けいおん！",
      "en": "K-On!"
    },
    "path": "/characters/azusa-nakano.webp"
  },
  {
    "key": "violet-evergarden",
    "title": {
      "zh-CN": "薇尔莉特",
      "zh-TW": "薇爾莉特",
      "ja": "ヴァイオレット・エヴァーガーデン",
      "en": "Violet Evergarden"
    },
    "work": {
      "zh-CN": "紫罗兰永恒花园",
      "zh-TW": "紫羅蘭永恆花園",
      "ja": "ヴァイオレット・エヴァーガーデン",
      "en": "Violet Evergarden"
    },
    "path": "/characters/violet-evergarden.webp"
  },
  {
    "key": "rintaro-okabe",
    "title": {
      "zh-CN": "冈部伦太郎",
      "zh-TW": "岡部倫太郎",
      "ja": "岡部倫太郎",
      "en": "Rintaro Okabe"
    },
    "work": {
      "zh-CN": "命运石之门",
      "zh-TW": "命運石之門",
      "ja": "シュタインズ・ゲート",
      "en": "Steins;Gate"
    },
    "path": "/characters/rintaro-okabe.webp"
  },
  {
    "key": "kurisu-makise",
    "title": {
      "zh-CN": "牧濑红莉栖",
      "zh-TW": "牧瀨紅莉栖",
      "ja": "牧瀬紅莉栖",
      "en": "Kurisu Makise"
    },
    "work": {
      "zh-CN": "命运石之门",
      "zh-TW": "命運石之門",
      "ja": "シュタインズ・ゲート",
      "en": "Steins;Gate"
    },
    "path": "/characters/kurisu-makise.webp"
  },
  {
    "key": "david-martinez",
    "title": {
      "zh-CN": "大卫·马丁内斯",
      "zh-TW": "大衛・馬丁尼茲",
      "ja": "デイビッド・マルティネス",
      "en": "David Martinez"
    },
    "work": {
      "zh-CN": "赛博朋克：边缘行者",
      "zh-TW": "電馭叛客：邊緣行者",
      "ja": "サイバーパンク エッジランナーズ",
      "en": "Cyberpunk: Edgerunners"
    },
    "path": "/characters/david-martinez.webp"
  },
  {
    "key": "rebecca",
    "title": {
      "zh-CN": "丽贝卡",
      "zh-TW": "蕾貝卡",
      "ja": "レベッカ",
      "en": "Rebecca"
    },
    "work": {
      "zh-CN": "赛博朋克：边缘行者",
      "zh-TW": "電馭叛客：邊緣行者",
      "ja": "サイバーパンク エッジランナーズ",
      "en": "Cyberpunk: Edgerunners"
    },
    "path": "/characters/rebecca.webp"
  },
  {
    "key": "kirito",
    "title": {
      "zh-CN": "桐人",
      "zh-TW": "桐人",
      "ja": "キリト",
      "en": "Kirito"
    },
    "work": {
      "zh-CN": "刀剑神域",
      "zh-TW": "刀劍神域",
      "ja": "ソードアート・オンライン",
      "en": "Sword Art Online"
    },
    "path": "/characters/kirito.webp"
  },
  {
    "key": "asuna",
    "title": {
      "zh-CN": "亚丝娜",
      "zh-TW": "亞絲娜",
      "ja": "アスナ",
      "en": "Asuna"
    },
    "work": {
      "zh-CN": "刀剑神域",
      "zh-TW": "刀劍神域",
      "ja": "ソードアート・オンライン",
      "en": "Sword Art Online"
    },
    "path": "/characters/asuna.webp"
  },
  {
    "key": "yukino-yukinoshita",
    "title": {
      "zh-CN": "雪之下雪乃",
      "zh-TW": "雪之下雪乃",
      "ja": "雪ノ下雪乃",
      "en": "Yukino Yukinoshita"
    },
    "work": {
      "zh-CN": "我的青春恋爱物语果然有问题。",
      "zh-TW": "果然我的青春戀愛喜劇搞錯了。",
      "ja": "やはり俺の青春ラブコメはまちがっている。",
      "en": "My Teen Romantic Comedy SNAFU"
    },
    "path": "/characters/yukino-yukinoshita.webp"
  },
  {
    "key": "sora-ngnl",
    "title": {
      "zh-CN": "空",
      "zh-TW": "空",
      "ja": "空",
      "en": "Sora"
    },
    "work": {
      "zh-CN": "游戏人生",
      "zh-TW": "NO GAME NO LIFE 遊戲人生",
      "ja": "ノーゲーム・ノーライフ",
      "en": "No Game No Life"
    },
    "path": "/characters/sora-ngnl.webp"
  },
  {
    "key": "shiro-ngnl",
    "title": {
      "zh-CN": "白",
      "zh-TW": "白",
      "ja": "白",
      "en": "Shiro"
    },
    "work": {
      "zh-CN": "游戏人生",
      "zh-TW": "NO GAME NO LIFE 遊戲人生",
      "ja": "ノーゲーム・ノーライフ",
      "en": "No Game No Life"
    },
    "path": "/characters/shiro-ngnl.webp"
  },
  {
    "key": "elaina",
    "title": {
      "zh-CN": "伊蕾娜",
      "zh-TW": "伊蕾娜",
      "ja": "イレイナ",
      "en": "Elaina"
    },
    "work": {
      "zh-CN": "魔女之旅",
      "zh-TW": "魔女之旅",
      "ja": "魔女の旅々",
      "en": "Wandering Witch: The Journey of Elaina"
    },
    "path": "/characters/elaina.webp"
  },
  {
    "key": "atri",
    "title": {
      "zh-CN": "亚托莉",
      "zh-TW": "亞托莉",
      "ja": "アトリ",
      "en": "Atri"
    },
    "work": {
      "zh-CN": "ATRI -My Dear Moments-",
      "zh-TW": "ATRI -My Dear Moments-",
      "ja": "ATRI -My Dear Moments-",
      "en": "ATRI -My Dear Moments-"
    },
    "path": "/characters/atri.webp"
  },
  {
    "key": "megumin",
    "title": {
      "zh-CN": "惠惠",
      "zh-TW": "惠惠",
      "ja": "めぐみん",
      "en": "Megumin"
    },
    "work": {
      "zh-CN": "为美好的世界献上爆焰！",
      "zh-TW": "為美好的世界獻上爆焰！",
      "ja": "この素晴らしい世界に爆焔を！",
      "en": "KonoSuba: An Explosion on This Wonderful World!"
    },
    "path": "/characters/megumin.webp"
  },
  {
    "key": "sora-kasugano",
    "title": {
      "zh-CN": "春日野穹",
      "zh-TW": "春日野穹",
      "ja": "春日野穹",
      "en": "Sora Kasugano"
    },
    "work": {
      "zh-CN": "缘之空",
      "zh-TW": "緣之空",
      "ja": "ヨスガノソラ",
      "en": "Yosuga no Sora"
    },
    "path": "/characters/sora-kasugano.webp"
  },
  {
    "key": "touko-nanami",
    "title": {
      "zh-CN": "七海灯子",
      "zh-TW": "七海燈子",
      "ja": "七海燈子",
      "en": "Touko Nanami"
    },
    "work": {
      "zh-CN": "终将成为你",
      "zh-TW": "終將成為妳",
      "ja": "やがて君になる",
      "en": "Bloom Into You"
    },
    "path": "/characters/touko-nanami.webp"
  },
  {
    "key": "eru-chitanda",
    "title": {
      "zh-CN": "千反田爱瑠",
      "zh-TW": "千反田愛瑠",
      "ja": "千反田える",
      "en": "Eru Chitanda"
    },
    "work": {
      "zh-CN": "冰菓",
      "zh-TW": "冰菓",
      "ja": "氷菓",
      "en": "Hyouka"
    },
    "path": "/characters/eru-chitanda.webp"
  },
  {
    "key": "miku-nakano",
    "title": {
      "zh-CN": "中野三玖",
      "zh-TW": "中野三玖",
      "ja": "中野三玖",
      "en": "Miku Nakano"
    },
    "work": {
      "zh-CN": "五等分的新娘",
      "zh-TW": "五等分的新娘",
      "ja": "五等分の花嫁",
      "en": "The Quintessential Quintuplets"
    },
    "path": "/characters/miku-nakano.webp"
  }
] as const;

export function getFavoriteCharacters(locale: "zh-CN" | "zh-TW" | "ja" | "en") {
  return characters.map((item) => ({
    key: item.key, title: item.title[locale], subtitle: item.work[locale], portrait: item.path,
  }));
}

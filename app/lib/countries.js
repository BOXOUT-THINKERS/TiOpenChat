var countries = [];
var exportCountries = {};

countries['us'] = {
	"af": {
		"name": "Afghanistan",
		"phoneCode": "93"
	},
	"al": {
		"name": "Albania",
		"phoneCode": "355"
	},
	"dz": {
		"name": "Algeria",
		"phoneCode": "213"
	},
	"ad": {
		"name": "Andorra",
		"phoneCode": "376"
	},
	"ao": {
		"name": "Angola",
		"phoneCode": "244"
	},
	"aq": {
		"name": "Antarctica",
		"phoneCode": "672"
	},
	"ar": {
		"name": "Argentina",
		"phoneCode": "54"
	},
	"am": {
		"name": "Armenia",
		"phoneCode": "374"
	},
	"aw": {
		"name": "Aruba",
		"phoneCode": "297"
	},
	"au": {
		"name": "Australia",
		"phoneCode": "61"
	},
	"at": {
		"name": "Austria",
		"phoneCode": "43"
	},
	"az": {
		"name": "Azerbaijan",
		"phoneCode": "994"
	},
	"bh": {
		"name": "Bahrain",
		"phoneCode": "973"
	},
	"bd": {
		"name": "Bangladesh",
		"phoneCode": "880"
	},
	"by": {
		"name": "Belarus",
		"phoneCode": "375"
	},
	"be": {
		"name": "Belgium",
		"phoneCode": "32"
	},
	"bz": {
		"name": "Belize",
		"phoneCode": "501"
	},
	"bj": {
		"name": "Benin",
		"phoneCode": "229"
	},
	"bt": {
		"name": "Bhutan",
		"phoneCode": "975"
	},
	"bo": {
		"name": "Bolivia, Plurinational State Of",
		"phoneCode": "591"
	},
	"ba": {
		"name": "Bosnia And Herzegovina",
		"phoneCode": "387"
	},
	"bw": {
		"name": "Botswana",
		"phoneCode": "267"
	},
	"br": {
		"name": "Brazil",
		"phoneCode": "55"
	},
	"bn": {
		"name": "Brunei Darussalam",
		"phoneCode": "673"
	},
	"bg": {
		"name": "Bulgaria",
		"phoneCode": "359"
	},
	"bf": {
		"name": "Burkina Faso",
		"phoneCode": "226"
	},
	"mm": {
		"name": "Myanmar",
		"phoneCode": "95"
	},
	"bi": {
		"name": "Burundi",
		"phoneCode": "257"
	},
	"kh": {
		"name": "Cambodia",
		"phoneCode": "855"
	},
	"cm": {
		"name": "Cameroon",
		"phoneCode": "237"
	},
	"ca": {
		"name": "Canada",
		"phoneCode": "1"
	},
	"cv": {
		"name": "Cape Verde",
		"phoneCode": "238"
	},
	"cf": {
		"name": "Central African Republic",
		"phoneCode": "236"
	},
	"td": {
		"name": "Chad",
		"phoneCode": "235"
	},
	"cl": {
		"name": "Chile",
		"phoneCode": "56"
	},
	"cn": {
		"name": "China",
		"phoneCode": "86"
	},
	"cx": {
		"name": "Christmas Island",
		"phoneCode": "61"
	},
	"cc": {
		"name": "Cocos (keeling) Islands",
		"phoneCode": "61"
	},
	"co": {
		"name": "Colombia",
		"phoneCode": "57"
	},
	"km": {
		"name": "Comoros",
		"phoneCode": "269"
	},
	"cg": {
		"name": "Congo",
		"phoneCode": "242"
	},
	"cd": {
		"name": "Congo, The Democratic Republic Of The",
		"phoneCode": "243"
	},
	"ck": {
		"name": "Cook Islands",
		"phoneCode": "682"
	},
	"cr": {
		"name": "Costa Rica",
		"phoneCode": "506"
	},
	"hr": {
		"name": "Croatia",
		"phoneCode": "385"
	},
	"cu": {
		"name": "Cuba",
		"phoneCode": "53"
	},
	"cy": {
		"name": "Cyprus",
		"phoneCode": "357"
	},
	"cz": {
		"name": "Czech Republic",
		"phoneCode": "420"
	},
	"dk": {
		"name": "Denmark",
		"phoneCode": "45"
	},
	"dj": {
		"name": "Djibouti",
		"phoneCode": "253"
	},
	"tl": {
		"name": "Timor-leste",
		"phoneCode": "670"
	},
	"ec": {
		"name": "Ecuador",
		"phoneCode": "593"
	},
	"eg": {
		"name": "Egypt",
		"phoneCode": "20"
	},
	"sv": {
		"name": "El Salvador",
		"phoneCode": "503"
	},
	"gq": {
		"name": "Equatorial Guinea",
		"phoneCode": "240"
	},
	"er": {
		"name": "Eritrea",
		"phoneCode": "291"
	},
	"ee": {
		"name": "Estonia",
		"phoneCode": "372"
	},
	"et": {
		"name": "Ethiopia",
		"phoneCode": "251"
	},
	"fk": {
		"name": "Falkland Islands (malvinas)",
		"phoneCode": "500"
	},
	"fo": {
		"name": "Faroe Islands",
		"phoneCode": "298"
	},
	"fj": {
		"name": "Fiji",
		"phoneCode": "679"
	},
	"fi": {
		"name": "Finland",
		"phoneCode": "358"
	},
	"fr": {
		"name": "France",
		"phoneCode": "33"
	},
	"pf": {
		"name": "French Polynesia",
		"phoneCode": "689"
	},
	"ga": {
		"name": "Gabon",
		"phoneCode": "241"
	},
	"gm": {
		"name": "Gambia",
		"phoneCode": "220"
	},
	"ge": {
		"name": "Georgia",
		"phoneCode": "995"
	},
	"de": {
		"name": "Germany",
		"phoneCode": "49"
	},
	"gh": {
		"name": "Ghana",
		"phoneCode": "233"
	},
	"gi": {
		"name": "Gibraltar",
		"phoneCode": "350"
	},
	"gr": {
		"name": "Greece",
		"phoneCode": "30"
	},
	"gl": {
		"name": "Greenland",
		"phoneCode": "299"
	},
	"gt": {
		"name": "Guatemala",
		"phoneCode": "502"
	},
	"gn": {
		"name": "Guinea",
		"phoneCode": "224"
	},
	"gw": {
		"name": "Guinea-bissau",
		"phoneCode": "245"
	},
	"gy": {
		"name": "Guyana",
		"phoneCode": "592"
	},
	"ht": {
		"name": "Haiti",
		"phoneCode": "509"
	},
	"hn": {
		"name": "Honduras",
		"phoneCode": "504"
	},
	"hk": {
		"name": "Hong Kong",
		"phoneCode": "852"
	},
	"hu": {
		"name": "Hungary",
		"phoneCode": "36"
	},
	"in": {
		"name": "India",
		"phoneCode": "91"
	},
	"id": {
		"name": "Indonesia",
		"phoneCode": "62"
	},
	"ir": {
		"name": "Iran, Islamic Republic Of",
		"phoneCode": "98"
	},
	"iq": {
		"name": "Iraq",
		"phoneCode": "964"
	},
	"ie": {
		"name": "Ireland",
		"phoneCode": "353"
	},
	"im": {
		"name": "Isle Of Man",
		"phoneCode": "44"
	},
	"il": {
		"name": "Israel",
		"phoneCode": "972"
	},
	"it": {
		"name": "Italy",
		"phoneCode": "39"
	},
	"ci": {
		"name": "Côte D'ivoire",
		"phoneCode": "225"
	},
	"jp": {
		"name": "Japan",
		"phoneCode": "81"
	},
	"jo": {
		"name": "Jordan",
		"phoneCode": "962"
	},
	"kz": {
		"name": "Kazakhstan",
		"phoneCode": "7"
	},
	"ke": {
		"name": "Kenya",
		"phoneCode": "254"
	},
	"ki": {
		"name": "Kiribati",
		"phoneCode": "686"
	},
	"kw": {
		"name": "Kuwait",
		"phoneCode": "965"
	},
	"kg": {
		"name": "Kyrgyzstan",
		"phoneCode": "996"
	},
	"la": {
		"name": "Lao People's Democratic Republic",
		"phoneCode": "856"
	},
	"lv": {
		"name": "Latvia",
		"phoneCode": "371"
	},
	"lb": {
		"name": "Lebanon",
		"phoneCode": "961"
	},
	"ls": {
		"name": "Lesotho",
		"phoneCode": "266"
	},
	"lr": {
		"name": "Liberia",
		"phoneCode": "231"
	},
	"ly": {
		"name": "Libya",
		"phoneCode": "218"
	},
	"li": {
		"name": "Liechtenstein",
		"phoneCode": "423"
	},
	"lt": {
		"name": "Lithuania",
		"phoneCode": "370"
	},
	"lu": {
		"name": "Luxembourg",
		"phoneCode": "352"
	},
	"mo": {
		"name": "Macao",
		"phoneCode": "853"
	},
	"mk": {
		"name": "Macedonia, The Former Yugoslav Republic Of",
		"phoneCode": "389"
	},
	"mg": {
		"name": "Madagascar",
		"phoneCode": "261"
	},
	"mw": {
		"name": "Malawi",
		"phoneCode": "265"
	},
	"my": {
		"name": "Malaysia",
		"phoneCode": "60"
	},
	"mv": {
		"name": "Maldives",
		"phoneCode": "960"
	},
	"ml": {
		"name": "Mali",
		"phoneCode": "223"
	},
	"mt": {
		"name": "Malta",
		"phoneCode": "356"
	},
	"mh": {
		"name": "Marshall Islands",
		"phoneCode": "692"
	},
	"mr": {
		"name": "Mauritania",
		"phoneCode": "222"
	},
	"mu": {
		"name": "Mauritius",
		"phoneCode": "230"
	},
	"yt": {
		"name": "Mayotte",
		"phoneCode": "262"
	},
	"mx": {
		"name": "Mexico",
		"phoneCode": "52"
	},
	"fm": {
		"name": "Micronesia, Federated States Of",
		"phoneCode": "691"
	},
	"md": {
		"name": "Moldova, Republic Of",
		"phoneCode": "373"
	},
	"mc": {
		"name": "Monaco",
		"phoneCode": "377"
	},
	"mn": {
		"name": "Mongolia",
		"phoneCode": "976"
	},
	"me": {
		"name": "Montenegro",
		"phoneCode": "382"
	},
	"ma": {
		"name": "Morocco",
		"phoneCode": "212"
	},
	"mz": {
		"name": "Mozambique",
		"phoneCode": "258"
	},
	"na": {
		"name": "Namibia",
		"phoneCode": "264"
	},
	"nr": {
		"name": "Nauru",
		"phoneCode": "674"
	},
	"np": {
		"name": "Nepal",
		"phoneCode": "977"
	},
	"nl": {
		"name": "Netherlands",
		"phoneCode": "31"
	},
	"nc": {
		"name": "New Caledonia",
		"phoneCode": "687"
	},
	"nz": {
		"name": "New Zealand",
		"phoneCode": "64"
	},
	"ni": {
		"name": "Nicaragua",
		"phoneCode": "505"
	},
	"ne": {
		"name": "Niger",
		"phoneCode": "227"
	},
	"ng": {
		"name": "Nigeria",
		"phoneCode": "234"
	},
	"nu": {
		"name": "Niue",
		"phoneCode": "683"
	},
	"kp": {
		"name": "Korea, Democratic People's Republic Of",
		"phoneCode": "850"
	},
	"no": {
		"name": "Norway",
		"phoneCode": "47"
	},
	"om": {
		"name": "Oman",
		"phoneCode": "968"
	},
	"pk": {
		"name": "Pakistan",
		"phoneCode": "92"
	},
	"pw": {
		"name": "Palau",
		"phoneCode": "680"
	},
	"pa": {
		"name": "Panama",
		"phoneCode": "507"
	},
	"pg": {
		"name": "Papua New Guinea",
		"phoneCode": "675"
	},
	"py": {
		"name": "Paraguay",
		"phoneCode": "595"
	},
	"pe": {
		"name": "Peru",
		"phoneCode": "51"
	},
	"ph": {
		"name": "Philippines",
		"phoneCode": "63"
	},
	"pn": {
		"name": "Pitcairn",
		"phoneCode": "870"
	},
	"pl": {
		"name": "Poland",
		"phoneCode": "48"
	},
	"pt": {
		"name": "Portugal",
		"phoneCode": "351"
	},
	"pr": {
		"name": "Puerto Rico",
		"phoneCode": "1"
	},
	"qa": {
		"name": "Qatar",
		"phoneCode": "974"
	},
	"ro": {
		"name": "Romania",
		"phoneCode": "40"
	},
	"ru": {
		"name": "Russian Federation",
		"phoneCode": "7"
	},
	"rw": {
		"name": "Rwanda",
		"phoneCode": "250"
	},
	"bl": {
		"name": "Saint Barthélemy",
		"phoneCode": "590"
	},
	"ws": {
		"name": "Samoa",
		"phoneCode": "685"
	},
	"sm": {
		"name": "San Marino",
		"phoneCode": "378"
	},
	"st": {
		"name": "Sao Tome And Principe",
		"phoneCode": "239"
	},
	"sa": {
		"name": "Saudi Arabia",
		"phoneCode": "966"
	},
	"sn": {
		"name": "Senegal",
		"phoneCode": "221"
	},
	"rs": {
		"name": "Serbia",
		"phoneCode": "381"
	},
	"sc": {
		"name": "Seychelles",
		"phoneCode": "248"
	},
	"sl": {
		"name": "Sierra Leone",
		"phoneCode": "232"
	},
	"sg": {
		"name": "Singapore",
		"phoneCode": "65"
	},
	"sk": {
		"name": "Slovakia",
		"phoneCode": "421"
	},
	"si": {
		"name": "Slovenia",
		"phoneCode": "386"
	},
	"sb": {
		"name": "Solomon Islands",
		"phoneCode": "677"
	},
	"so": {
		"name": "Somalia",
		"phoneCode": "252"
	},
	"za": {
		"name": "South Africa",
		"phoneCode": "27"
	},
	"kr": {
		"name": "Korea, Republic Of",
		"phoneCode": "82"
	},
	"es": {
		"name": "Spain",
		"phoneCode": "34"
	},
	"lk": {
		"name": "Sri Lanka",
		"phoneCode": "94"
	},
	"sh": {
		"name": "Saint Helena, Ascension And Tristan Da Cunha",
		"phoneCode": "290"
	},
	"pm": {
		"name": "Saint Pierre And Miquelon",
		"phoneCode": "508"
	},
	"sd": {
		"name": "Sudan",
		"phoneCode": "249"
	},
	"sr": {
		"name": "Suriname",
		"phoneCode": "597"
	},
	"sz": {
		"name": "Swaziland",
		"phoneCode": "268"
	},
	"se": {
		"name": "Sweden",
		"phoneCode": "46"
	},
	"ch": {
		"name": "Switzerland",
		"phoneCode": "41"
	},
	"sy": {
		"name": "Syrian Arab Republic",
		"phoneCode": "963"
	},
	"tw": {
		"name": "Taiwan, Province Of China",
		"phoneCode": "886"
	},
	"tj": {
		"name": "Tajikistan",
		"phoneCode": "992"
	},
	"tz": {
		"name": "Tanzania, United Republic Of",
		"phoneCode": "255"
	},
	"th": {
		"name": "Thailand",
		"phoneCode": "66"
	},
	"tg": {
		"name": "Togo",
		"phoneCode": "228"
	},
	"tk": {
		"name": "Tokelau",
		"phoneCode": "690"
	},
	"to": {
		"name": "Tonga",
		"phoneCode": "676"
	},
	"tn": {
		"name": "Tunisia",
		"phoneCode": "216"
	},
	"tr": {
		"name": "Turkey",
		"phoneCode": "90"
	},
	"tm": {
		"name": "Turkmenistan",
		"phoneCode": "993"
	},
	"tv": {
		"name": "Tuvalu",
		"phoneCode": "688"
	},
	"ae": {
		"name": "United Arab Emirates",
		"phoneCode": "971"
	},
	"ug": {
		"name": "Uganda",
		"phoneCode": "256"
	},
	"gb": {
		"name": "United Kingdom",
		"phoneCode": "44"
	},
	"ua": {
		"name": "Ukraine",
		"phoneCode": "380"
	},
	"uy": {
		"name": "Uruguay",
		"phoneCode": "598"
	},
	"us": {
		"name": "United States",
		"phoneCode": "1"
	},
	"uz": {
		"name": "Uzbekistan",
		"phoneCode": "998"
	},
	"vu": {
		"name": "Vanuatu",
		"phoneCode": "678"
	},
	"va": {
		"name": "Holy See (vatican City State)",
		"phoneCode": "39"
	},
	"ve": {
		"name": "Venezuela, Bolivarian Republic Of",
		"phoneCode": "58"
	},
	"vn": {
		"name": "Viet Nam",
		"phoneCode": "84"
	},
	"wf": {
		"name": "Wallis And Futuna",
		"phoneCode": "681"
	},
	"ye": {
		"name": "Yemen",
		"phoneCode": "967"
	},
	"zm": {
		"name": "Zambia",
		"phoneCode": "260"
	},
	"zw": {
		"name": "Zimbabwe",
		"phoneCode": "263"
	}
};

countries['kr'] = {
	"af": {
		"name": "아프가니스탄(Afghanistan)",
		"phoneCode": "93"
	},
	"al": {
		"name": "알바니아(Albania)",
		"phoneCode": "355"
	},
	"dz": {
		"name": "알제리(Algeria)",
		"phoneCode": "213"
	},
	"ad": {
		"name": "안도라(Andorra)",
		"phoneCode": "376"
	},
	"ao": {
		"name": "앙골라(Angola)",
		"phoneCode": "244"
	},
	"aq": {
		"name": "남극(Antarctica)",
		"phoneCode": "672"
	},
	"ar": {
		"name": "아르헨티나(Argentina)",
		"phoneCode": "54"
	},
	"am": {
		"name": "아르메니아(Armenia)",
		"phoneCode": "374"
	},
	"aw": {
		"name": "아루바(Aruba)",
		"phoneCode": "297"
	},
	"au": {
		"name": "호주(Australia)",
		"phoneCode": "61"
	},
	"at": {
		"name": "오스트리아(Austria)",
		"phoneCode": "43"
	},
	"az": {
		"name": "아제르바이잔(Azerbaijan)",
		"phoneCode": "994"
	},
	"bh": {
		"name": "바레인(Bahrain)",
		"phoneCode": "973"
	},
	"bd": {
		"name": "방글라데시(Bangladesh)",
		"phoneCode": "880"
	},
	"by": {
		"name": "벨라루스(Belarus)",
		"phoneCode": "375"
	},
	"be": {
		"name": "벨기에(Belgium)",
		"phoneCode": "32"
	},
	"bz": {
		"name": "벨리즈(Belize)",
		"phoneCode": "501"
	},
	"bj": {
		"name": "베냉(Benin)",
		"phoneCode": "229"
	},
	"bt": {
		"name": "부탄(Bhutan)",
		"phoneCode": "975"
	},
	"bo": {
		"name": "볼리비아(Bolivia, Plurinational State Of)",
		"phoneCode": "591"
	},
	"ba": {
		"name": "보스니아 헤르체고비나(Bosnia And Herzegovina)",
		"phoneCode": "387"
	},
	"bw": {
		"name": "보츠와나(Botswana)",
		"phoneCode": "267"
	},
	"br": {
		"name": "브라질(Brazil)",
		"phoneCode": "55"
	},
	"bn": {
		"name": "브루나이(Brunei Darussalam)",
		"phoneCode": "673"
	},
	"bg": {
		"name": "불가리아(Bulgaria)",
		"phoneCode": "359"
	},
	"bf": {
		"name": "부르키나파소(Burkina Faso)",
		"phoneCode": "226"
	},
	"mm": {
		"name": "미얀마(Myanmar)",
		"phoneCode": "95"
	},
	"bi": {
		"name": "부룬디(Burundi)",
		"phoneCode": "257"
	},
	"kh": {
		"name": "캄보디아(Cambodia)",
		"phoneCode": "855"
	},
	"cm": {
		"name": "카메룬(Cameroon)",
		"phoneCode": "237"
	},
	"ca": {
		"name": "캐나다(Canada)",
		"phoneCode": "1"
	},
	"cv": {
		"name": "카보베르데(Cape Verde)",
		"phoneCode": "238"
	},
	"cf": {
		"name": "중앙아프리카공화국(Central African Republic)",
		"phoneCode": "236"
	},
	"td": {
		"name": "차드(Chad)",
		"phoneCode": "235"
	},
	"cl": {
		"name": "칠레(Chile)",
		"phoneCode": "56"
	},
	"cn": {
		"name": "중국(China)",
		"phoneCode": "86"
	},
	"cx": {
		"name": "크리스마스섬(Christmas Island)",
		"phoneCode": "61"
	},
	"cc": {
		"name": "코코스제도(Cocos (keeling) Islands)",
		"phoneCode": "61"
	},
	"co": {
		"name": "콜롬비아(Colombia)",
		"phoneCode": "57"
	},
	"km": {
		"name": "코모로(Comoros)",
		"phoneCode": "269"
	},
	"cg": {
		"name": "콩고(Congo)",
		"phoneCode": "242"
	},
	"cd": {
		"name": "콩고민주공화국(Congo, The Democratic Republic Of The)",
		"phoneCode": "243"
	},
	"ck": {
		"name": "쿡제도(Cook Islands)",
		"phoneCode": "682"
	},
	"cr": {
		"name": "코스타리카(Costa Rica)",
		"phoneCode": "506"
	},
	"hr": {
		"name": "크로아티아(Croatia)",
		"phoneCode": "385"
	},
	"cu": {
		"name": "쿠바(Cuba)",
		"phoneCode": "53"
	},
	"cy": {
		"name": "키프로스(Cyprus)",
		"phoneCode": "357"
	},
	"cz": {
		"name": "체코(Czech Republic)",
		"phoneCode": "420"
	},
	"dk": {
		"name": "덴마크(Denmark)",
		"phoneCode": "45"
	},
	"dj": {
		"name": "지부티(Djibouti)",
		"phoneCode": "253"
	},
	"tl": {
		"name": "동티모르(Timor-leste)",
		"phoneCode": "670"
	},
	"ec": {
		"name": "에콰도르(Ecuador)",
		"phoneCode": "593"
	},
	"eg": {
		"name": "이집트(Egypt)",
		"phoneCode": "20"
	},
	"sv": {
		"name": "엘살바도르(El Salvador)",
		"phoneCode": "503"
	},
	"gq": {
		"name": "적도기니(Equatorial Guinea)",
		"phoneCode": "240"
	},
	"er": {
		"name": "에리트레아(Eritrea)",
		"phoneCode": "291"
	},
	"ee": {
		"name": "에스토니아(Estonia)",
		"phoneCode": "372"
	},
	"et": {
		"name": "에티오피아(Ethiopia)",
		"phoneCode": "251"
	},
	"fk": {
		"name": "포클랜드제도(Falkland Islands (malvinas))",
		"phoneCode": "500"
	},
	"fo": {
		"name": "페로제도(Faroe Islands)",
		"phoneCode": "298"
	},
	"fj": {
		"name": "피지(Fiji)",
		"phoneCode": "679"
	},
	"fi": {
		"name": "핀란드(Finland)",
		"phoneCode": "358"
	},
	"fr": {
		"name": "프랑스(France)",
		"phoneCode": "33"
	},
	"pf": {
		"name": "프랑스령 폴리네시아(French Polynesia)",
		"phoneCode": "689"
	},
	"ga": {
		"name": "가봉(Gabon)",
		"phoneCode": "241"
	},
	"gm": {
		"name": "감비아(Gambia)",
		"phoneCode": "220"
	},
	"ge": {
		"name": "조지아(Georgia)",
		"phoneCode": "995"
	},
	"de": {
		"name": "독일(Germany)",
		"phoneCode": "49"
	},
	"gh": {
		"name": "가나(Ghana)",
		"phoneCode": "233"
	},
	"gi": {
		"name": "지브롤터(Gibraltar)",
		"phoneCode": "350"
	},
	"gr": {
		"name": "그리스(Greece)",
		"phoneCode": "30"
	},
	"gl": {
		"name": "그린란드(Greenland)",
		"phoneCode": "299"
	},
	"gt": {
		"name": "과테말라(Guatemala)",
		"phoneCode": "502"
	},
	"gn": {
		"name": "기니(Guinea)",
		"phoneCode": "224"
	},
	"gw": {
		"name": "기니비사우(Guinea-bissau)",
		"phoneCode": "245"
	},
	"gy": {
		"name": "가이아나(Guyana)",
		"phoneCode": "592"
	},
	"ht": {
		"name": "아이티(Haiti)",
		"phoneCode": "509"
	},
	"hn": {
		"name": "온두라스(Honduras)",
		"phoneCode": "504"
	},
	"hk": {
		"name": "홍콩(Hong Kong)",
		"phoneCode": "852"
	},
	"hu": {
		"name": "헝가리(Hungary)",
		"phoneCode": "36"
	},
	"in": {
		"name": "인도(India)",
		"phoneCode": "91"
	},
	"id": {
		"name": "인도네시아(Indonesia)",
		"phoneCode": "62"
	},
	"ir": {
		"name": "이란(Iran, Islamic Republic Of)",
		"phoneCode": "98"
	},
	"iq": {
		"name": "이라크(Iraq)",
		"phoneCode": "964"
	},
	"ie": {
		"name": "아일랜드(Ireland)",
		"phoneCode": "353"
	},
	"im": {
		"name": "맨 섬(Isle Of Man)",
		"phoneCode": "44"
	},
	"il": {
		"name": "이스라엘(Israel)",
		"phoneCode": "972"
	},
	"it": {
		"name": "이탈리아(Italy)",
		"phoneCode": "39"
	},
	"ci": {
		"name": "코트디부아르(Côte D'ivoire)",
		"phoneCode": "225"
	},
	"jp": {
		"name": "일본(Japan)",
		"phoneCode": "81"
	},
	"jo": {
		"name": "요르단(Jordan)",
		"phoneCode": "962"
	},
	"kz": {
		"name": "카자흐스탄(Kazakhstan)",
		"phoneCode": "7"
	},
	"ke": {
		"name": "케냐(Kenya)",
		"phoneCode": "254"
	},
	"ki": {
		"name": "키리바티(Kiribati)",
		"phoneCode": "686"
	},
	"kw": {
		"name": "쿠웨이트(Kuwait)",
		"phoneCode": "965"
	},
	"kg": {
		"name": "키르기스스탄(Kyrgyzstan)",
		"phoneCode": "996"
	},
	"la": {
		"name": "라오스(Lao People's Democratic Republic)",
		"phoneCode": "856"
	},
	"lv": {
		"name": "라트비아(Latvia)",
		"phoneCode": "371"
	},
	"lb": {
		"name": "레바논(Lebanon)",
		"phoneCode": "961"
	},
	"ls": {
		"name": "레소토(Lesotho)",
		"phoneCode": "266"
	},
	"lr": {
		"name": "라이베리아(Liberia)",
		"phoneCode": "231"
	},
	"ly": {
		"name": "리비아(Libya)",
		"phoneCode": "218"
	},
	"li": {
		"name": "리히텐슈타인(Liechtenstein)",
		"phoneCode": "423"
	},
	"lt": {
		"name": "리투아니아(Lithuania)",
		"phoneCode": "370"
	},
	"lu": {
		"name": "룩셈부르크(Luxembourg)",
		"phoneCode": "352"
	},
	"mo": {
		"name": "마카오(Macao)",
		"phoneCode": "853"
	},
	"mk": {
		"name": "마케도니아(Macedonia, The Former Yugoslav Republic Of)",
		"phoneCode": "389"
	},
	"mg": {
		"name": "마다가스카르(Madagascar)",
		"phoneCode": "261"
	},
	"mw": {
		"name": "말라위(Malawi)",
		"phoneCode": "265"
	},
	"my": {
		"name": "말레이시아(Malaysia)",
		"phoneCode": "60"
	},
	"mv": {
		"name": "몰디브(Maldives)",
		"phoneCode": "960"
	},
	"ml": {
		"name": "말리(Mali)",
		"phoneCode": "223"
	},
	"mt": {
		"name": "몰타(Malta)",
		"phoneCode": "356"
	},
	"mh": {
		"name": "마샬군도(Marshall Islands)",
		"phoneCode": "692"
	},
	"mr": {
		"name": "모리타니(Mauritania)",
		"phoneCode": "222"
	},
	"mu": {
		"name": "모리셔스(Mauritius)",
		"phoneCode": "230"
	},
	"yt": {
		"name": "마요트섬(Mayotte)",
		"phoneCode": "262"
	},
	"mx": {
		"name": "멕시코(Mexico)",
		"phoneCode": "52"
	},
	"fm": {
		"name": "미크로네시아(Micronesia, Federated States Of)",
		"phoneCode": "691"
	},
	"md": {
		"name": "몰도바(Moldova, Republic Of)",
		"phoneCode": "373"
	},
	"mc": {
		"name": "모나코(Monaco)",
		"phoneCode": "377"
	},
	"mn": {
		"name": "몽골(Mongolia)",
		"phoneCode": "976"
	},
	"me": {
		"name": "몬테네그로(Montenegro)",
		"phoneCode": "382"
	},
	"ma": {
		"name": "모로코(Morocco)",
		"phoneCode": "212"
	},
	"mz": {
		"name": "모잠비크(Mozambique)",
		"phoneCode": "258"
	},
	"na": {
		"name": "나미비아(Namibia)",
		"phoneCode": "264"
	},
	"nr": {
		"name": "나우루(Nauru)",
		"phoneCode": "674"
	},
	"np": {
		"name": "네팔(Nepal)",
		"phoneCode": "977"
	},
	"nl": {
		"name": "네델란드(Netherlands)",
		"phoneCode": "31"
	},
	"nc": {
		"name": "뉴칼레도니아(New Caledonia)",
		"phoneCode": "687"
	},
	"nz": {
		"name": "뉴질랜드(New Zealand)",
		"phoneCode": "64"
	},
	"ni": {
		"name": "니카라과(Nicaragua)",
		"phoneCode": "505"
	},
	"ne": {
		"name": "니제르(Niger)",
		"phoneCode": "227"
	},
	"ng": {
		"name": "나이지리아(Nigeria)",
		"phoneCode": "234"
	},
	"nu": {
		"name": "니우에섬(Niue)",
		"phoneCode": "683"
	},
	"no": {
		"name": "노르웨이(Norway)",
		"phoneCode": "47"
	},
	"om": {
		"name": "오만(Oman)",
		"phoneCode": "968"
	},
	"pk": {
		"name": "파키스탄(Pakistan)",
		"phoneCode": "92"
	},
	"pw": {
		"name": "팔라우(Palau)",
		"phoneCode": "680"
	},
	"pa": {
		"name": "파나마(Panama)",
		"phoneCode": "507"
	},
	"pg": {
		"name": "파푸아뉴기니(Papua New Guinea)",
		"phoneCode": "675"
	},
	"py": {
		"name": "파라과이(Paraguay)",
		"phoneCode": "595"
	},
	"pe": {
		"name": "페루(Peru)",
		"phoneCode": "51"
	},
	"ph": {
		"name": "필리핀(Philippines)",
		"phoneCode": "63"
	},
	"pn": {
		"name": "핏케언제도(Pitcairn)",
		"phoneCode": "870"
	},
	"pl": {
		"name": "폴란드(Poland)",
		"phoneCode": "48"
	},
	"pt": {
		"name": "포르투갈(Portugal)",
		"phoneCode": "351"
	},
	"pr": {
		"name": "푸에르토리코(Puerto Rico)",
		"phoneCode": "1"
	},
	"qa": {
		"name": "카타르(Qatar)",
		"phoneCode": "974"
	},
	"ro": {
		"name": "루마니아(Romania)",
		"phoneCode": "40"
	},
	"ru": {
		"name": "러시아(Russian Federation)",
		"phoneCode": "7"
	},
	"rw": {
		"name": "르완다(Rwanda)",
		"phoneCode": "250"
	},
	"bl": {
		"name": "생바릍텔르미(Saint Barthélemy)",
		"phoneCode": "590"
	},
	"ws": {
		"name": "사모아(Samoa)",
		"phoneCode": "685"
	},
	"sm": {
		"name": "산마리노(San Marino)",
		"phoneCode": "378"
	},
	"st": {
		"name": "상투메프린시페(Sao Tome And Principe)",
		"phoneCode": "239"
	},
	"sa": {
		"name": "사우디아라비아(Saudi Arabia)",
		"phoneCode": "966"
	},
	"sn": {
		"name": "세네갈(Senegal)",
		"phoneCode": "221"
	},
	"rs": {
		"name": "세르비아(Serbia)",
		"phoneCode": "381"
	},
	"sc": {
		"name": "세이셸(Seychelles)",
		"phoneCode": "248"
	},
	"sl": {
		"name": "시에라리온(Sierra Leone)",
		"phoneCode": "232"
	},
	"sg": {
		"name": "싱가포르(Singapore)",
		"phoneCode": "65"
	},
	"sk": {
		"name": "슬로바키아(Slovakia)",
		"phoneCode": "421"
	},
	"si": {
		"name": "슬로베니아(Slovenia)",
		"phoneCode": "386"
	},
	"sb": {
		"name": "솔로몬제도(Solomon Islands)",
		"phoneCode": "677"
	},
	"so": {
		"name": "소말리아(Somalia)",
		"phoneCode": "252"
	},
	"za": {
		"name": "남아프리카공화국(South Africa)",
		"phoneCode": "27"
	},
	"kr": {
		"name": "대한민국(Korea, Republic Of)",
		"phoneCode": "82"
	},
	"es": {
		"name": "스페인(Spain)",
		"phoneCode": "34"
	},
	"lk": {
		"name": "스리랑카(Sri Lanka)",
		"phoneCode": "94"
	},
	"sh": {
		"name": "세인트헬레나(Saint Helena, Ascension And Tristan Da Cunha)",
		"phoneCode": "290"
	},
	"pm": {
		"name": "생피에르 미클롱(Saint Pierre And Miquelon)",
		"phoneCode": "508"
	},
	"sd": {
		"name": "수단(Sudan)",
		"phoneCode": "249"
	},
	"sr": {
		"name": "수리남(Suriname)",
		"phoneCode": "597"
	},
	"sz": {
		"name": "스와질란드(Swaziland)",
		"phoneCode": "268"
	},
	"se": {
		"name": "스웨덴(Sweden)",
		"phoneCode": "46"
	},
	"ch": {
		"name": "스위스(Switzerland)",
		"phoneCode": "41"
	},
	"sy": {
		"name": "시리아(Syrian Arab Republic)",
		"phoneCode": "963"
	},
	"tw": {
		"name": "대만(Taiwan, Province Of China)",
		"phoneCode": "886"
	},
	"tj": {
		"name": "타지키스탄(Tajikistan)",
		"phoneCode": "992"
	},
	"tz": {
		"name": "탄자니아(Tanzania, United Republic Of)",
		"phoneCode": "255"
	},
	"th": {
		"name": "태국(Thailand)",
		"phoneCode": "66"
	},
	"tg": {
		"name": "토고(Togo)",
		"phoneCode": "228"
	},
	"tk": {
		"name": "토켈라우(Tokelau)",
		"phoneCode": "690"
	},
	"to": {
		"name": "통가(Tonga)",
		"phoneCode": "676"
	},
	"tn": {
		"name": "튀지니(Tunisia)",
		"phoneCode": "216"
	},
	"tr": {
		"name": "터키(Turkey)",
		"phoneCode": "90"
	},
	"tm": {
		"name": "투르크메니스탄(Turkmenistan)",
		"phoneCode": "993"
	},
	"tv": {
		"name": "투발루(Tuvalu)",
		"phoneCode": "688"
	},
	"ae": {
		"name": "아랍에미리트(United Arab Emirates)",
		"phoneCode": "971"
	},
	"ug": {
		"name": "우간다(Uganda)",
		"phoneCode": "256"
	},
	"gb": {
		"name": "영국(United Kingdom)",
		"phoneCode": "44"
	},
	"ua": {
		"name": "우크라이나(Ukraine)",
		"phoneCode": "380"
	},
	"uy": {
		"name": "우루과이(Uruguay)",
		"phoneCode": "598"
	},
	"us": {
		"name": "미국(United States)",
		"phoneCode": "1"
	},
	"uz": {
		"name": "우즈베키스탄(Uzbekistan)",
		"phoneCode": "998"
	},
	"vu": {
		"name": "바누아투(Vanuatu)",
		"phoneCode": "678"
	},
	"va": {
		"name": "바티칸시국(Holy See (vatican City State))",
		"phoneCode": "39"
	},
	"ve": {
		"name": "베네수엘라(Venezuela, Bolivarian Republic Of)",
		"phoneCode": "58"
	},
	"vn": {
		"name": "베트남(Viet Nam)",
		"phoneCode": "84"
	},
	"wf": {
		"name": "월리스푸투나제도(Wallis And Futuna)",
		"phoneCode": "681"
	},
	"ye": {
		"name": "예멘(Yemen)",
		"phoneCode": "967"
	},
	"zm": {
		"name": "잠비아(Zambia)",
		"phoneCode": "260"
	},
	"zw": {
		"name": "짐바브웨(Zimbabwe)",
		"phoneCode": "263"
	}
};

if (Titanium.Locale.getCurrentCountry().toLowerCase() == "kr") {
	exportCountries = countries['kr'];
} else {
	exportCountries = countries['us'];
}

module.exports = exportCountries;
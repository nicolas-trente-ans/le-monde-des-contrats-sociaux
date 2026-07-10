/**
 * One-off helper: append missing country data and tune until tests pass.
 * Usage: node scripts/add-missing-countries.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computePathWinner, rebalanceQuizScores } from './lib/quiz-score-rebalance.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '../public/assets/data')

const newCountries = [
  {
    code: 'BR',
    image: 'brazil.jpg',
    label: { en: 'Brazil', fr: 'Brésil', hu: 'Brazília', pirate: 'Brazil' },
    description: {
      en: "Pedro, 30, sits at the center of Brazil's contrato social: Receita Federal and the federal government fund Dr. Armando's Rolex while MC Latrocínio points a Glock back; Bolsa Família supports Neide and Deividsson in the favela, FUNAI reaches Inígüasu, and Nestor, 73, draws previdência social toward Fortune Tiger, Pitú, and Jogo do Bicho.",
      fr: 'Pedro, 30 ans, est au centre du contrato social brésilien : la Receita Federal et le gouvernement fédéral financent la Rolex du Dr Armando tandis que MC Latrocínio pointe un Glock en retour ; le Bolsa Família soutient Neide et Deividsson dans la favela, la FUNAI atteint Inígüasu, et Nestor, 73 ans, tire la previdência social vers Fortune Tiger, Pitú et Jogo do Bicho.',
      hu: 'Pedro, 30 éves, Brazília contrato social-jának közepén ül: a Receita Federal és a szövetségi kormány Dr. Armando Rolexét finanszírozza, miközben MC Latrocínio egy Glockkal mutat vissza; a Bolsa Família Neidét és Deividssont támogatja a favelában, a FUNAI eléri Inígüasut, Nestor, 73 éves, pedig a previdência socialt a Fortune Tiger, Pitú és Jogo do Bicho felé irányítja.',
      pirate:
        "Pedro, 30, sits at th' heart o' Brazil's contrato social: Receita Federal an' th' federal government fund Dr. Armando's Rolex while MC Latrocínio points a Glock back; Bolsa Família supports Neide an' Deividsson in th' favela, FUNAI reaches Inígüasu, an' Nestor, 73, draws previdência social toward Fortune Tiger, Pitú, an' Jogo do Bicho, arr!",
    },
    profile: {
      baseline: 'FR',
      deltas: {
        'q04,a': 2,
        'q04,b': -2,
        'q05,e': 3,
        'q06,d': 2,
        'q03,d': 1,
        'q08,c': 1,
        'q10,b': 1,
      },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,d',
      'q04,a',
      'q05,e',
      'q06,d',
      'q07,e',
      'q08,c',
      'q09,c',
      'q10,b',
      'q11,b',
      'q12,c',
      'q13,b',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'IN',
    image: 'india.jpg',
    label: { en: 'India', fr: 'Inde', hu: 'India', pirate: 'India' },
    description: {
      en: "Suresh, 30, sits at the center of India's सामाजिक अनुबंध: UPI flows toward Modi while the Ministry of Minority Affairs funds Mustafizur and Raju draws NREGA toward a KTM; Shanti Devi collects women-and-child schemes and IAS Prashant Kumar, Retd., cashes the National Pension System on the way to Oxford.",
      fr: "Suresh, 30 ans, est au centre du सामाजिक अनुबंध indien : l'UPI va vers Modi tandis que le ministère des Minorités finance Mustafizur et Raju tire le NREGA vers une KTM ; Shanti Devi encaisse les programmes femmes-enfants et IAS Prashant Kumar, retraité, encaisse le National Pension System en route pour Oxford.",
      hu: 'Suresh, 30 éves, India सामाजिक अनुबंध közepén ül: az UPI Modi felé áramlik, miközben a kisebbségi ügyek minisztériuma Mustafizurt finanszírozza és Raju az NREGA-t egy KTM felé irányítja; Shanti Devi a női és gyermekprogramokat gyűjti be, IAS Prashant Kumar nyugdíjas pedig a National Pension Systemet Oxford felé váltja ki.',
      pirate:
        "Suresh, 30, sits at th' heart o' India's सामाजिक अनुबंध: UPI flows toward Modi while th' Ministry o' Minority Affairs funds Mustafizur an' Raju draws NREGA toward a KTM; Shanti Devi collects women-an'-child schemes an' IAS Prashant Kumar, Retd., cashes th' National Pension System on th' way ta Oxford, arr!",
    },
    profile: {
      baseline: 'CN',
      deltas: { 'q05,d': 2, 'q11,d': 2, 'q03,b': 1, 'q08,c': 1, 'q12,a': 1, 'q04,d': 1 },
    },
    path: [
      'q01,c',
      'q02,a',
      'q03,b',
      'q04,d',
      'q05,d',
      'q06,b',
      'q07,c',
      'q08,c',
      'q09,c',
      'q10,c',
      'q11,d',
      'q12,a',
      'q13,b',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'ID',
    image: 'indonesia.jpg',
    label: { en: 'Indonesia', fr: 'Indonésie', hu: 'Indonézia', pirate: 'Indonesia' },
    description: {
      en: "Eko, 25, sits at the center of Indonesia's kontrak sosial: SCBD taxes flow through BPJS and the tax directorate toward Hartono, Widjaja, Tjahjanto, and Oey Liong while Kevin and Rizki fund miHoYo, Garena, and Tencent; Wahyu delivers for Gojek and Grab past Pertamina toward Gates of Olympus, and Rusdi, 75, smokes through Philip Morris toward the Papua map.",
      fr: 'Eko, 25 ans, est au centre du kontrak sosial indonésien : les impôts de SCBD passent par le BPJS et la direction des impôts vers Hartono, Widjaja, Tjahjanto et Oey Liong tandis que Kevin et Rizki financent miHoYo, Garena et Tencent ; Wahyu livre pour Gojek et Grab au-delà de Pertamina vers Gates of Olympus, et Rusdi, 75 ans, fume via Philip Morris vers la carte de Papouasie.',
      hu: 'Eko, 25 éves, Indonézia kontrak sosial-jának közepén ül: az SCBD adói a BPJS-en és az adóhivatalon keresztül Hartono, Widjaja, Tjahjanto és Oey Liong felé folynak, miközben Kevin és Rizki a miHoYo, Garena és Tencent felé finanszíroz; Wahyu a Gojek és Grab számára szállít a Pertamina mellett a Gates of Olympus felé, Rusdi, 75 éves, pedig a Philip Morris-on át a pápua térkép felé füstöl.',
      pirate:
        "Eko, 25, sits at th' heart o' Indonesia's kontrak sosial: SCBD taxes flow through BPJS an' th' tax directorate toward Hartono, Widjaja, Tjahjanto, an' Oey Liong while Kevin an' Rizki fund miHoYo, Garena, an' Tencent; Wahyu delivers fer Gojek an' Grab past Pertamina toward Gates o' Olympus, an' Rusdi, 75, smokes through Philip Morris toward th' Papua map, arr!",
    },
    profile: {
      baseline: 'CN',
      deltas: { 'q05,d': 3, 'q06,d': 2, 'q10,c': 1, 'q12,b': 1, 'q01,d': 1 },
    },
    path: [
      'q01,d',
      'q02,b',
      'q03,c',
      'q04,c',
      'q05,d',
      'q06,d',
      'q07,d',
      'q08,b',
      'q09,e',
      'q10,c',
      'q11,c',
      'q12,b',
      'q13,a',
      'q14,a',
      'q15,a',
    ],
  },
  {
    code: 'IL',
    image: 'israel.jpg',
    label: { en: 'Israel', fr: 'Israël', hu: 'Izrael', pirate: 'Israel' },
    description: {
      en: "Yoni, 30, sits at the center of Israel's החוזה החברתי: the Ministry of Education and Bituach Leumi fund Moishe, David, Shlomo, and Amos while Ariel and Daniel march through the rabbinate; Jacob, 24, takes Birthright as Abdullah and Kasim draw Palestinian aid, and Eitan and Yael, 62, collect insurance before AIPAC and the beach condos call.",
      fr: "Yoni, 30 ans, est au centre du החוזה החברתי israélien : le ministère de l'Éducation et le Bituach Leumi financent Moishe, David, Shlomo et Amos tandis qu'Ariel et Daniel marchent via la rabbinate ; Jacob, 24 ans, prend Birthright alors qu'Abdullah et Kasim tirent l'aide palestinienne, et Eitan et Yael, 62 ans, encaissent l'assurance avant l'appel d'AIPAC et des condos de plage.",
      hu: 'Yoni, 30 éves, Izrael החוזה החברתי közepén ül: az oktatási minisztérium és a Bituach Leumi Moishe, David, Shlomo és Amos finanszírozására megy, miközben Ariel és Daniel a rabbinate-en át masíroz; Jacob, 24 éves, Birthrightot kap, Abdullah és Kasim pedig palesztin segélyt von el, Eitan és Yael, 62 éves, pedig biztosítást gyűjt, mielőtt az AIPAC és a tengerparti lakások hívnák.',
      pirate:
        "Yoni, 30, sits at th' heart o' Israel's החוזה החברתי: th' Ministry o' Education an' Bituach Leumi fund Moishe, David, Shlomo, an' Amos while Ariel an' Daniel march through th' rabbinate; Jacob, 24, takes Birthright as Abdullah an' Kasim draw Palestinian aid, an' Eitan an' Yael, 62, collect insurance afore AIPAC an' th' beach condos call, arr!",
    },
    profile: {
      baseline: 'US',
      deltas: { 'q05,d': 2, 'q03,b': 2, 'q04,e': 2, 'q07,a': 1, 'q08,c': 1, 'q10,b': -1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,b',
      'q04,e',
      'q05,d',
      'q06,a',
      'q07,a',
      'q08,c',
      'q09,b',
      'q10,b',
      'q11,a',
      'q12,c',
      'q13,b',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'MY',
    image: 'malaysia.png',
    label: { en: 'Malaysia', fr: 'Malaisie', hu: 'Malajzia', pirate: 'Malaysia' },
    description: {
      en: "Muhammad Hafiz, 31, sits at the center of Malaysia's kontrak sosial: Petronas, PNB, KWSP, and Khazanah flow through PMX and the Majlis Raja-Raja while Muhammad Firdaus delivers GrabFood toward Temasek; Nurhayati Nasution and Mohammad Abdur remit via Western Union as George Williams, 39, collects Hermès, Tesla, and MUJI past the croni-kroni and UiTM.",
      fr: "Muhammad Hafiz, 31 ans, est au centre du kontrak sosial malaisien : Petronas, PNB, KWSP et Khazanah passent par PMX et le Majlis Raja-Raja tandis que Muhammad Firdaus livre GrabFood vers Temasek ; Nurhayati Nasution et Mohammad Abdur envoient des fonds via Western Union alors que George Williams, 39 ans, encaisse Hermès, Tesla et MUJI au-delà des croni-kroni et de l'UiTM.",
      hu: 'Muhammad Hafiz, 31 éves, Malajzia kontrak sosial-jának közepén ül: a Petronas, PNB, KWSP és Khazanah a PMX-en és a Majlis Raja-Raja-n keresztül áramlik, miközben Muhammad Firdaus GrabFoodot szállít a Temasek felé; Nurhayati Nasution és Mohammad Abdur Western Unionon küld pénzt, George Williams, 39 éves, pedig Hermès, Tesla és MUJI termékeket gyűjt a croni-kroni és az UiTM mellett.',
      pirate:
        "Muhammad Hafiz, 31, sits at th' heart o' Malaysia's kontrak sosial: Petronas, PNB, KWSP, an' Khazanah flow through PMX an' th' Majlis Raja-Raja while Muhammad Firdaus delivers GrabFood toward Temasek; Nurhayati Nasution an' Mohammad Abdur remit via Western Union as George Williams, 39, collects Hermès, Tesla, an' MUJI past th' croni-kroni an' UiTM, arr!",
    },
    profile: {
      baseline: 'CN',
      deltas: { 'q05,d': 2, 'q01,b': 1, 'q11,b': 1, 'q03,b': 1, 'q06,b': 1 },
    },
    path: [
      'q01,b',
      'q02,a',
      'q03,b',
      'q04,c',
      'q05,d',
      'q06,b',
      'q07,b',
      'q08,c',
      'q09,c',
      'q10,c',
      'q11,b',
      'q12,d',
      'q13,b',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'NG',
    image: 'nigeria.jpg',
    label: { en: 'Nigeria', fr: 'Nigéria', hu: 'Nigéria', pirate: 'Nigeria' },
    description: {
      en: "Nduka, 30, sits at the center of Nigeria's social contract: WorldRemit and the black-tax burden fund Cousin Ifeoma, Uncle Ekene, and jollof rice while FIRS sends taxes to President Bola, 72, and his elders toward Gucci, Rolex, and the Ferrari; Officer Adebayo, Eghosa, and Tanimu collect their cut on the way to the club.",
      fr: "Nduka, 30 ans, est au centre du contrat social nigérian : WorldRemit et le fardeau de la black tax financent la cousine Ifeoma, l'oncle Ekene et le riz jollof tandis que le FIRS envoie les impôts au président Bola, 72 ans, et à ses anciens vers Gucci, Rolex et la Ferrari ; les officiers Adebayo, Eghosa et Tanimu prélèvent leur part en route vers le club.",
      hu: 'Nduka, 30 éves, Nigéria társadalmi szerződésének közepén ül: a WorldRemit és a black tax teher Ifeoma unokatestvérét, Ekene nagybácsit és a jollof rizst finanszírozza, miközben a FIRS adókat küld Bola elnöknek, 72 éves, és véneinek a Gucci, Rolex és Ferrari felé; Adebayo, Eghosa és Tanimu tisztok útközben levonják a részüket a klub felé.',
      pirate:
        "Nduka, 30, sits at th' heart o' Nigeria's social contract: WorldRemit an' th' black-tax burden fund Cousin Ifeoma, Uncle Ekene, an' jollof rice while FIRS sends taxes ta President Bola, 72, an' his elders toward Gucci, Rolex, an' th' Ferrari; Officer Adebayo, Eghosa, an' Tanimu collect their cut on th' way ta th' club, arr!",
    },
    profile: {
      baseline: 'FR',
      deltas: { 'q05,c': 3, 'q06,b': 2, 'q03,d': 1, 'q04,a': 2, 'q11,b': 1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,d',
      'q04,a',
      'q05,c',
      'q06,b',
      'q07,d',
      'q08,c',
      'q09,e',
      'q10,c',
      'q11,b',
      'q12,d',
      'q13,c',
      'q14,c',
      'q15,a',
    ],
  },
  {
    code: 'PT',
    image: 'portugal.jpg',
    label: { en: 'Portugal', fr: 'Portugal', hu: 'Portugália', pirate: 'Portugal' },
    description: {
      en: "João, 30, sits at the center of Portugal's contrato social: Segurança Social and the SNS fund Heloísa, 25, from Brazil, Angola, and India via APOIAR and IEFP while Pedro and Júlia, 70, collect pensions on the way to the beach resort.",
      fr: "João, 30 ans, est au centre du contrato social portugais : la Segurança Social et le SNS financent Heloísa, 25 ans, venue du Brésil, d'Angola et d'Inde via APOIAR et l'IEFP tandis que Pedro et Júlia, 70 ans, encaissent leurs pensions en route vers la station balnéaire.",
      hu: 'João, 30 éves, Portugália contrato social-jának közepén ül: a Segurança Social és az SNS Heloísát, 25 évest finanszírozza Brazíliából, Angolából és Indiából az APOIAR és IEFP útján, miközben Pedro és Júlia, 70 éves, nyugdíjat gyűjtenek a tengerparti üdülő felé.',
      pirate:
        "João, 30, sits at th' heart o' Portugal's contrato social: Segurança Social an' th' SNS fund Heloísa, 25, from Brazil, Angola, an' India via APOIAR an' IEFP while Pedro an' Júlia, 70, collect pensions on th' way ta th' beach resort, arr!",
    },
    profile: {
      baseline: 'ES',
      deltas: { 'q03,b': 1, 'q05,c': 1, 'q01,a': 0, 'q05,e': 1, 'q04,b': -1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,b',
      'q04,b',
      'q05,c',
      'q06,c',
      'q07,d',
      'q08,c',
      'q09,c',
      'q10,c',
      'q11,c',
      'q12,d',
      'q13,c',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'RU',
    image: 'russia.jpg',
    label: { en: 'Russia', fr: 'Russie', hu: 'Oroszország', pirate: 'Russia' },
    description: {
      en: "Dima, 30, sits at the center of Russia's общественный договор: the Ministry of Economic Development funds Ramzan, 48, and the coat of arms reaches Bashar, 59, while Vladimir, 72, builds the palace; Sasha, 25, loots through Rosgvardia and Lyudmila, 53, collects her pension fund toward a red wooden house.",
      fr: "Dima, 30 ans, est au centre de l'общественный договор russe : le ministère du Développement économique finance Ramzan, 48 ans, et les armoiries atteignent Bashar, 59 ans, tandis que Vladimir, 72 ans, construit le palais ; Sasha, 25 ans, pille via la Rosgvardia et Lyudmila, 53 ans, encaisse son fonds de pension vers une maison en bois rouge.",
      hu: 'Dima, 30 éves, Oroszország общественный договор közepén ül: a gazdasági fejlesztési minisztérium Ramzant, 48 évest finanszírozza, a címer Basharig, 59 éves, ér, Vladimir, 72 éves, pedig építi a palotát; Sasha, 25 éves, a Rosgvardián keresztül fosztogat, Lyudmila, 53 éves, pedig nyugdíjalapját egy piros faház felé váltja ki.',
      pirate:
        "Dima, 30, sits at th' heart o' Russia's общественный договор: th' Ministry o' Economic Development funds Ramzan, 48, an' th' coat o' arms reaches Bashar, 59, while Vladimir, 72, builds th' palace; Sasha, 25, loots through Rosgvardia an' Lyudmila, 53, collects her pension fund toward a red wooden house, arr!",
    },
    profile: {
      baseline: 'DE',
      deltas: { 'q04,a': 2, 'q04,e': 2, 'q05,f': 1, 'q03,a': 1, 'q07,b': 1, 'q15,b': 1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,a',
      'q04,a',
      'q04,e',
      'q05,f',
      'q06,c',
      'q07,b',
      'q08,b',
      'q09,a',
      'q10,d',
      'q11,a',
      'q12,a',
      'q13,b',
      'q15,b',
    ],
  },
  {
    code: 'ZA',
    image: 'south_africa.jpg',
    label: {
      en: 'South Africa',
      fr: 'Afrique du Sud',
      hu: 'Dél-afrikai Köztársaság',
      pirate: 'South Africa',
    },
    description: {
      en: "Johan van der Merwe, 28, sits at the center of South Africa's sosiale kontrak: SARS feeds SASSA and the ANC while Sipho, 13, draws grants toward Johannesburg crime and cramped security villages; farm murders collect stolen police weapons as BELA, land expropriation, and Hennessy flow past News24's end of white monopoly capital.",
      fr: "Johan van der Merwe, 28 ans, est au centre du sosiale kontrak sud-africain : le SARS alimente le SASSA et l'ANC tandis que Sipho, 13 ans, tire les allocations vers la criminalité de Johannesburg et les villages sécurisés exigus ; les meurtres de fermiers collectent les armes volées de la police tandis que BELA, l'expropriation des terres et Hennessy passent au-delà de la fin du capital monopoliste blanc de News24.",
      hu: 'Johan van der Merwe, 28 éves, Dél-Afrika sosiale kontrak-jának közepén ül: a SARS a SASSA-t és az ANC-t táplálja, miközben Sipho, 13 éves, támogatásokat von el Johannesburg bűnözése és szűk biztonsági falvak felé; a farmgyilkosságok lopott rendőrfegyvereket gyűjtenek, miközben a BELA, a földkiíratás és a Hennessy a News24 fehér monopóliumtőke vége mellett áramlik.',
      pirate:
        "Johan van der Merwe, 28, sits at th' heart o' South Africa's sosiale kontrak: SARS feeds SASSA an' th' ANC while Sipho, 13, draws grants toward Johannesburg crime an' cramped security villages; farm murders collect stolen police weapons as BELA, land expropriation, an' Hennessy flow past News24's end o' white monopoly capital, arr!",
    },
    profile: {
      baseline: 'GB',
      deltas: { 'q05,c': 3, 'q06,b': 2, 'q03,d': 1, 'q08,c': 1, 'q04,e': 1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,d',
      'q04,e',
      'q05,c',
      'q06,b',
      'q07,d',
      'q08,c',
      'q09,e',
      'q10,c',
      'q11,c',
      'q12,d',
      'q13,c',
      'q14,b',
      'q15,a',
    ],
  },
  {
    code: 'TR',
    image: 'turkey.jpg',
    label: { en: 'Turkey', fr: 'Turquie', hu: 'Törökország', pirate: 'Turkey' },
    description: {
      en: "Serkan, 33, sits at the center of Turkey's social contract: TOKİ, SGK, and the Red Crescent fund Havin, 68, and İsmail, 54, while MİT reaches Abdullah in Somalia and Ibrahim in Syria; Recep, 26, wires the pole past Olga toward Ali and Ahmet on the evening news.",
      fr: "Serkan, 33 ans, est au centre du contrat social turc : TOKİ, SGK et le Croissant-Rouge financent Havin, 68 ans, et İsmail, 54 ans, tandis que le MİT atteint Abdullah en Somalie et Ibrahim en Syrie ; Recep, 26 ans, câble le poteau au-delà d'Olga vers Ali et Ahmet au journal du soir.",
      hu: 'Serkan, 33 éves, Törökország társadalmi szerződésének közepén ül: a TOKİ, SGK és a Vörös Félhold Havint, 68 évest, és İsmailt, 54 évest finanszírozza, miközben a MİT Abdullahig ér Szomáliában és Ibrahimig Szíriában; Recep, 26 éves, a póznát Olga mellett Ali és Ahmet felé köti az esti hírekben.',
      pirate:
        "Serkan, 33, sits at th' heart o' Turkey's social contract: TOKİ, SGK, an' th' Red Crescent fund Havin, 68, an' İsmail, 54, while MİT reaches Abdullah in Somalia an' Ibrahim in Syria; Recep, 26, wires th' pole past Olga toward Ali an' Ahmet on th' evenin' news, arr!",
    },
    profile: {
      baseline: 'DE',
      deltas: { 'q05,d': 2, 'q03,b': 2, 'q07,d': 1, 'q04,e': 1, 'q10,d': 1, 'q05,b': -1 },
    },
    path: [
      'q01,a',
      'q02,a',
      'q03,b',
      'q04,e',
      'q05,d',
      'q06,b',
      'q07,d',
      'q08,c',
      'q09,c',
      'q10,d',
      'q11,c',
      'q12,c',
      'q13,b',
      'q14,b',
      'q15,a',
    ],
  },
]

function escapeCsv(value) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

// Update countries.csv
const existingCountries = fs
  .readFileSync(path.join(dataDir, 'countries.csv'), 'utf8')
  .trim()
  .split('\n')
const existingCodes = new Set(existingCountries.slice(1).map((line) => line.split(',')[0]))
const countryLines = [...existingCountries]
for (const country of newCountries) {
  if (!existingCodes.has(country.code)) {
    countryLines.push(`${country.code},${country.image}`)
  }
}
fs.writeFileSync(path.join(dataDir, 'countries.csv'), `${countryLines.join('\n')}\n`)

// Append profiles
const profileLines = fs
  .readFileSync(path.join(dataDir, 'quiz_score_profiles.csv'), 'utf8')
  .trim()
  .split('\n')
const profileSet = new Set(profileLines.slice(1).map((line) => line.split(',')[0]))
for (const country of newCountries) {
  if (profileSet.has(country.code)) continue
  for (const [key, delta] of Object.entries(country.profile.deltas)) {
    const [question_id, answer_id] = key.split(',')
    profileLines.push(
      `${country.code},${country.profile.baseline},${question_id},${answer_id},${delta}`,
    )
  }
}
fs.writeFileSync(path.join(dataDir, 'quiz_score_profiles.csv'), `${profileLines.join('\n')}\n`)

// Insert localization before quiz.title
const localization = fs.readFileSync(path.join(dataDir, 'Localization.csv'), 'utf8')
const marker = 'quiz.title,'
const [before, after] = localization.split(marker)
const localizationRows = []
for (const country of newCountries) {
  if (localization.includes(`country.${country.code}.label`)) continue
  localizationRows.push(
    `country.${country.code}.label,${escapeCsv(country.label.en)},${escapeCsv(country.label.fr)},${escapeCsv(country.label.hu)},${escapeCsv(country.label.pirate)}`,
    `country.${country.code}.description,${escapeCsv(country.description.en)},${escapeCsv(country.description.fr)},${escapeCsv(country.description.hu)},${escapeCsv(country.description.pirate)}`,
  )
}
fs.writeFileSync(
  path.join(dataDir, 'Localization.csv'),
  `${before}${localizationRows.join('\n')}\n${marker}${after}`,
)

// Validate paths
const quizScoresCsv = fs.readFileSync(path.join(dataDir, 'quiz_scores.csv'), 'utf8')
const profilesCsv = fs.readFileSync(path.join(dataDir, 'quiz_score_profiles.csv'), 'utf8')
const { scores, countries } = rebalanceQuizScores(quizScoresCsv, profilesCsv)

console.log('Added countries:', newCountries.map((c) => c.code).join(', '))
for (const country of newCountries) {
  const result = computePathWinner(scores, country.path, countries)
  console.log(
    `${country.code} path winner: ${result.winner} (${result.top})${result.winner !== country.code ? ' EXPECTED ' + country.code : ''}`,
  )
}

fs.writeFileSync(
  path.join(dataDir, 'quiz_scores.csv'),
  rebalanceQuizScores(quizScoresCsv, profilesCsv).csvContent,
)
console.log('Updated quiz_scores.csv')

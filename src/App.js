import React, { useState } from 'react';

// Helper function to get a random integer within a range
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to calculate asset change based on a given level
const getAssetChangeByLevel = (assetType, level) => {
  // Determine the sign of the change from the level variable
  const sign = level < 0 ? -1 : 1;
  // Use absolute value of level to find the correct range
  const absLevel = Math.abs(level);

  if (absLevel === 1) return 0;
  
  let min, max;
  switch (assetType) {
    case 'ทองคำ':
      if (absLevel === 2) [min, max] = [1, 3];
      else if (absLevel === 3) [min, max] = [4, 5];
      else if (absLevel === 4) [min, max] = [6, 7];
      else if (absLevel === 5) [min, max] = [8, 10];
      break;
    case 'ที่ดิน':
      if (absLevel === 2) [min, max] = [1, 1];
      else if (absLevel === 3) [min, max] = [2, 2];
      else if (absLevel === 4) [min, max] = [3, 3];
      else if (absLevel === 5) [min, max] = [4, 5];
      break;
    case 'คริปโต':
      if (absLevel === 2) [min, max] = [1, 3];
      else if (absLevel === 3) [min, max] = [4, 7];
      else if (absLevel === 4) [min, max] = [8, 11];
      else if (absLevel === 5) [min, max] = [12, 15];
      break;
    default:
      return 0;
  }

  // Calculate a random value within the range and apply the sign
  return sign * getRandomInt(min, max);
};

const App = () => {
  const [year, setYear] = useState(0);
  const [stage, setStage] = useState('initial'); // 'initial', 'scenario', 'result', 'end'
  const [scenario, setScenario] = useState({});
  const [scenarioResult, setScenarioResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScenarioIndex, setLastScenarioIndex] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [welcomePage, setWelcomePage] = useState(1);
  
  // New state variables for scenario logic
  const [negativeScenarioCount, setNegativeScenarioCount] = useState(0);
  const [usedScenarioIndices, setUsedScenarioIndices] = useState([]);

  const [assets, setAssets] = useState({
    'ทองคำ': { value: 15, change: 0, totalValue: 15 },
    'ที่ดิน': { value: 15, change: 0, totalValue: 15 },
    'คริปโต': { value: 5, change: 0, totalValue: 5 },
  });
  const [businesses, setBusinesses] = useState({
    'ร้านอาหาร': { value: 3, change: 0 },
    'ร้านวัตถุดิบ': { value: 3, change: 0 },
    'บริการส่งพัสดุ': { value: 3, change: 0 },
  });
  const [stocks, setStocks] = useState({
    stockA: { value: 0, change: 0 },
    stockB: { value: 0, change: 0 },
    stockC: { value: 0, change: 0 },
    stockD: { value: 0, change: 0 },
    stockE: { value: 0, change: 0 },
    stockF: { value: 0, change: 0 },
    stockG: { value: 0, change: 0 },
  });

  const allScenarios = [
     {
      text: 'เศรษฐกิจโลกเผชิญวิกฤตรอบใหญ่ ธนาคารขนาดใหญ่ล้มระเนระนาด ตลาดการเงินหยุดชะงัก ผู้คนตกงานทั่วโลก ความเชื่อมั่นหายไปในพริบตา',
      results: {
        description: 'ตลาดหุ้นและคริปโต ดิ่งเหวที่ดิน ทรุดหนักธุรกิจร้านอาหาร, วัตถุดิบ, และบริการส่งพัสดุ ได้รับผลกระทบอย่างหนักทองคำ มีราคาสูงขึ้น ในฐานะ สินทรัพย์ปลอดภัย',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 3, description: 'เป็นสินทรัพย์ปลอดภัยที่ผู้คนแสวงหาเมื่อตลาดมีความเสี่ยงสูงและค่าเงินไม่มั่นคง' },
          { assetName: 'ที่ดิน', changeLevel: -5, description: 'เศรษฐกิจหยุดชะงัก การซื้อขายอสังหาริมทรัพย์หยุดชะงัก และมีหนี้เสียจากสินเชื่อธนาคาร' },
          { assetName: 'คริปโต', changeLevel: -5, description: 'ขาดความเชื่อมั่นของนักลงทุนอย่างรุนแรงและถูกมองว่าเป็นสินทรัพย์ที่มีความเสี่ยงสูงมาก' },
          { assetName: 'ร้านอาหาร', change: -5, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -5, description: '' },
          { assetName: 'stockB', change: -5, description: '' },
          { assetName: 'stockC', change: -5, description: '' },
          { assetName: 'stockD', change: -5, description: '' },
          { assetName: 'stockE', change: -5, description: '' },
          { assetName: 'stockF', change: -5, description: '' },
          { assetName: 'stockG', change: 4, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/jjfjFx8n/1.png",
      sentiment: -1,
    },
    {
      text: 'ราคาน้ำมันดิบพุ่งสูงขึ้นอย่างมหาศาล ค่าขนส่งและค่าผลิตสินค้าเพิ่มขึ้นตาม ทำให้ราคาสินค้าทุกชนิดแพงขึ้นอย่างมาก ส่งผลให้กำลังซื้อของผู้คนลดลง',
      results: {
        description: 'ภาวะเงินเฟ้อสูงขึ้น ต้นทุนทุกอย่างแพงขึ้น ร้านอาหาร, วัตถุดิบ, และบริการส่งพัสดุ ได้รับผลกระทบหุ้นโดยรวม มีราคาลดลงทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: 'เป็นสินทรัพย์ป้องกันเงินเฟ้อ เมื่อต้นทุนสินค้าและบริการโดยรวมสูงขึ้น' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: 'ผู้คนไม่กล้าลงทุนหรือซื้อขายเนื่องจากอัตราดอกเบี้ยสูงและเศรษฐกิจไม่ดี' },
          { assetName: 'คริปโต', changeLevel: 1, description: 'ยังไม่มีบทบาทสำคัญ ในฐานะสินทรัพย์หลบภัยจากเงินเฟ้อในยุคนั้น' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -4, description: '' },
          { assetName: 'stockB', change: -4, description: '' },
          { assetName: 'stockC', change: 0, description: '' },
          { assetName: 'stockD', change: -4, description: '' },
          { assetName: 'stockE', change: 0, description: '' },
          { assetName: 'stockF', change: -4, description: '' },
          { assetName: 'stockG', change: 4, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/vB8p6X68/2.png",
      sentiment: -1,
    },
    {
      text: 'หายนะจากธรรมชาติเกิดขึ้น เช่น แผ่นดินไหว สึนามิ หรือพายุร้ายพัดถล่มพื้นที่สำคัญ โครงสร้างพื้นฐานเสียหายอย่างหนัก การผลิตหยุดชะงัก ผู้คนได้รับความเดือดร้อนแสนสาหัส',
      results: {
        description: 'ที่ดิน และ อสังหาริมทรัพย์ได้รับความเสียหาย ร้านอาหาร และ ร้านวัตถุดิบหยุดชะงัก บริการส่งพัสดุ ได้รับผลกระทบทองคำ มีราคาสูงขึ้น คริปโตเคอร์เรนซี มีความผันผวนสูง',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: 'เป็นที่หลบภัย ในช่วงวิกฤตและสถานการณ์ที่ไม่แน่นอนสูง' },
          { assetName: 'ที่ดิน', changeLevel: -5, description: 'โครงสร้างพื้นฐานเสียหายอย่างรุนแรงมูลค่าของที่ดินในพื้นที่ประสบภัยลดลงอย่างมาก' },
          { assetName: 'คริปโต', changeLevel: -4, description: 'ตลาดขาดความเชื่อมั่นและขาดสภาพคล่องในการซื้อขาย' },
          { assetName: 'ร้านอาหาร', change: -5, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: 0, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/QdJD9Fnb/3.png",
      sentiment: -1,
    },
    {
      text: 'อัตราดอกเบี้ยพุ่งสูงขึ้นอย่างต่อเนื่อง ธนาคารกลางทั่วโลกปรับขึ้นอัตราดอกเบี้ยเพื่อสกัดภาวะเงินเฟ้อ ทำให้การกู้ยืมมีค่าใช้จ่ายสูงขึ้นมาก ผู้คนไม่กล้าลงทุนและไม่กล้าใช้จ่าย',
      results: {
        description: 'การลงทุน ชะลอตัวลง หุ้นและคริปโตเคอร์เรนซี มีราคาลดลง การซื้อขายที่ดินยากขึ้น ร้านค้า มียอดขายลดลงทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/0N5sp9Tq/4.png",
      sentiment: -1,
    },
    {
      text: 'แหล่งพลังงานสะอาดขนาดใหญ่ถูกค้นพบ ต้นทุนพลังงานลดลงอย่างมาก ซึ่งจะเปลี่ยนแปลงโฉมหน้าอุตสาหกรรมพลังงานทั่วโลก',
      results: {
        description: 'ต้นทุนการผลิต ลดลง ร้านอาหาร, วัตถุดิบ, และบริการส่งพัสดุ ได้รับประโยชน์หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้นทองคำ มีราคาลดลง',
        effects: [
          { assetName: 'ทองคำ', changeLevel: -4, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: -1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/jqPFdG16/5.png",
      sentiment: 1,
    },
    {
      text: 'โลกเปิดประตูการค้า ประเทศต่างๆ ร่วมมือกันทำข้อตกลงการค้าครั้งใหญ่ ลดกำแพงภาษี ทำให้การซื้อขายระหว่างประเทศคึกคักอย่างมาก',
      results: {
        description: 'การค้าโลก เฟื่องฟู ร้านวัตถุดิบและบริการส่งพัสดุ ได้รับประโยชน์หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้นที่ดิน มีมูลค่าเพิ่มขึ้น ทองคำ มีราคาลดลง',
        effects: [
          { assetName: 'ทองคำ', changeLevel: -4, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: -1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/HksZzjk3/6.png",
      sentiment: 1,
    },
    {
      text: 'โลกเผชิญหน้ากับเชื้อโรคร้ายสายพันธุ์ใหม่ที่แพร่กระจายอย่างรวดเร็ว ผู้คนหวาดกลัว การเดินทางถูกจำกัด กิจกรรมทางเศรษฐกิจหยุดชะงัก',
      results: {
        description: 'การเดินทาง หยุดชะงัก ร้านอาหาร ทรุดหนัก ธุรกิจวัตถุดิบและที่ดิน ได้รับผลกระทบ บริการส่งพัสดุ มีปริมาณเพิ่มขึ้น ทองคำ มีราคาสูงขึ้นหุ้น มีราคาลดลง',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 3, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -5, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/kg1jp9VC/7.png",
      sentiment: -1,
    },
    {
      text: 'นวัตกรรมชีวภาพล้ำสมัยเกิดขึ้น รักษาโรคร้ายได้ ผลผลิตทางการเกษตรดีขึ้น ชีวิตของผู้คนเปลี่ยนแปลงไปตลอดกาล',
      results: {
        description: 'หุ้นกลุ่มเทคโนโลยีชีวภาพและยา มีราคาสูงขึ้นอย่างมาก ร้านวัตถุดิบ ได้รับประโยชน์ ที่ดินเพื่อการวิจัยมีมูลค่าเพิ่มขึ้น สินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/sXp4sR2v/8.png",
      sentiment: 1,
    },
    {
      text: 'ธรรมชาติเกิดความพิโรธ คลื่นความร้อน น้ำท่วม และพายุพัดถล่มบ่อยขึ้น สร้างความเสียหายใหญ่หลวงต่อเมืองและพื้นที่เพาะปลูก ส่งผลกระทบต่อเศรษฐกิจโลก',
      results: {
        description: 'พืชผลทางการเกษตร ได้รับความเสียหายที่ดิน มีมูลค่าลดลง ร้านอาหารและร้านวัตถุดิบ ได้รับผลกระทบ หุ้น มีราคาลดลงทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -5, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/pLpQyjTN/9.png",
      sentiment: -1,
    },
    {
      text: 'ประเทศชาติลงทุนครั้งใหญ่ รัฐบาลทุ่มงบประมาณสร้างถนน รถไฟความเร็วสูง และท่าเรือใหม่ สร้างงาน สร้างโอกาส เชื่อมโยงทุกสิ่งเข้าด้วยกัน',
      results: {
        description: 'ที่ดิน มีมูลค่าเพิ่มขึ้น บริการส่งพัสดุ ได้รับประโยชน์ ร้านอาหารและร้านวัตถุดิบ มียอดขายเพิ่มขึ้น หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 3, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/pLpQyjTN/9.png",
      sentiment: 1,
    },
    {
      text: 'ประเทศยักษ์ใหญ่เผชิญภาวะถังแตก หนี้ของรัฐบาลพุ่งสูงขึ้นอย่างมาก นักลงทุนเริ่มไม่มั่นใจว่ารัฐบาลจะสามารถชำระหนี้ได้หรือไม่ ส่งผลให้ตลาดการเงินปั่นป่วน',
      results: {
        description: 'ตลาด มีความผันผวนสูง หุ้น, คริปโตเคอร์เรนซี, และที่ดิน มีราคาลดลงอย่างมากร้านค้า มียอดขายตกต่ำทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 3, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/ZK1nFvHz/11.png",
      sentiment: -1,
    },
    {
      text: 'หลายประเทศร่วมมือกันจัดตั้งพันธมิตรทางเศรษฐกิจ ลดกำแพงทางการค้า ทำให้ภูมิภาคแข็งแกร่งและดึงดูดการลงทุนมากขึ้น',
      results: {
        description: 'การค้า เติบโตร้านวัตถุดิบและบริการส่งพัสดุ ได้รับประโยชน์หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้นที่ดิน มีมูลค่าเพิ่มขึ้น ทองคำ คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/ZK1nFvHz/11.png",
      sentiment: 1,
    },
    {
      text: 'การหางานง่าย แต่การหาคนทำงานกลับยาก หลายอุตสาหกรรมทั่วโลกประสบปัญหาขาดแคลนแรงงานอย่างหนัก ทำให้ต้นทุนการผลิตพุ่งสูงขึ้นและประสิทธิภาพลดลง',
      results: {
        description: 'ต้นทุนการผลิต เพิ่มขึ้น การผลิต ชะลอตัวร้านอาหารและร้านวัตถุดิบ ได้รับผลกระทบอย่างหนัก หุ้นที่พึ่งพาแรงงานมาก มีราคาลดลง ทองคำ มีราคาสูงขึ้นเล็กน้อย',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 1, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -3, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/W4V4xRx9/13.png",
      sentiment: -1,
    },
    {
      text: 'โรงงานอัจฉริยะถือกำเนิดขึ้น หุ่นยนต์และระบบอัตโนมัติเข้ามาแทนที่แรงงานคน ทำให้การผลิตรวดเร็ว ประหยัด และมีประสิทธิภาพสูงสุด',
      results: {
        description: 'ต้นทุนการผลิต ลดลง หุ้นของบริษัทเทคโนโลยีและบริษัทที่ปรับตัวใช้ AI มีราคาสูงขึ้น ที่ดินสำหรับโรงงานอัจฉริยะมีมูลค่าเพิ่มขึ้น สินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/Tw7YyK1S/14.png",
      sentiment: 1,
    },
    {
      text: 'รัฐบาลจัดเก็บภาษีเพิ่มขึ้น สินทรัพย์บางชนิดและกำไรของธุรกิจถูกเก็บภาษีเพิ่มขึ้น เพื่อนำรายได้เข้าภาครัฐ ทำให้การลงทุนซบเซา',
      results: {
        description: 'กำไรธุรกิจ ลดลง หุ้น, ที่ดิน, คริปโตเคอร์เรนซี มีราคาลดลง ร้านอาหาร, วัตถุดิบ, และบริการส่งพัสดุ ได้รับผลกระทบทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -4, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/ZKyKRKS7/15.png",
      sentiment: -1,
    },
    {
      text: 'แหล่งแร่หายากมหาศาลที่จำเป็นต่อเทคโนโลยีสมัยใหม่ถูกค้นพบ ทำให้ราคาสินแร่ผันผวนและเกิดอุตสาหกรรมใหม่ขึ้น',
      results: {
        description: 'หุ้นที่เกี่ยวข้องกับแร่และเทคโนโลยีใหม่ๆ มีราคาสูงขึ้น ร้านวัตถุดิบ ได้รับประโยชน์ทองคำ คงที่ที่ดินบริเวณแหล่งแร่มีมูลค่าเพิ่มขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 3, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/XYfjfHX9/16.png",
      sentiment: 1,
    },
    {
      text: 'เส้นทางค้าขายหยุดชะงัก โรงงานขนาดใหญ่ปิดตัวลง ทำให้สินค้าขาดตลาดทั่วโลกและราคาสินค้าพุ่งสูงขึ้น',
      results: {
        description: 'สินค้า ขาดแคลน ร้านวัตถุดิบและร้านอาหาร หาของยาก บริการส่งพัสดุ ติดขัด หุ้นที่พึ่งพาการนำเข้าและส่งออก มีราคาลดลงอย่างมากทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 1, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/0jKxbZLM/17.png",
      sentiment: -1,
    },
    {
      text: 'ทั้งภาครัฐและเอกชนทุ่มงบประมาณมหาศาลเพื่อพัฒนาเทคโนโลยีอวกาศ ทำให้เกิดนวัตกรรมและการจ้างงานใหม่ๆ',
      results: {
        description: 'เทคโนโลยีใหม่ เกิดขึ้น การจ้างงาน เพิ่มขึ้น หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้น คริปโตเคอร์เรนซี ได้รับอานิสงส์',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 3, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/wxnRFrxr/18.png",
      sentiment: 1,
    },
    {
      text: 'ผู้คนหันมาใส่ใจสุขภาพและสิ่งแวดล้อมมากขึ้น ผู้คนหันมาซื้อสินค้าที่เป็นมิตรต่อสิ่งแวดล้อมและดีต่อสุขภาพมากขึ้น ทำให้ธุรกิจต้องปรับตัวครั้งใหญ่',
      results: {
        description: 'ธุรกิจต้อง ปรับตัวอย่างมากหุ้นของบริษัทที่ปรับตัวได้ดี มีราคาเพิ่มขึ้นทองคำและที่ดิน คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 1, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 0, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 0, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/BvhXFYwM/19.png",
      sentiment: 1,
    },
    {
      text: 'ธนาคารสำคัญระดับโลกประสบปัญหาการล้มละลาย สร้างความตื่นตระหนกในตลาดการเงินทั่วโลก',
      results: {
        description: 'ความเชื่อมั่นทางการเงิน หายไปอย่างรวดเร็ว หุ้น, คริปโตเคอร์เรนซี, และที่ดิน มีราคาลดลงอย่างมาก ร้านค้า มียอดขายตกต่ำ ทองคำ มีราคาสูงขึ้นอย่างมาก',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 3, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -5, description: '' },
          { assetName: 'คริปโต', changeLevel: -5, description: '' },
          { assetName: 'ร้านอาหาร', change: -5, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -5, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -5, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/KvX4tgJS/20.png",
      sentiment: -1,
    },
    {
      text: 'ประเทศต่างๆ ร่วมมือกันจัดตั้งองค์กรใหม่เพื่อแก้ไขปัญหาสากล เช่น ความยากจน หรือโรคระบาด',
      results: {
        description: 'ความร่วมมือ เพิ่มขึ้น ปัญหา ลดลง เศรษฐกิจ มีเสถียรภาพหุ้นและคริปโตเคอร์เรนซี มีราคาสูงขึ้นเล็กน้อย ทองคำ มีราคาลดลงสินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: -1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/Dw6ZVpFn/21.png",
      sentiment: 1,
    },
    {
      text: 'อินเทอร์เน็ต 5G/6G และโครงข่ายความเร็วสูงขยายตัวทั่วโลก ทำให้ธุรกิจดิจิทัลเติบโตอย่างรวดเร็ว และการสื่อสารไร้พรมแดนเป็นจริง',
      results: {
        description: 'ธุรกิจดิจิทัล เติบโต คริปโตเคอร์เรนซีและหุ้นกลุ่มเทคโนโลยี มีราคาสูงขึ้นบริการส่งพัสดุ มีประสิทธิภาพสูงขึ้น ร้านอาหารและร้านวัตถุดิบมีช่องทางขายออนไลน์เพิ่มขึ้น ที่ดินสำหรับดาต้าเซ็นเตอร์มีมูลค่าเพิ่มขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 3, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/d0SV37Lf/22.png",
      sentiment: 1,
    },
    {
      text: 'หลายพื้นที่ประสบปัญหาขาดแคลนน้ำจืดอย่างหนัก ส่งผลกระทบต่อภาคการเกษตรและอุตสาหกรรมทั่วโลก',
      results: {
        description: 'พืชผลทางการเกษตร ได้รับความเสียหายร้านวัตถุดิบ ขาดแคลน ที่ดิน มีมูลค่าลดลงร้านอาหาร ได้รับผลกระทบหุ้นที่ใช้น้ำมาก มีราคาลดลงทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -5, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/gJCcyfyq/23.png",
      sentiment: -1,
    },
    {
      text: 'ระบบการศึกษาทั่วโลกปรับปรุงครั้งใหญ่ เน้นทักษะแห่งอนาคต ทำให้คนรุ่นใหม่เก่งขึ้นและสามารถพัฒนาประเทศได้',
      results: {
        description: 'บุคลากร มีศักยภาพสูงขึ้นนวัตกรรม เพิ่มขึ้น หุ้นกลุ่มเทคโนโลยีการศึกษา มีราคาสูงขึ้น ที่ดินสำหรับสถานศึกษาอาจมีมูลค่าเพิ่มขึ้น สินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/xTSTXV19/24.png",
      sentiment: 1,
    },
    {
      text: 'ตลาดคาร์บอนเครดิตเติบโตอย่างรวดเร็ว ธุรกิจต้องซื้อขายสิทธิ์การปล่อยมลพิษ ทำให้บริษัทต้องลดการปล่อยคาร์บอนเพื่อช่วยโลกและประหยัดค่าใช้จ่าย',
      results: {
        description: 'ธุรกิจต้อง ลงทุนเพิ่มขึ้นสิ่งแวดล้อม ดีขึ้น หุ้นกลุ่มพลังงานสะอาด มีราคาสูงขึ้นหุ้นกลุ่มอุตสาหกรรมเก่า มีราคาลดลง ที่ดินสำหรับโครงการสิ่งแวดล้อมมีมูลค่าเพิ่มขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/W1NN7mZK/25.png",
      sentiment: 1,
    },
    {
      text: 'ยารักษาโรคร้ายแรงที่เคยคร่าชีวิตผู้คนถูกค้นพบ ทำให้ผู้คนมีสุขภาพดีขึ้น ลดภาระค่ารักษาพยาบาล',
      results: {
        description: 'สุขภาพของผู้คน ดีขึ้นคุณภาพชีวิต สูงขึ้น หุ้นกลุ่มเวชภัณฑ์และเทคโนโลยีทางการแพทย์ มีราคาสูงขึ้นอย่างมาก ร้านอาหารและร้านวัตถุดิบ ดีขึ้นสินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/rFcM8Gfm/26.png",
      sentiment: 1,
    },
    {
      text: 'ทั่วโลกเร่งใช้พลังงานหมุนเวียน ทำให้ความต้องการพลังงานฟอสซิลลดลงอย่างรวดเร็ว',
      results: {
        description: 'พลังงานสะอาด รุ่งเรือง ธุรกิจน้ำมัน ซบเซาทองคำ มีราคาสูงขึ้น ที่ดินสำหรับพลังงานหมุนเวียนมีมูลค่าเพิ่มขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 4, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/650wT7Ph/27.png",
      sentiment: 1,
    },
    {
      text: 'ประชากรทั่วโลกมีอายุยืนยาวขึ้น อัตราการเกิดน้อยลง ทำให้เกิดสังคมสูงวัย ซึ่งส่งผลกระทบต่อแรงงานและการบริโภค',
      results: {
        description: 'แรงงาน ลดลงร้านอาหารและร้านวัตถุดิบ ได้รับผลกระทบหุ้นกลุ่มสุขภาพและบริการผู้สูงอายุ มีราคาสูงขึ้น ที่ดินสำหรับที่พักผู้สูงอายุมีมูลค่าเพิ่มขึ้น สินทรัพย์อื่น คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: 1, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/VkZ8Bxmr/28.png",
      sentiment: -1,
    },
    {
      text: 'เทคโนโลยีบล็อกเชนที่รวดเร็วและประหยัดพลังงานถูกนำมาใช้ในหลายอุตสาหกรรม นอกเหนือจากคริปโตเคอร์เรนซี',
      results: {
        description: 'ธุรกรรมมีความปลอดภัยและต้นทุนลดลง คริปโตเคอร์เรนซี มีราคาสูงขึ้นอย่างมาก หุ้นที่ใช้เทคโนโลยีนี้ มีราคาสูงขึ้นบริการส่งพัสดุมีระบบจัดการที่ดีขึ้น ทองคำและที่ดิน คงที่',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 3, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/5tZWD8Hf/29.png",
      sentiment: 1,
    },
    {
      text: 'เทคโนโลยีใหม่ๆ เช่น Hyperloop หรือโดรนขนส่งพัสดุ ได้รับการพัฒนาและนำมาใช้จริงในวงกว้าง',
      results: {
        description: 'บริการส่งพัสดุ มีปริมาณเพิ่มขึ้นมาก ร้านอาหารและร้านวัตถุดิบ ได้รับประโยชน์ หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้นที่ดินรอบสถานีขนส่งใหม่มีมูลค่าเพิ่มขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 1, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/brPcw8HM/30.png",
      sentiment: 1,
    },
    {
      text: 'ชนชั้นกลางในประเทศเศรษฐกิจเกิดใหม่ในเอเชียเพิ่มขึ้นอย่างรวดเร็ว ทำให้กำลังซื้อในภูมิภาคนี้พุ่งสูงขึ้นอย่างมาก',
      results: {
        description: 'กำลังซื้อ เพิ่มขึ้นมหาศาลร้านอาหาร, วัตถุดิบ, และบริการส่งพัสดุ มีปริมาณเพิ่มขึ้น หุ้นที่ทำธุรกิจในเอเชีย มีราคาสูงขึ้นที่ดินในเมืองใหญ่ของเอเชียมีมูลค่าเพิ่มขึ้น ทองคำ มีราคาลดลงเล็กน้อย',
        effects: [
          { assetName: 'ทองคำ', changeLevel: -4, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 2, description: '' },
          { assetName: 'ร้านอาหาร', change: 3, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 3, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 3, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: -1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/cLbp8fBf/31.png",
      sentiment: 1,
    },
    {
      text: 'การยืนยันการค้นพบสิ่งมีชีวิตนอกโลก ทำให้เกิดความตื่นเต้นระดับโลก ส่งผลกระทบต่อการวิจัยและเทคโนโลยี',
      results: {
        description: 'วิทยาศาสตร์และเทคโนโลยี ก้าวหน้าอย่างก้าวกระโดด คริปโตเคอร์เรนซี ได้รับอานิสงส์หุ้นกลุ่มเทคโนโลยีอวกาศและชีวภาพ มีราคาสูงขึ้น สินทรัพย์อื่นไม่ได้รับผลกระทบมากนัก',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 1, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 3, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: 11, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: 0, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/cLbp8fBf/31.png",
      sentiment: 1,
    },
    {
      text: 'การเลือกตั้งหรือการเปลี่ยนแปลงผู้นำในประเทศสำคัญ ทำให้เกิดความไม่แน่นอนทางการเมืองและเศรษฐกิจในช่วงสั้นๆ',
      results: {
        description: 'ความไม่แน่นอน สูง หุ้น, คริปโตเคอร์เรนซี, และที่ดิน มีราคาลดลง ร้านค้า มียอดขายตกต่ำทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 1, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: 1, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 1, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 1, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/c4JkMrHh/33.png",
      sentiment: -1,
    },
    {
      text: 'ภูเขาไฟขนาดใหญ่ปะทุขึ้น ส่งผลกระทบต่อสภาพอากาศโลก การเดินทางทางอากาศ และภาคการเกษตรในวงกว้าง ทำให้โลกมืดมิดชั่วคราว',
      results: {
        description: 'พืชผลทางการเกษตร ได้รับความเสียหายร้านวัตถุดิบ ขาดแคลน ที่ดิน เสียหายอย่างหนัก บริการส่งพัสดุ ติดขัด หุ้น มีราคาลดลงทองคำ มีราคาสูงขึ้น',
        effects: [
          { assetName: 'ทองคำ', changeLevel: 2, description: '' },
          { assetName: 'ที่ดิน', changeLevel: -4, description: '' },
          { assetName: 'คริปโต', changeLevel: -4, description: '' },
          { assetName: 'ร้านอาหาร', change: -4, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: -5, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: -4, description: '' },
          { assetName: 'stockA', change: -1, description: '' },
          { assetName: 'stockB', change: -1, description: '' },
          { assetName: 'stockC', change: -1, description: '' },
          { assetName: 'stockD', change: -1, description: '' },
          { assetName: 'stockE', change: -1, description: '' },
          { assetName: 'stockF', change: -1, description: '' },
          { assetName: 'stockG', change: 1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/dVbWY69N/34.png",
      sentiment: -1,
    },
    {
      text: 'ความก้าวหน้าครั้งสำคัญในการพัฒนาพลังงานฟิวชั่น ทำให้มีความหวังในการสร้างแหล่งพลังงานสะอาดไม่จำกัด',
      results: {
        description: 'แหล่งพลังงานสะอาด ต้นทุนลดลงอย่างมหาศาล ร้านค้าและธุรกิจมีต้นทุนถูกลง หุ้นที่เกี่ยวข้อง มีราคาสูงขึ้นที่ดินที่มีแหล่งพลังงานฟิวชั่นมีมูลค่าเพิ่มขึ้น ทองคำ มีราคาลดลง',
        effects: [
          { assetName: 'ทองคำ', changeLevel: -4, description: '' },
          { assetName: 'ที่ดิน', changeLevel: 2, description: '' },
          { assetName: 'คริปโต', changeLevel: 3, description: '' },
          { assetName: 'ร้านอาหาร', change: 2, description: '' },
          { assetName: 'ร้านวัตถุดิบ', change: 2, description: '' },
          { assetName: 'บริการส่งพัสดุ', change: 2, description: '' },
          { assetName: 'stockA', change: 1, description: '' },
          { assetName: 'stockB', change: 1, description: '' },
          { assetName: 'stockC', change: 1, description: '' },
          { assetName: 'stockD', change: 1, description: '' },
          { assetName: 'stockE', change: 1, description: '' },
          { assetName: 'stockF', change: 1, description: '' },
          { assetName: 'stockG', change: -1, description: '' },
        ]
      },
      qrCodeLink: "https://i.postimg.cc/bJ83GvWQ/35.png",
      sentiment: 1,
    },
  ];

  const handleNextAction = () => {
    if (stage === 'initial' || (stage === 'result' && year < 15)) {
      setIsLoading(true);
      
      setTimeout(() => {
        // กรองเหตุการณ์ที่ยังไม่เคยใช้
        let availableScenarios = allScenarios.filter((_, index) => !usedScenarioIndices.includes(index));
        
        // กรองเหตุการณ์ที่เป็นบวกและลบ
        const positiveScenarios = availableScenarios.filter(s => s.sentiment === 1);
        const negativeScenarios = availableScenarios.filter(s => s.sentiment === -1);
        
        let newScenario;
        let newScenarioIndex;

        // ถ้าจำนวนเหตุการณ์ลบถึง 6 แล้ว ให้สุ่มได้เฉพาะเหตุการณ์บวกเท่านั้น
        if (negativeScenarioCount >= 6) {
          const randomIndex = getRandomInt(0, positiveScenarios.length - 1);
          newScenario = positiveScenarios[randomIndex];
        } else {
          // ถ้ายังไม่ถึง 6 สามารถสุ่มได้ทั้งบวกและลบ
          const randomIndex = getRandomInt(0, availableScenarios.length - 1);
          newScenario = availableScenarios[randomIndex];
        }

        // ค้นหา index เดิมของ scenario ที่ถูกเลือก
        newScenarioIndex = allScenarios.indexOf(newScenario);

        // อัปเดต state
        setScenario(newScenario);
        setScenarioResult('');
        setStage('scenario');
        setYear(prevYear => prevYear + 1);
        
        // ถ้าเป็นเหตุการณ์ลบ ให้อัปเดตจำนวนเหตุการณ์ลบที่เกิดขึ้นแล้ว
        if (newScenario.sentiment === -1) {
            setNegativeScenarioCount(prevCount => prevCount + 1);
        }
        
        // เพิ่ม index ของเหตุการณ์ที่ใช้แล้วลงใน array
        setUsedScenarioIndices(prevIndices => [...prevIndices, newScenarioIndex]);

        setIsLoading(false);
      }, 1000);
    } else if (stage === 'scenario') {
      setScenarioResult(scenario.results.description);

      const newAssets = { ...assets };
      const newBusinesses = { ...businesses };
      const newStocks = { ...stocks };

      // Loop through all effects in the selected scenario
      scenario.results.effects.forEach(effect => {
        const { assetName, changeLevel, change, description } = effect;
        
        if (assetName === 'ทองคำ' || assetName === 'ที่ดิน' || assetName === 'คริปโต') {
          const calculatedChange = getAssetChangeByLevel(assetName, changeLevel);
          const potentialNewValue = newAssets[assetName].totalValue + calculatedChange;
          
          // **************************************************************
          // ** การตรวจสอบเพื่อให้มูลค่าสินทรัพย์ไม่ต่ำกว่า 1 **
          // **************************************************************
          if (potentialNewValue < 1) {
              // ถ้าค่าใหม่น้อยกว่า 1 ให้ตั้งค่าไว้ที่ 1 และคำนวณ change ใหม่
              const actualChange = 1 - newAssets[assetName].totalValue;
              newAssets[assetName].change = actualChange;
              newAssets[assetName].totalValue = 1;
          } else {
              // ถ้าค่าใหม่มากกว่าหรือเท่ากับ 1 ให้ใช้ค่าที่คำนวณได้ตามปกติ
              newAssets[assetName].change = calculatedChange;
              newAssets[assetName].totalValue = potentialNewValue;
          }
        } else if (assetName === 'ร้านอาหาร' || assetName === 'ร้านวัตถุดิบ' || assetName === 'บริการส่งพัสดุ') {
          newBusinesses[assetName].change = change;
          newBusinesses[assetName].value += change;
        } else { // Handle stocks
          newStocks[assetName].change = change;
          newStocks[assetName].value += change;
        }
      });

      setAssets(newAssets);
      setBusinesses(newBusinesses);
      setStocks(newStocks);
      setStage('result');
    } else if (stage === 'result' && year === 15) {
      setStage('end');
    }
  };

  const handleRestart = () => {
    setYear(0);
    setStage('initial');
    setLastScenarioIndex(null);
    setNegativeScenarioCount(0); // Reset negative scenario count
    setUsedScenarioIndices([]); // Reset used scenario indices
    setAssets({
      'ทองคำ': { value: 15, change: 0, totalValue: 15 },
      'ที่ดิน': { value: 15, change: 0, totalValue: 15 },
      'คริปโต': { value: 5, change: 0, totalValue: 5 },
    });
    setBusinesses({
      'ร้านอาหาร': { value: 3, change: 0 },
      'ร้านวัตถุดิบ': { value: 3, change: 0 },
      'บริการส่งพัสดุ': { value: 3, change: 0 },
    });
    setStocks({
      stockA: { value: 0, change: 0 },
      stockB: { value: 0, change: 0 },
      stockC: { value: 0, change: 0 },
      stockD: { value: 0, change: 0 },
      stockE: { value: 0, change: 0 },
      stockF: { value: 0, change: 0 },
      stockG: { value: 0, change: 0 },
    });
  };

  const getButtonText = () => {
    if (stage === 'initial') {
        return 'เริ่มเกม';
    } else if (isLoading) {
        return 'กำลังสุ่มเหตุการณ์';
    } else if (year === 15 && stage === 'result') {
        return 'จบเกม';
    } else if (stage === 'scenario') {
        return 'แสดงผลลัพธ์';
    } else if (stage === 'result') {
        return 'สุ่มสถานการณ์ใหม่';
    } else if (stage === 'end') {
        return 'เริ่มเกมใหม่';
    }
  };
  
  const getButtonColorClass = () => {
    if (year === 15 && stage === 'result') {
        return 'red-gradient';
    }
    if (stage === 'initial' || stage === 'result' || stage === 'end' || isLoading) {
        return 'yellow-gradient';
    }
    return 'orange-gradient';
  };

  const getChangeColorClass = (change) => {
    if (change > 0) return 'text-green';
    if (change < 0) return 'text-red';
    return 'text-yellow';
  };
  
  const getStockIcon = (value) => {
    if (value > 0) return '▲';
    if (value < 0) return '▼';
    return '-';
  };

  const renderFinalResult = () => {
    return (
      <div className="final-result-box full-width-panel">
        <h2 className="scenario-title">สรุปผลเกม</h2>
        <p className="final-summary-text bold-text">มูลค่าสินทรัพย์สุดท้าย:</p>
        <ul className="final-result-list">
          {Object.entries(assets).map(([key, item]) => {
            const assetChange = item.totalValue - 3;
            return (
              <li key={key}>
                <span className="capitalize">{key}:</span> {item.totalValue} (
                <span className={getChangeColorClass(assetChange)}>
                  {assetChange > 0 ? '+' : ''}{assetChange}
                </span>
                )
              </li>
            );
          })}
        </ul>
        <p className="final-summary-text bold-text">ผลรวมการเปลี่ยนแปลงธุรกิจ:</p>
        <ul className="final-result-list">
          {Object.entries(businesses).map(([key, business]) => {
            const businessChange = business.value - 3;
            return (
              <li key={key}>
                <span className="capitalize">{key}:</span> (
                <span className={getChangeColorClass(businessChange)}>
                  {businessChange > 0 ? '+' : ''}{businessChange}
                </span>
                )
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Function to get description for a specific asset/business/stock
  const getEffectDescription = (assetName) => {
      const effect = scenario?.results?.effects.find(e => e.assetName === assetName);
      return effect ? effect.description : '';
  };

  const WelcomePopup = ({ onClose }) => {
    const popupContent = [
      {
        title: 'ยินดีต้อนรับสู่เกม!',
        text: 'เกมนี้จำลองการลงทุนในโลกธุรกิจและการเงิน คุณจะได้เผชิญกับสถานการณ์ต่างๆ ในแต่ละปี และดูว่าการลงทุนของคุณจะเติบโตอย่างไร',
      },
      {
        title: '1. เข้าใจว่า "การลงทุนคืออะไร?"',
        text: 'ลองนึกภาพง่ายๆ ว่า การลงทุนคือการเอาเงินไปทำงานแทนเรา แทนที่จะเก็บเงินไว้เฉยๆ เราก็เอาเงินนั้นไปซื้อของบางอย่างที่คาดหวังว่าในอนาคตจะมีราคาแพงขึ้น หรือสามารถสร้างรายได้ให้เราได้ สาเหตุสำคัญที่ต้องลงทุนก็เพราะ "เงินเฟ้อ" ครับ เงินเฟ้อคือปรากฏการณ์ที่ข้าวของเครื่องใช้มีราคาแพงขึ้นเรื่อยๆ ลองนึกภาพว่าเมื่อ 10 ปีก่อน เงิน 100 บาทอาจจะซื้อของได้เต็มถุง แต่ตอนนี้เงิน 100 บาทอาจจะซื้อได้แค่ของไม่กี่อย่าง นั่นหมายความว่า มูลค่าของเงินลดลง การลงทุนจึงเป็นวิธีที่จะทำให้เงินของเรางอกเงยและเติบโตได้ทันกับเงินเฟ้อ หรือมากกว่าเงินเฟ้อ เพื่อรักษามูลค่าของเงินที่เราหามาได้ไม่ให้ลดลงไปตามกาลเวลา'
      },
      {
        title: '2. ตั้งเป้าหมาย: เราอยากได้อะไรจากการลงทุน?',
        text: 'ก่อนจะเริ่มลงทุน เราต้องตั้งเป้าหมายให้ชัดเจนก่อนว่าเราอยากได้อะไรจากเงินของเรา เหมือนเวลาจะเดินทาง เราก็ต้องรู้ว่าจะไปที่ไหน เพื่อจะได้เลือกยานพาหนะที่เหมาะสม เช่น การลงทุนเพื่อใช้ในวัยเกษียณ 👵👴 เป้าหมายนี้คือ การสร้างเงินก้อนใหญ่ไว้ใช้ในชีวิตบั้นปลาย โดยที่เราไม่ต้องทำงานอีกต่อไป การลงทุนแบบนี้ต้องใช้เวลานานมากๆ จึงเหมาะกับการลงทุนในสิ่งที่โตขึ้นเรื่อยๆ เช่น ที่ดิน หรือ ทองคำ ที่มีแนวโน้มราคาเพิ่มขึ้นในระยะยาว '
      },
      {
        title: '3. รู้จักสินทรัพย์แต่ละแบบ: ลงทุนในอะไรได้บ้าง?',
        text: 'การลงทุนก็เหมือนกับการเลือกเครื่องมือสำหรับทำงาน แต่ละชนิดก็มีจุดเด่นและจุดด้อยต่างกันไป ลองมาทำความรู้จักกับสินทรัพย์ต่างๆ ที่เราสามารถลงทุนได้: เงินฝาก: เหมือนกับการเก็บเงินไว้ในเซฟที่ปลอดภัยที่สุด เงินของเราจะอยู่นิ่งๆ และมีคนคอยดูแลให้ เราจะได้รับดอกเบี้ยเล็กน้อยเป็นผลตอบแทน มีความปลอดภัยสูงที่สุด แต่ผลตอบแทนน้อย และอาจจะสู้เงินเฟ้อได้ไม่เท่าไหร่ ทองคำ: เหมือนการเก็บอัญมณีล้ำค่าไว้ในมือ เป็นสินทรัพย์ที่ทั่วโลกให้การยอมรับ และมักจะมีราคาสูงขึ้นเมื่อเศรษฐกิจทั่วโลกมีความไม่แน่นอน ทำให้คนส่วนใหญ่หันมาซื้อทองคำเพื่อเก็บไว้ แต่ราคาทองคำก็มีความผันผวนได้เช่นกัน ที่ดิน: เหมือนการ เป็นเจ้าของพื้นที่ ที่เราสามารถเอาไปทำอะไรก็ได้ ไม่ว่าจะสร้างบ้าน ปลูกผัก หรือปล่อยเช่า ที่ดินมักจะมีราคาเพิ่มขึ้นในระยะยาว แต่ต้องใช้เงินลงทุนสูง และการขายก็อาจจะใช้เวลานาน',
      },
      {
        title: '4. วางแผนการลงทุน: เราจะเล่นเกมนี้ยังไง?',
        text: 'เมื่อรู้จักสินทรัพย์แล้ว ก็ต้องวางแผนให้ดีเหมือนการวางกลยุทธ์ก่อนเล่นเกม จะได้ไม่พลาด อย่าเอาเงินทั้งหมดไปลงทุนในสิ่งเดียว เพราะถ้าสิ่งนั้นราคาตก เราจะขาดทุนเยอะมาก ลองแบ่งเงินไปลงทุนในหลายๆ อย่าง เช่น เงินฝาก: ปลอดภัยที่สุด เอาไว้ใช้ยามฉุกเฉิน ทองคำ: เก็บไว้เป็นของมีค่า ราคามักจะขึ้นเวลาเศรษฐกิจไม่ดี ที่ดิน: ซื้อไว้เพื่อหวังว่าราคาจะเพิ่มในอนาคต'
      }
    ];
    // END: จุดที่สามารถแก้ไขข้อความในป๊อปอัพได้

    const currentPageContent = popupContent[welcomePage - 1];

    return (
        <div className="welcome-popup-overlay">
            <div className="welcome-popup-card">
                <h2 className="popup-title">{currentPageContent.title}</h2>
                <p className="popup-text">{currentPageContent.text}</p>
                {welcomePage < popupContent.length ? (
                    <button
                        onClick={() => setWelcomePage(prevPage => prevPage + 1)}
                        className="action-button yellow-gradient popup-button"
                    >
                        ต่อไป
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className="action-button yellow-gradient popup-button"
                    >
                        เริ่มเกม
                    </button>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="board-game-container">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&display=swap');

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .blinking {
            animation: blink 1s infinite ease-in-out;
        }
        
        .welcome-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100;
        }

        .welcome-popup-card {
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            padding: 2.5rem;
            border-radius: 1.5rem;
            text-align: center;
            color: white;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            max-width: 56rem;
            width: 100%;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .popup-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #fde047;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .popup-text {
            font-size: 1.5rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            max-width: 800px;
        }

        .popup-button {
            width: auto;
            min-width: 200px;
            padding: 0.75rem 2rem;
        }

        .board-game-container {
          min-height: 100vh;
          padding: 1rem;
          font-family: 'Prompt', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;

          background-image: url('https://i.postimg.cc/MKqWwfqq/Middleground-4x.png'), url('https://i.postimg.cc/52tbYcXr/Background-4x.png');
          background-position: left bottom, center center;
          background-size: 100% auto, cover;
          background-repeat: no-repeat;
        }

        .foreground-layer {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: auto;
          z-index: 10;
        }

        .main-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 56rem;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          padding: 2rem;
          border-radius: 1.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          z-index: 20;
          box-sizing: border-box;
        }

        .main-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: #fde047;
          margin-bottom: 1.5rem;
          text-align: center;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .scenario-box {
          background-color: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          color: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1-px rgba(0, 0, 0, 0.06);
          width: 100%;
          box-sizing: border-box;
        }
        
        .final-result-box {
          background-color: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(4px);
          color: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          width: 100%;
          text-align: center;
          box-sizing: border-box;
        }

        .final-result-list {
            list-style: none;
            padding: 0;
            margin: 1rem 0;
            text-align: left;
            display: inline-block;
        }

        .final-summary-text {
            font-size: 1.125rem;
            margin-bottom: 0.5rem;
        }

        .scenario-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #fde047;
          margin-bottom: 1rem;
          text-align: center;
        }

        .scenario-text {
          font-size: 1.5rem;
          line-height: 1.625;
          text-align: center;
          min-height: 2.5rem;
        }
        
        .asset-description {
            font-size: 0.875rem;
            color: #d1d5db;
            margin-top: 0.5rem;
            border-left: 2px solid #fde047;
            padding-left: 0.5rem;
            line-height: 1.5;
        }

        .bold-text {
          font-weight: 700;
        }

        .panels-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          width: 100%;
          margin-bottom: 2rem;
        }
        
        .full-width-panel {
            grid-column: 1 / -1;
        }

        @media (min-width: 768px) {
          .panels-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        .panel {
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          color: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          box-sizing: border-box;
        }

        .panel-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fde047;
          margin-bottom: 1rem;
          text-align: center;
        }

        .panel-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .panel-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.125rem;
        }

        .asset-item-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        .asset-main-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }

        .qr-code-container {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }

        .qr-code {
            width: 100%;
            height: auto;
            border-radius: 0.5rem;
        }

        .panel-item-change {
          margin-left: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .text-green {
          color: #57ff8a;
        }

        .text-red {
          color: #ff4b4b;
        }

        .text-yellow {
            color: #fde047;
        }

        .text-gray {
          color: #9ca3af;
        }
        
        .action-button {
          padding: 1rem;
          width: 100%;
          margin-top: 2rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          border-radius: 9999px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .action-button.yellow-gradient {
            background: linear-gradient(to right, #fde047, #facc15);
            color: black;
        }
        
        .action-button.yellow-gradient:hover {
            background: linear-gradient(to right, #facc15, #eab308);
            transform: scale(1.02);
        }

        .action-button.orange-gradient {
            background: linear-gradient(to right, #ffa526, #ff7143);
            color: white;
        }
        
        .action-button.orange-gradient:hover {
            background: linear-gradient(to right, #e89522, #e3653d);
            transform: scale(1.02);
        }

        .action-button.red-gradient {
            background: linear-gradient(to right, #ef4444, #b91c1c);
            color: white;
        }

        .action-button.red-gradient:hover {
            background: linear-gradient(to right, #b91c1b, #991b1b);
            transform: scale(1.02);
        }

        .panel.assets-panel {
            min-height: 350px;
        }
        `}
      </style>
      <img src="https://i.postimg.cc/RFrD5Y2h/Artboard-2.png" alt="Foreground" className="foreground-layer" />
      
      {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      
      <div className="main-card">
        <h1 className="main-title">ปีการลงทุนที่: {year}</h1>
        <div className="panels-grid">
            {stage !== 'end' ? (
                <>
                <div className="scenario-box full-width-panel">
                    <h2 className="scenario-title">สถานการณ์:</h2>
                    <div className={`scenario-text ${isLoading ? 'blinking' : ''}`}>
                        {isLoading
                            ? 'กำลังสุ่มเหตุการณ์'
                            : (stage === 'initial' ? 'กดปุ่มเพื่อเริ่มเกมและสุ่มสถานการณ์แรก' : (
                                  <>
                                  <span>{scenario.text}</span>
                                  {stage === 'result' && (
                                      <span className="text-yellow"> {scenario.results.description}</span>
                                  )}
                                  </>
                              )
                            )
                        }
                    </div>
                </div>
                <div className="panel assets-panel">
                    <h3 className="panel-title">สินทรัพย์</h3>
                    <ul className="panel-list">
                    {Object.entries(assets).map(([key, item]) => (
                        <li key={key} className="panel-list-item">
                        <div className="asset-item-container">
                            <div className="asset-main-info">
                                <span className="capitalize">{key}:</span>
                                <div className="flex-items-center">
                                    <span>{item.totalValue}</span>
                                    {stage === 'result' && (
                                    <span className={`panel-item-change ${getChangeColorClass(item.change)}`}>
                                        ({item.change > 0 ? '+' : ''}{item.change})
                                    </span>
                                    )}
                                </div>
                            </div>
                            {stage === 'result' && (
                            <p className="asset-description">{getEffectDescription(key)}</p>
                            )}
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                <div className="panel">
                    <h3 className="panel-title">ธุรกิจ</h3>
                    <ul className="panel-list">
                    {Object.entries(businesses).map(([key, item]) => (
                        <li key={key} className="panel-list-item">
                        <div className="asset-item-container">
                            <div className="asset-main-info">
                                <span className="capitalize">{key}:</span>
                                <div className="flex-items-center">
                                    {stage === 'result' && (
                                    <span className={`panel-item-change ${getChangeColorClass(item.change)}`}>
                                        ({item.change > 0 ? '+' : ''}{item.change})
                                    </span>
                                    )}
                                </div>
                            </div>
                            {stage === 'result' && (
                            <p className="asset-description">{getEffectDescription(key)}</p>
                            )}
                        </div>
                        </li>
                    ))}
                    </ul>
                    {stage === 'result' && (
                        <div className="qr-code-container">
                            <img src={scenario.qrCodeLink} alt="QR Code" className="qr-code" />
                        </div>
                    )}
                </div>
                <div className="panel">
                    <h3 className="panel-title">หุ้น</h3>
                    <ul className="panel-list">
                    {Object.entries(stocks).map(([key, item]) => (
                        <li key={key} className="panel-list-item">
                        <div className="asset-item-container">
                            <div className="asset-main-info">
                                <span className="capitalize">{key}:</span>
                                <div className="flex-items-center">
                                    {stage === 'result' && (
                                        <span className={`panel-item-change ${getChangeColorClass(item.change)}`}>
                                            ({getStockIcon(item.change)})
                                        </span>
                                    )}
                                </div>
                            </div>
                            {stage === 'result' && (
                                <p className="asset-description">{getEffectDescription(key)}</p>
                            )}
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                </>
            ) : (
                renderFinalResult()
            )}
        </div>
        <button
          onClick={stage === 'end' ? handleRestart : handleNextAction}
          className={`action-button ${getButtonColorClass()} ${isLoading ? 'blinking' : ''}`}
          disabled={isLoading}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default App;

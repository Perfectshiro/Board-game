import React, { useState, useEffect } from 'react';

// Main App Component
const App = () => {
    // State to keep track of the last outcome's sentiment for conditional logic
    // This sentiment influences the next roll's event and numbers.
    // 0 for neutral, 1 for positive, -1 for negative
    const [lastOutcome, setLastOutcome] = useState(0); 
    
    // State for displaying the event result
    const [eventResult, setEventResult] = useState('กดปุ่มเพื่อสุ่มเหตุการณ์!');
    
    // State to control the visibility of the "change" numbers (e.g., (+5))
    const [areChangeNumbersRevealed, setAreChangeNumbersRevealed] = useState(false);

    // State to manage the phase of the main button
    // 'initial_roll': Initial state or ready to roll a new event
    // 'reveal_numbers': Event rolled, numbers are calculated but hidden, button can reveal them
    const [buttonPhase, setButtonPhase] = useState('initial_roll'); 
    
    // Define categories and their items for UI display and data mapping
    const assetItems = ["ทองคำ", "ที่ดิน", "คริปโต"];
    const businessItems = ["ร้านอาหาร", "ร้านธัญพืช", "บริการส่งพัสดุ"];
    const stockItems = ["Stock A", "Stock B", "Stock C", "Stock D", "Stock E"];
    // Combined list of all items for easier iteration
    const allItems = [...assetItems, ...businessItems, ...stockItems];

    // State to hold all generated numbers and cumulative totals for each item
    // For assets/stocks: { displayedTotal: number, calculatedChange: number, nextTotal: number }
    // For businesses: { calculatedChange: number }
    const [itemData, setItemData] = useState({});

    // Define 50 possible events and their specific impacts extracted from the PDF
    // Sentiment for the overall event is still used for biasing the *next event selection*
    const events = [
        {
            text: 'วิกฤตเศรษฐกิจโลก: ตลาดหุ้นตกต่ำ นักลงทุนหนีไปหาสินทรัพย์ที่ปลอดภัย', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'เทคโนโลยี AI เข้ามาพลิกโฉม: AI เพิ่มประสิทธิภาพการผลิตในอุตสาหกรรม', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ภัยธรรมชาติและภาวะแห้งแล้ง: ส่งผลกระทบต่อผลผลิตทางการเกษตรและห่วงโซ่อุปทาน', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'อัตราดอกเบี้ยลดลง: การกู้ยืมถูกลง กระตุ้นการลงทุนในอสังหาฯ และตลาดหุ้น', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ผู้บริโภคหันมาใส่ใจสุขภาพ: ความต้องการอาหารเพื่อสุขภาพและออร์แกนิกเพิ่มขึ้น', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดอสังหาฯ บูม: ราคาที่ดินและสิ่งปลูกสร้างเพิ่มสูงขึ้นอย่างรวดเร็ว', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ภาวะเงินเฟ้อสูง: เงินสดด้อยค่า ผู้คนมองหาสินทรัพย์ป้องกันความเสี่ยง', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": -1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การท่องเที่ยวฟื้นตัว: ธุรกิจบริการเติบโต', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดคริปโตผันผวนรุนแรง: การเก็งกำไรทำให้มูลค่าขึ้นลงอย่างมาก', sentiment: 0,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'รัฐบาลลงทุนโครงสร้างพื้นฐาน: ส่งผลดีต่ออุตสาหกรรมการก่อสร้างและอุตสาหกรรมที่เกี่ยวข้อง', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การควบคุมกฎหมายการเงินที่เข้มงวด: ส่งผลกระทบต่อธุรกิจการเงินและคริปโต', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การเติบโตของการสั่งอาหารออนไลน์: ร้านอาหารที่ปรับตัวได้และบริการส่งพัสดุเติบโต', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดหุ้นตกหนัก: เกิดความตื่นตระหนกในตลาดหุ้น', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'โรคระบาดใหม่: ส่งผลกระทบต่อการเดินทาง ธุรกิจบริการ และการผลิต', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'น้ำมันราคาพุ่ง: ส่งผลกระทบต่อต้นทุนการผลิตและอุตสาหกรรม', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'ภาวะเศรษฐกิจซบเซา: ผู้คนใช้จ่ายลดลง เน้นสินค้าจำเป็น', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'ความนิยมในอาหารแปรรูป: ผู้บริโภคหันมาซื้อสินค้าอุปโภคบริโภคที่ทำจากธัญพืชและเกษตรแปรรูป', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดที่อยู่อาศัยเติบโต: ราคาอสังหาฯ เพิ่มขึ้น ผู้คนมีความมั่นใจในการซื้อบ้าน', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นวัตกรรมหุ่นยนต์ในอุตสาหกรรม: หุ่นยนต์เข้ามาแทนที่แรงงาน ส่งผลต่ออุตสาหกรรม', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ความกังวลเรื่องสิ่งแวดล้อม: ภาคอุตสาหกรรม (Stock E) ถูกกดดันให้ปรับตัว', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": -1 }
        },
        {
            text: 'การแข่งขันในธุรกิจร้านอาหารสูง: มีร้านใหม่เปิดจำนวนมาก', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นักลงทุนแห่ซื้อทอง: เกิดความไม่แน่นอนทางการเมือง ส่งผลให้ราคาทองคำสูงขึ้น', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 0, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'นโยบายการเงินผ่อนคลาย: รัฐบาลกระตุ้นการใช้จ่าย', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การค้าออนไลน์เติบโต: ส่งผลดีต่อร้านค้าปลีกและบริการส่งพัสดุ', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ราคาวัตถุดิบทางการเกษตรสูงขึ้น: ส่งผลกระทบต่อต้นทุนการผลิตอาหาร', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": -1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'กฎหมายสนับสนุนการพัฒนาอสังหาฯ: ส่งผลดีต่อการก่อสร้างและราคาที่ดิน', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'กระแสการบริโภคอาหารสำเร็จรูป: ร้านอาหารทั่วไปได้รับผลกระทบ', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นโยบายพลังงานสะอาด: อุตสาหกรรมแบบดั้งเดิมได้รับผลกระทบ', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": -1 }
        },
        {
            text: 'ค่าเงินบาทอ่อนค่า: ส่งผลให้ราคาสินค้านำเข้าแพงขึ้น', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": -1, "Stock C": 1, "Stock D": -1, "Stock E": 1 }
        },
        {
            text: 'ตลาดหุ้นต่างประเทศเติบโต: ดึงเงินลงทุนออกไปจากตลาดในประเทศ', sentiment: -1,
            impacts: { "ทองคำ": -1, "ที่ดิน": -1, "คริปโต": 1, "ร้านอาหาร": -1, "ร้านธัญพืช": -1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'อุตสาหกรรมยานยนต์ไฟฟ้าบูม: อุตสาหกรรม (Stock E) ปรับตัวเพื่อผลิตรถยนต์ไฟฟ้า', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การบริโภคสินค้าอุปโภคบริโภคเพิ่มขึ้น: ผู้คนมีกำลังซื้อสูงขึ้น', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดคริปโตได้รับความเชื่อถือมากขึ้น: ธนาคารใหญ่เริ่มยอมรับ', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นโยบายจำกัดการปล่อยมลพิษ: ส่งผลกระทบต่ออุตสาหกรรมบางประเภท', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": -1 }
        },
        {
            text: 'การลงทุนในโครงสร้างพื้นฐานด้านการขนส่ง: ส่งผลดีต่อบริการส่งพัสดุ', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ความต้องการที่พักอาศัยลดลง: ภาคอสังหาฯ ชะลอตัว', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'นโยบายภาษีใหม่: ส่งผลกระทบต่อภาคการเงินและอสังหาฯ', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'เกษตรกรรมสมัยใหม่: การใช้เทคโนโลยีช่วยเพิ่มผลผลิต (Stock A)', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การแข่งขันสูงในธุรกิจจัดส่ง: ส่งผลกระทบต่อกำไรของบริษัท', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ภาวะเศรษฐกิจโลกถดถอย: ตลาดส่วนใหญ่ซบเซา', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": -1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": -1, "Stock A": -1, "Stock B": -1, "Stock C": -1, "Stock D": -1, "Stock E": -1 }
        },
        {
            text: 'ตลาดคริปโตล่มสลาย: นักลงทุนสูญเสียความเชื่อมั่น', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": -1, "ร้านอาหาร": -1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การท่องเที่ยวเชิงสุขภาพเติบโต: ร้านอาหารเพื่อสุขภาพได้รับความนิยม', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นวัตกรรมการก่อสร้าง: ช่วยลดต้นทุนในการก่อสร้าง (Stock D)', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'การปรับตัวของร้านธัญพืช: เพิ่มช่องทางการขายออนไลน์', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'นโยบายการค้าต่างประเทศ: ส่งผลดีต่อการส่งออกสินค้าอุปโภคบริโภค (Stock B)', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ตลาดแรงงานขาดแคลน: ส่งผลกระทบต่อการผลิตในภาคอุตสาหกรรม', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": -1 }
        },
        {
            text: 'การพัฒนาเมืองใหม่: ส่งผลดีต่อราคาที่ดินและการก่อสร้าง', sentiment: 1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ธุรกิจการเงินถูกกำกับดูแลเข้มงวด: ส่งผลกระทบต่อธนาคารและสถาบันการเงิน', sentiment: -1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": -1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'ความผันผวนของราคาทอง: นักลงทุนไม่มั่นใจในเสถียรภาพ', sentiment: -1,
            impacts: { "ทองคำ": -1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        },
        {
            text: 'เศรษฐกิจมีเสถียรภาพ: ตลาดกลับมาเติบโตอย่างช้าๆ และมั่นคง', sentiment: 1,
            impacts: { "ทองคำ": 1, "ที่ดิน": 1, "คริปโต": 1, "ร้านอาหาร": 1, "ร้านธัญพืช": 1, "บริการส่งพัสดุ": 1, "Stock A": 1, "Stock B": 1, "Stock C": 1, "Stock D": 1, "Stock E": 1 }
        }
    ];

    // Initial values for assets and stocks (can be any value)
    const initialItemValues = {
        "ทองคำ": 15000,
        "ที่ดิน": 15000,
        "คริปโต": 5000,
        "ร้านธัญพืช": 0, 
        "ร้านอาหาร": 0,
        "บริการส่งพัสดุ": 0,
        "Stock A": 1000,
        "Stock B": 1200,
        "Stock C": 800,
        "Stock D": 1500,
        "Stock E": 900
    };

    // Initialize itemData state when the component mounts
    useEffect(() => {
        const initialData = {};
        // Combine all item lists and set their initial numbers
        allItems.forEach(item => { // Use allItems for initialization
            if (assetItems.includes(item) || stockItems.includes(item)) {
                // For assets and stocks, initialize with displayedTotal, calculatedChange, and nextTotal
                const initialVal = initialItemValues[item] || 0;
                initialData[item] = { 
                    displayedTotal: initialVal, 
                    calculatedChange: 0, 
                    nextTotal: initialVal 
                };
            } else {
                // For business items, initialize with only calculatedChange
                initialData[item] = { calculatedChange: 0 };
            }
        });
        setItemData(initialData);
    }, []); // Empty dependency array means this effect runs only once after the initial render

    // Helper function to generate a change value based on the impact type (+, -, 0)
    // The change will be a multiple of 100, between -500 and 500.
    const generateChangeValue = (impactType) => { 
        if (impactType === 1) { // '+' in PDF: generate a positive change (100 to 500)
            const possiblePositiveChanges = [100, 200, 300, 400, 500];
            return possiblePositiveChanges[Math.floor(Math.random() * possiblePositiveChanges.length)];
        } else if (impactType === -1) { // '-' in PDF: generate a negative change (-100 to -500)
            const possibleNegativeChanges = [-100, -200, -300, -400, -500];
            return possibleNegativeChanges[Math.floor(Math.random() * possibleNegativeChanges.length)];
        } else { // ' ' (blank) or '0' in PDF: no change
            return 0;
        }
    };

    // Function to handle the main button click logic
    const handleMainButtonClick = () => {
        if (buttonPhase === 'initial_roll') {
            // Logic for "สุ่มเหตุการณ์!"
            let selectedEvent;
            let possibleEvents = [];

            // If no events are defined, set a default message and do not proceed with impact calculation
            if (events.length === 0) {
                setEventResult('ไม่มีเหตุการณ์ให้สุ่ม! โปรดเพิ่มเหตุการณ์ในโค้ด.');
                // Reset button phase to initial_roll so user can try again if events are added
                setButtonPhase('initial_roll');
                return; // Exit the function early
            }

            // Bias event selection based on lastOutcome (overall sentiment of previous event)
            if (lastOutcome < 0) {
                possibleEvents = events.filter(e => e.sentiment >= 0);
                if (possibleEvents.length === 0) possibleEvents = events;
            } else if (lastOutcome > 0) {
                possibleEvents = events.filter(e => e.sentiment <= 0);
                if (possibleEvents.length === 0) possibleEvents = events;
            } else {
                possibleEvents = events;
            }
            selectedEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            setEventResult(selectedEvent.text);

            // Update lastOutcome for the *next* roll based on the current event's overall sentiment
            setLastOutcome(selectedEvent.sentiment); 

            const newItemData = { ...itemData }; // Create a mutable copy of the current state
            
            // Calculate changes and next totals for ALL items based on the selected event's specific impacts
            allItems.forEach(item => { 
                const impactType = selectedEvent.impacts[item] || 0; // Get specific impact for this item, default to 0
                const currentChange = generateChangeValue(impactType); // Use the new function to get change based on impact

                if (assetItems.includes(item) || stockItems.includes(item)) {
                    const previousDisplayedTotal = newItemData[item]?.displayedTotal || 0;
                    const newNextTotal = previousDisplayedTotal + currentChange;
                    
                    newItemData[item] = { 
                        displayedTotal: previousDisplayedTotal, // Keep previous displayed total for now
                        calculatedChange: currentChange, 
                        nextTotal: newNextTotal 
                    };
                } else { // Business items
                    newItemData[item] = { calculatedChange: currentChange };
                }
            });
            setItemData(newItemData); // Update the state with the new calculated data

            setAreChangeNumbersRevealed(false); // Hide change numbers initially
            setButtonPhase('reveal_numbers'); // Change button to "แสดงตัวเลข"

        } else if (buttonPhase === 'reveal_numbers') {
            // Logic for "แสดงตัวเลข"
            const updatedItemData = { ...itemData }; // Create a mutable copy
            // Update displayedTotal for assets/stocks to their nextTotal
            [...assetItems, ...stockItems].forEach(item => {
                if (updatedItemData[item]) {
                    updatedItemData[item].displayedTotal = updatedItemData[item].nextTotal;
                }
            });
            setItemData(updatedItemData); // Update the state with new displayed totals

            setAreChangeNumbersRevealed(true); // Show change numbers
            setEventResult('กดปุ่มเพื่อสุ่มเหตุการณ์!'); // Reset event text for the next roll
            setButtonPhase('initial_roll'); // Change button back to "สุ่มเหตุการณ์!"
        }
    };

    // Determine button text based on current phase
    const getButtonText = () => {
        if (buttonPhase === 'initial_roll') {
            return 'สุ่มเหตุการณ์!';
        } else { // buttonPhase === 'reveal_numbers'
            return 'แสดงตัวเลข';
        }
    };

    // Determine button color based on current phase
    const getButtonColor = () => {
        if (buttonPhase === 'initial_roll') {
            return 'linear-gradient(to right, #4CAF50, #2196F3)'; // Green to Blue
        } else {
            return 'linear-gradient(to right, #FFA726, #FF7043)'; // Orange to Red
        }
    };

    // --- Inline CSS styles for the components ---
    const appStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #8B5CF6, #3B82F6)', // Purple to Blue gradient
        padding: '1rem',
        fontFamily: 'Inter, sans-serif', // Using Inter font
        color: 'white',
        boxSizing: 'border-sizing', // Ensure padding doesn't increase total width/height
    };

    const cardStyles = {
        background: 'rgba(255, 255, 255, 0.2)', // White with 20% opacity
        backdropFilter: 'blur(10px)', // Blur effect
        padding: '2rem',
        borderRadius: '1rem', // Rounded corners
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', // Shadow
        maxWidth: '900px', // Increased max-width to accommodate three columns
        width: '100%',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.3)', // Border with opacity
        boxSizing: 'border-box',
    };

    const titleStyles = {
        fontSize: '2.25rem', // text-4xl equivalent
        fontWeight: '800', // font-extrabold equivalent
        marginBottom: '1.5rem', // mb-6 equivalent
        color: 'white',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)', // drop-shadow-lg equivalent
    };

    const subtitleStyles = {
        display: 'block',
        fontSize: '1.5rem', // text-2xl equivalent
        marginBottom: '0.25rem', // mb-1 equivalent
    };

    const sectionStyles = {
        marginBottom: '2rem', // mb-8 equivalent
        padding: '1rem', // p-4 equivalent
        background: 'rgba(255, 255, 255, 0.1)', // White with 10% opacity
        borderRadius: '0.75rem', // rounded-xl equivalent
        border: '1px solid rgba(255, 255, 255, 0.2)', // Border with opacity
    };

    const eventResultStyles = {
        fontSize: '1.875rem', // text-3xl equivalent
        fontWeight: 'bold',
        color: '#FDE047', // text-yellow-200 equivalent
        marginBottom: '1rem',
    };

    const buttonBaseStyles = { // Base styles for the button
        width: '100%',
        padding: '1rem 1.5rem',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderRadius: '9999px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        outline: 'none',
        marginTop: '0rem', // No margin top by default
    };

    // Hover and Active styles for button (applied via JS for inline styles)
    const buttonHoverStyles = {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)',
    };

    const buttonActiveStyles = {
        transform: 'scale(0.95)',
    };

    const outcomeTextStyles = {
        fontSize: '1.5rem', // text-2xl equivalent
        fontWeight: 'bold',
    };

    // Styles for the three-column layout
    const columnContainerStyles = {
        display: 'flex',
        flexDirection: 'row', // Default to row for desktop
        justifyContent: 'space-around',
        gap: '1rem', // Space between columns
        marginBottom: '2rem',
        flexWrap: 'wrap', // Allow columns to wrap on smaller screens
    };

    const columnStyles = {
        flex: '1', // Allow columns to grow and shrink
        minWidth: '250px', // Minimum width for each column before wrapping
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '0.75rem',
        padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxSizing: 'border-box',
    };

    const columnTitleStyles = {
        fontSize: '1.25rem', // text-xl equivalent
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#FDE047', // Yellow color for titles
    };

    const itemRowStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
        padding: '0.25rem 0',
    };

    const itemNameStyles = {
        fontWeight: 'normal',
        marginRight: '0.5rem',
    };

    const itemValueContainerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem', // Space between total and change
    };

    const itemTotalStyles = {
        fontWeight: 'bold',
        textAlign: 'right',
        color: 'white', // Base color for total
    };

    const itemChangeStyles = (change, isVisible) => ({
        fontWeight: 'bold',
        minWidth: '55px', // Fixed width for the change number to prevent shifting
        textAlign: 'right',
        color: change > 0 ? '#A7F3D0' : (change < 0 ? '#FCA5A5' : '#FDE047'), // Green, Red, Yellow
        fontSize: '0.9em', // Slightly smaller for the change
        visibility: isVisible ? 'visible' : 'hidden', // Control visibility
        transition: 'visibility 0s, opacity 0.3s ease', // Smooth transition for opacity
        opacity: isVisible ? 1 : 0,
    });

    return (
        <div style={appStyles}>
            <div style={cardStyles}>
                <h1 style={titleStyles}>
                    <span style={subtitleStyles}>แอปสุ่มเหตุการณ์</span>
                    บอร์ดเกม
                </h1>

                {/* Combined Event and Last Outcome Display */}
                <div style={sectionStyles}>
                    <p style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>สถานการณ์:</p>
                    <p style={eventResultStyles}>{eventResult}</p>
                    {/* Removed the last outcome sentiment display as per user's previous request */}
                </div>

                {/* Three-column layout for Assets, Businesses, Stocks */}
                <div style={columnContainerStyles}>
                    {/* Assets Column */}
                    <div style={columnStyles}>
                        <h3 style={columnTitleStyles}>สินทรัพย์</h3>
                        {assetItems.map(item => (
                            <p key={item} style={itemRowStyles}>
                                <span style={itemNameStyles}>{item}:</span>
                                <span style={itemValueContainerStyles}>
                                    {/* Displayed total always visible */}
                                    <span style={itemTotalStyles}>{itemData[item]?.displayedTotal || 0}</span>
                                    {/* Change number always rendered, but visibility controlled */}
                                    <span style={itemChangeStyles(itemData[item]?.calculatedChange || 0, areChangeNumbersRevealed)}>
                                        ({(itemData[item]?.calculatedChange || 0) > 0 ? '+' : ''}{(itemData[item]?.calculatedChange || 0)})
                                    </span>
                                </span>
                            </p>
                        ))}
                    </div>

                    {/* Businesses Column */}
                    <div style={columnStyles}>
                        <h3 style={columnTitleStyles}>ธุรกิจ</h3>
                        {businessItems.map(item => (
                            <p key={item} style={itemRowStyles}>
                                <span style={itemNameStyles}>{item}:</span>
                                {/* Change number always rendered, but visibility controlled */}
                                <span style={itemChangeStyles(itemData[item]?.calculatedChange || 0, areChangeNumbersRevealed)}>
                                    {(itemData[item]?.calculatedChange || 0) > 0 ? '+' : ''}{(itemData[item]?.calculatedChange || 0)}
                                </span>
                            </p>
                        ))}
                    </div>

                    {/* Stocks Column */}
                    <div style={columnStyles}>
                        <h3 style={columnTitleStyles}>หุ้น</h3>
                        {stockItems.map(item => (
                            <p key={item} style={itemRowStyles}>
                                <span style={itemNameStyles}>{item}:</span>
                                <span style={itemValueContainerStyles}>
                                    {/* Displayed total always visible */}
                                    <span style={itemTotalStyles}>{itemData[item]?.displayedTotal || 0}</span>
                                    {/* Change number always rendered, but visibility controlled */}
                                    <span style={itemChangeStyles(itemData[item]?.calculatedChange || 0, areChangeNumbersRevealed)}>
                                        ({(itemData[item]?.calculatedChange || 0) > 0 ? '+' : ''}{(itemData[item]?.calculatedChange || 0)})
                                    </span>
                                </span>
                            </p>
                        ))}
                    </div>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={handleMainButtonClick}
                    style={{ ...buttonBaseStyles, background: getButtonColor() }}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...buttonBaseStyles, background: getButtonColor() }, buttonHoverStyles)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, { ...buttonBaseStyles, background: getButtonColor() })}
                    onMouseDown={(e) => Object.assign(e.currentTarget.style, { ...buttonBaseStyles, background: getButtonColor() }, buttonActiveStyles)}
                    onMouseUp={(e) => Object.assign(e.currentTarget.style, { ...buttonBaseStyles, background: getButtonColor() })}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export default App;

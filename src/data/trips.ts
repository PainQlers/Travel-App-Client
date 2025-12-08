export interface Trip {
  id: string;
  title: string;
  province: string;
  description: string;
  tags: string[];
  photos: string[];
  mapEmbedUrl: string;
  authorId: string;
  ownerEmail: string;
}

export const mockTrips: Trip[] = [
  {
    id: "koh-chang",
    title: "คู่มือเที่ยวเกาะช้าง กิน เที่ยว พักที่ไหนดี?",
    province: "ตราด",
    description:
      "เกาะช้างถือเป็นสวรรค์ที่รวมทั้งธรรมชาติสมบูรณ์และความสะดวกสบายของที่พักแนวบูทีคเอาไว้ด้วยกัน จุดเด่นของทริปนี้คือการพาลุยทั้งน้ำตกคลองพลู เดินป่าชมวิวช้างเผือก และแวะค้างคืนในพูลวิลล่าที่ซ่อนตัวอยู่ริมภูเขา ก่อนจบทริปด้วยอาหารทะเลสด ๆ ที่หมู่บ้านประมงบางเบ้า",
    tags: ["เกาะ", "ทะเล", "ธรรมชาติ"],
    photos: [
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?auto=format&fit=crop&w=800&q=80",
    ],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.4588924556838!2d102.30415827634952!3d12.029540487773071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3107e2f9c89d33d3%3A0x5e26b2dfca1f99dd!2sKo%20Chang!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth",
    authorId: "system",
    ownerEmail: "content@travelbuddy.com",
  },
  {
    id: "bts-green",
    title: "ลัดเลาะ 10 ที่เที่ยวชิด BTS สายสีเขียว",
    province: "กรุงเทพมหานคร",
    description:
      "รวบรวมพิกัดที่เที่ยวและคาเฟ่สุดละมุนตลอดแนว BTS สายสีเขียว ตั้งแต่หมอชิตถึงเคหะ บันทึกเวลาการเดินทาง และรุ่นรถไฟที่เหมาะกับการพกจักรยานพับได้ไปด้วย ใครอยากเดินชิลต้องไม่พลาดแกลเลอรีลับตรงสยามซอย 2 และคาเฟ่โทนสีขาวแสนสบาย",
    tags: ["คาเฟ่", "จุดถ่ายรูป", "เที่ยวใกล้กรุง"],
    photos: [
      "https://images.unsplash.com/photo-1475778057357-d35f37fa89ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1437419764061-2473afe69fc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1469740756762-5b231d9aa696?auto=format&fit=crop&w=800&q=80",
    ],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.706089196556!2d100.5259192757327!3d13.736717199201732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ec253d826c5%3A0x6b92da52d5cc64ce!2z4Lir4Liy4LiZ4Li14LiZ4Li14LmA4Lij4Liw4LiZ4LmA4LiI4LiB4Lix4Lii4Li04LiH4LiZ4LiE4LmM!5e0!3m2!1sth!2sth!4v1700000000001!5m2!1sth!2sth",
    authorId: "system",
    ownerEmail: "content@travelbuddy.com",
  },
  {
    id: "sunflower-field",
    title: "เที่ยวทุ่งทานตะวันชลบุรี ได้รูปสวยไม่ต้องไปไกล",
    province: "ชลบุรี",
    description:
      "เปิดแมปไร่ทานตะวันไม่ไกลจากกรุงเทพฯ ขับรถแค่ชั่วโมงกว่า ๆ ก็ถึง สถานที่จัดโซนถ่ายรูปไว้อย่างดี มีพร็อพและพรหมปิกนิกให้ยืมฟรี พร้อมไกด์ไลน์โพสท่าจากอินฟลูฯ ท้องถิ่น ใครที่อยากถ่ายพรีเวดดิ้งก็สามารถจองเวลาพิเศษได้",
    tags: ["ธรรมชาติ", "ครอบครัว", "ชลบุรี"],
    photos: [
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1469478714995-403cf1786392?auto=format&fit=crop&w=800&q=80",
    ],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3883.596413947493!2d100.98474057572417!3d13.257836308116682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102b6e78f3a2f01%3A0xc96b86c09f70f913!2sChon%20Buri!5e0!3m2!1sth!2sth!4v1700000000002!5m2!1sth!2sth",
    authorId: "system",
    ownerEmail: "content@travelbuddy.com",
  },
];


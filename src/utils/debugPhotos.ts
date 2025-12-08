/**
 * Debug utility for photo upload issues
 * ใช้สำหรับตรวจสอบและวิเคราะห์ปัญหาการแสดงรูปภาพ
 */

export function debugPhotos() {
  // Open browser console and run: debugPhotos()
  // eslint-disable-next-line no-console
  console.group("🔍 Photo Upload Debug Info");
  
  // Get localStorage data
  const token = localStorage.getItem("token");
  // eslint-disable-next-line no-console
  console.log("Auth Token:", token ? "✅ Present" : "❌ Missing");
  
  // Try to get store data
  try {
    const app = (window as any).__APP__;
    if (app) {
      // eslint-disable-next-line no-console
      console.log("App instance found");
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log("Cannot access app instance");
  }
  
  // eslint-disable-next-line no-console
  console.groupEnd();
}

export function analyzePhotoData(photos: any[]) {
  if (!Array.isArray(photos)) {
    // eslint-disable-next-line no-console
    console.error("photos is not an array:", photos);
    return;
  }

  // eslint-disable-next-line no-console
  console.group("📷 Photo Data Analysis");
  // eslint-disable-next-line no-console
  console.log("Total photos:", photos.length);
  
  photos.forEach((photo, index) => {
    const isUrl = /^(https?:|data:)/.test(photo);
    const isText = typeof photo === "string" && !isUrl;
    
    // eslint-disable-next-line no-console
    console.log(`Photo ${index}:`, {
      value: photo.substring(0, 100), // First 100 chars
      type: typeof photo,
      isValidUrl: isUrl,
      isPlainText: isText,
    });
  });
  
  // eslint-disable-next-line no-console
  console.groupEnd();
}

export function checkBackendPhotos() {
  // eslint-disable-next-line no-console
  console.log(
    `%c⚠️ Backend Photo URL Issue`,
    "color: orange; font-size: 14px; font-weight: bold;"
  );
  // eslint-disable-next-line no-console
  console.log(`
Backend ต้องส่ง URLs ของรูปที่อัปโหลด ไม่ใช่ข้อความ
ตัวอย่าง:

❌ Wrong:
{
  "photos": ["รูปภาพที่1", "รูปภาพที่2", ...]
}

✅ Correct:
{
  "photos": [
    "https://your-server.com/uploads/photo-1.jpg",
    "https://your-server.com/uploads/photo-2.jpg",
    ...
  ]
}
  `);
}

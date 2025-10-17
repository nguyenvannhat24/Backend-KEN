const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://nhat:123@cluster0.ajpeazo.mongodb.net/CodeGym?retryWrites=true&w=majority&appName=Cluster0";

async function checkCodeGym() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("CodeGym");

    // Liệt kê collection
    const collections = await db.listCollections().toArray();

    collections.forEach(c => console.log(" -", c.name));

    // Ví dụ đọc thử 5 document đầu tiên từ từng collection
    for (let c of collections) {
      const col = db.collection(c.name);
      const docs = await col.find().limit(5).toArray();
     
    }

  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await client.close();
  }
}

checkCodeGym();

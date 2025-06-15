const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with application default credentials
const serviceAccount = require('./service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'api-for-warp-drive',
  databaseURL: `https://api-for-warp-drive.firebaseio.com`
});

const db = admin.firestore();

async function fetchDeweyDocuments() {
  try {
    console.log('Project ID:', admin.app().options.projectId);
    console.log('Database:', db._settings.databaseId || '(default)');
    
    let totalCount = 0;
    let lastDoc = null;
    const batchSize = 1000; // Firestore batch size limit
    const metadata = [];
    
    // Use pagination to count all documents
    do {
      let query = db.collectionGroup('dewey_indexed_content')
        .orderBy('indexedAt')
        .limit(batchSize);
        
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      const batchCount = snapshot.size;
      totalCount += batchCount;
      
      if (batchCount > 0) {
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log(`Processed batch of ${batchCount} documents. Total so far: ${totalCount}`);
        
        snapshot.forEach(doc => {
          const data = doc.data();
          metadata.push({
            id: doc.id,
            path: doc.ref.path,
            sourceType: data.sourceType,
            indexedAt: data.indexedAt,
            classifiedAt: data.classifiedAt
          });
        });
      }
      
      if (batchCount < batchSize) break; // No more documents
      
    } while (true);
    
    console.log(`Total documents in collection: ${totalCount}`);

    // Write metadata to file
    require('fs').writeFileSync(
      'dewey-cards-metadata.json',
      JSON.stringify(metadata, null, 2)
    );

    console.log('Wrote metadata summary to dewey-cards-metadata.json');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

fetchDeweyDocuments();


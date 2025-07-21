const fs = require('fs');

// Let's create a test using a well-known PDF structure
async function createAndTestPdf() {
  console.log('🔍 Creating and testing PDF...');
  
  const pdf = require('pdf-parse');
  
  // Let's test with an existing PDF if we can find one, or create a better test
  try {
    // Check if there are any existing PDF files in common locations
    const testLocations = [
      '/tmp/test.pdf',
      './test.pdf',
      './test-sample.pdf'
    ];
    
    let testPdfExists = false;
    let existingPdfPath = null;
    
    for (const location of testLocations) {
      try {
        if (fs.existsSync(location)) {
          console.log(`📄 Found existing PDF at: ${location}`);
          existingPdfPath = location;
          testPdfExists = true;
          break;
        }
      } catch (e) {
        // ignore
      }
    }
    
    if (testPdfExists && existingPdfPath) {
      console.log('🧪 Testing with existing PDF...');
      const pdfBuffer = fs.readFileSync(existingPdfPath);
      console.log(`📦 PDF buffer size: ${pdfBuffer.length} bytes`);
      console.log(`📝 PDF starts with: ${pdfBuffer.toString('ascii', 0, 20)}`);
      
      try {
        const result = await pdf(pdfBuffer);
        console.log('✅ PDF parsed successfully!');
        console.log(`📊 Pages: ${result.numpages}`);
        console.log(`📝 Text length: ${result.text.length}`);
        console.log(`📋 First 200 chars: ${result.text.substring(0, 200)}`);
      } catch (pdfError) {
        console.log('❌ PDF parsing failed:', pdfError.message);
        console.log('🔍 Error details:', pdfError);
      }
    } else {
      console.log('📄 No existing PDF found, let\'s check what the server actually receives...');
      
      // Let's see what our test PDF looks like
      if (fs.existsSync('/tmp/test.pdf')) {
        const testBuffer = fs.readFileSync('/tmp/test.pdf');
        console.log(`📄 Test PDF size: ${testBuffer.length}`);
        console.log(`📝 Test PDF content preview: ${testBuffer.toString('ascii', 0, 100)}`);
        
        try {
          const result = await pdf(testBuffer);
          console.log('✅ Test PDF worked!');
          console.log(`📊 Result:`, result);
        } catch (error) {
          console.log('❌ Test PDF failed:', error.message);
          console.log('🔍 This might be why the API is failing');
        }
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('- Text files work fine ✅');
    console.log('- PDF library loads correctly ✅');
    console.log('- Issue is likely in PDF content or parsing ❌');
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createAndTestPdf();
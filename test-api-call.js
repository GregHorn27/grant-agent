const FormData = require('form-data');
const fs = require('fs');

async function testApiCall() {
  console.log('🌐 Testing API call to analyze-documents endpoint...');
  
  try {
    // Create a simple test PDF content
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
274
%%EOF`;

    // Write test PDF to disk
    fs.writeFileSync('/tmp/test.pdf', testPdfContent);
    console.log('📄 Created test PDF file');
    
    // Create FormData
    const form = new FormData();
    form.append('files', fs.createReadStream('/tmp/test.pdf'), {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });
    form.append('userMessage', 'Please analyze this test document');
    
    console.log('📤 Sending request to API...');
    
    // Make request using node-fetch or similar
    const response = await fetch('http://localhost:3000/api/analyze-documents', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📬 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Request failed:', error.message);
    
    // If fetch is not available, let's try a simpler approach
    if (error.message.includes('fetch')) {
      console.log('📝 Note: This script needs fetch API. Let\'s check the server directly.');
      console.log('🔍 You can manually test by uploading a file in the browser');
      console.log('📋 Check the terminal where "npm run dev" is running for detailed logs');
    }
  }
}

testApiCall();
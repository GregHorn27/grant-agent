const fs = require('fs');

// Simulate the exact same process as the API
async function debugPdfExtraction() {
  console.log('🔍 Debugging PDF extraction process...');
  
  try {
    // This is the exact code from the API
    const pdf = require('pdf-parse');
    console.log('✅ PDF library imported');
    
    // Create a simple test PDF content (this should fail gracefully)
    console.log('📄 Testing with invalid PDF data...');
    const fakeBuffer = Buffer.from('Not a real PDF file content');
    
    try {
      const result = await pdf(fakeBuffer);
      console.log('❓ Unexpected success with fake PDF:', result);
    } catch (error) {
      console.log('✅ Expected error with fake PDF:', error.message);
    }
    
    // Now test the actual process - let's see if we can identify the issue
    console.log('\n📋 Analyzing the API code behavior...');
    
    // Check if the issue might be in the dynamic import
    console.log('🧪 Testing dynamic import...');
    const dynamicPdf = (await import('pdf-parse')).default;
    console.log('✅ Dynamic import successful, type:', typeof dynamicPdf);
    console.log('📊 Same function?', dynamicPdf === pdf);
    
    // Test with fake file object like the API receives
    console.log('\n🎭 Simulating API file processing...');
    const simulatedFile = {
      name: 'test.pdf',
      type: 'application/pdf',
      size: 1000,
      arrayBuffer: async () => Buffer.from('fake pdf content %PDF-1.4').buffer
    };
    
    try {
      const buffer = await simulatedFile.arrayBuffer();
      const pdfBuffer = Buffer.from(buffer);
      console.log('📦 Buffer created, length:', pdfBuffer.length);
      console.log('📝 Buffer content preview:', pdfBuffer.toString().substring(0, 50));
      
      const pdfData = await dynamicPdf(pdfBuffer);
      console.log('📊 PDF parsing result:', pdfData);
      
    } catch (simulationError) {
      console.log('❌ Simulation error:', simulationError.message);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    console.error('Stack trace:', error.stack);
  }
}

debugPdfExtraction();
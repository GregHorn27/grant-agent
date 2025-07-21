const fs = require('fs');
const path = require('path');

async function testPdfParsing() {
  console.log('🔍 Testing PDF parsing...');
  
  try {
    // Import pdf-parse
    console.log('📦 Importing pdf-parse...');
    const pdf = require('pdf-parse');
    console.log('✅ pdf-parse imported successfully');
    
    // Look for any PDF files in the project
    const testPdfPath = path.join(__dirname, 'test.pdf');
    
    // Create a minimal test - check if we can at least call pdf() with empty buffer
    console.log('🧪 Testing with minimal buffer...');
    try {
      const result = await pdf(Buffer.alloc(0));
      console.log('⚠️  Empty buffer test result:', result);
    } catch (emptyError) {
      console.log('❌ Empty buffer error (expected):', emptyError.message);
    }
    
    // Test the import itself
    console.log('🔧 Testing pdf-parse function type:', typeof pdf);
    console.log('🔧 pdf-parse function:', pdf.toString().substring(0, 200));
    
  } catch (error) {
    console.error('❌ Error testing PDF parsing:', error);
    console.error('Stack:', error.stack);
  }
}

testPdfParsing();
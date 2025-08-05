// scripts/test-audio.js - Audio Testing Script
import fs from 'fs';
import path from 'path';

console.log('🎵 Testing Audio Features...\n');

// Test Web Audio API support
console.log('Checking Web Audio API support...');
if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
  console.log('✅ Web Audio API supported');
} else {
  console.log('❌ Web Audio API not supported');
}

// Test MediaRecorder support
console.log('Checking MediaRecorder support...');
if (typeof MediaRecorder !== 'undefined') {
  console.log('✅ MediaRecorder supported');
  
  // Check supported MIME types
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ];
  
  console.log('\nSupported audio formats:');
  mimeTypes.forEach(type => {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      console.log(`  ✅ ${type}`);
    } else {
      console.log(`  ❌ ${type}`);
    }
  });
} else {
  console.log('❌ MediaRecorder not supported');
}

console.log('\n🎵 Audio testing complete!');
// Audio utility functions for Leopold
export interface AudioAnalysis {
  duration: number;
  peak_frequency: number;
  average_amplitude: number;
  silence_ratio: number;
}

export function analyzeAudioBuffer(audioBuffer: AudioBuffer): AudioAnalysis {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Basic audio analysis
    let peak = 0;
    let sum = 0;
    let silentSamples = 0;
    
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      if (sample > peak) peak = sample;
      sum += sample;
      if (sample < 0.01) silentSamples++;
    }
    
    return {
      duration: audioBuffer.duration,
      peak_frequency: 0, // Would need FFT for actual frequency analysis
      average_amplitude: sum / channelData.length,
      silence_ratio: silentSamples / channelData.length
    };
  }
  
  export function formatAudioDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

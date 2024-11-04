// audioLoader.js
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};

// Load audio files
export async function loadAudio(url, name) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBuffers[name] = audioBuffer;
}

// Play audio by name
export function playAudio(name) {
  if (audioBuffers[name]) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[name];
    source.connect(audioContext.destination);
    source.start();
    source.loop = true;
    return source; // Optional: return source for further control
  } else {
    console.warn(`Audio '${name}' not loaded.`);
  }
}

// Pause audio by stopping the source
export function pauseAudio(source) {
  if (source) {
    source.stop();
  }
}

// Preload your audio files
export async function preloadAudio() {
  await loadAudio("/sounds/accelerate.mp3", "accelerate");
  await loadAudio("/sounds/engine.mp3", "engine");
  await loadAudio("/sounds/tire-brake.mp3", "brake");
  await loadAudio("/sounds/crash.mp3", "turn");
}

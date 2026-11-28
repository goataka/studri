const SOUND_KEY = "studri.sound";

export function soundEnabled(storage: Storage): boolean {
  try {
    return storage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(storage: Storage, enabled: boolean): void {
  try {
    storage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    // 保存できない環境では、今の画面だけで切り替える
  }
}

// 正解と不正解の短い音。音が出せない環境では何もしない
export function playTone(kind: "correct" | "wrong"): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === "correct" ? 880 : 220;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.25);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
  } catch {
    // 音が出せない環境
  }
}

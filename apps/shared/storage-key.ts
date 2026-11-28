// 学習記録の保存名に環境名を付ける。形は apps/shared/static-storage-key.js と同じ
export function currentEnv(): string {
  return (typeof document === "undefined" ? undefined : document.documentElement.dataset.env) || "develop";
}

export function storageKey(name: string, env: string = currentEnv()): string {
  return `${env}:${name}`;
}

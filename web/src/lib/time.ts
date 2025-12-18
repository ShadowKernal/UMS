export const nowTs = () => Math.floor(Date.now() / 1000);

export const isoTs = (ts: number) => new Date(ts * 1000).toISOString();

import { describe, it, expect } from 'vitest';
import { computeStartup, HOUR, DAY, YEAR } from './model';

function stage(result: ReturnType<typeof computeStartup>, id: string) {
  return result.stages.find((s) => s.id === id)!;
}

describe('receiver start-up model', () => {
  it('hot start after a short nap reuses everything and re-anchors cheaply', () => {
    const r = computeStartup('hot', HOUR);
    expect(stage(r, 'kroot').status).toBe('reuse');
    expect(stage(r, 'pk').status).toBe('reuse');
    expect(r.effectiveScenario).toBe('hot');
    expect(r.hashSteps).toBe(120); // 1 h / 30 s
    expect(r.ttfafSeconds).toBe(30);
  });

  it('cold start must acquire both public key and KROOT', () => {
    const r = computeStartup('cold', HOUR);
    expect(stage(r, 'pk').status).toBe('acquire-sis');
    expect(stage(r, 'kroot').status).toBe('acquire-sis');
    expect(r.effectiveScenario).toBe('cold');
  });

  it('hot start degrades to warm once the chain has rolled over', () => {
    const r = computeStartup('hot', 2 * DAY);
    expect(stage(r, 'kroot').status).toBe('acquire-sis');
    expect(stage(r, 'pk').status).toBe('reuse');
    expect(r.effectiveScenario).toBe('warm');
  });

  it('hot start degrades to cold once the public key may have changed', () => {
    const r = computeStartup('hot', 2 * YEAR);
    expect(stage(r, 'pk').status).toBe('acquire-sis');
    expect(r.effectiveScenario).toBe('cold');
  });

  it('beyond the Merkle horizon the root itself is refreshed out-of-band', () => {
    const r = computeStartup('hot', 12 * YEAR);
    expect(stage(r, 'merkle').status).toBe('download-oob');
  });
});

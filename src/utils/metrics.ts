export interface Metric {
  name: string;
  durationMs: number;
  timestamp: number;
}

class MetricsLogger {
  private metrics: Metric[] = [];

  log(name: string, durationMs: number) {
    this.metrics.push({ name, durationMs, timestamp: Date.now() });
    
    // Временно выводим в консоль для отладки, пока нет UI
    const stats = this.getStats(name);
    console.log('[Metrics] ' + name + ': ' + durationMs.toFixed(0) + 'ms (p50: ' + stats.p50 + 'ms, p95: ' + stats.p95 + 'ms)');
  }

  getStats(name: string) {
    const relevant = this.metrics.filter((m) => m.name === name).map((m) => m.durationMs);
    if (relevant.length === 0) return { p50: 0, p95: 0, count: 0 };

    relevant.sort((a, b) => a - b);
    
    const p50Index = Math.floor(relevant.length * 0.5);
    const p95Index = Math.floor(relevant.length * 0.95);

    return {
      p50: relevant[p50Index].toFixed(0),
      p95: relevant[p95Index].toFixed(0),
      count: relevant.length,
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const metrics = new MetricsLogger();

/** Counts active viewing time, excluding pauses, inspection and hidden tabs. */
export class PlaybackClock {
  private scene: string | null = null;
  private duration = 0;
  private remaining = 0;
  private startedAt: number | null = null;

  configure(scene: string, duration: number) {
    if (this.scene === scene && this.duration === duration) return;
    this.scene = scene;
    this.duration = duration;
    this.remaining = duration;
    this.startedAt = null;
  }

  resume(now: number) {
    this.startedAt ??= now;
    return Math.max(0, this.remaining - Math.max(0, now - this.startedAt));
  }

  pause(now: number) {
    if (this.startedAt === null) return;
    this.remaining = Math.max(
      0,
      this.remaining - Math.max(0, now - this.startedAt),
    );
    this.startedAt = null;
  }

  elapsed(now: number) {
    const active = this.startedAt === null ? 0 : Math.max(0, now - this.startedAt);
    return Math.min(this.duration, this.duration - this.remaining + active);
  }

  seek(elapsed: number) {
    this.remaining = this.duration - Math.max(0, Math.min(this.duration, elapsed));
    this.startedAt = null;
  }
}

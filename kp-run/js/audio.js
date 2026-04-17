export class AudioSystem {
    constructor() { this.ctx = null; }
    init() { if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    playHit() {
        if(!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.connect(g); g.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        g.gain.fadeOut(this.ctx.currentTime + 0.5);
        osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    }
    playBGM() {} // 可加入簡單的 8-bit 循環
    stopBGM() {}
}
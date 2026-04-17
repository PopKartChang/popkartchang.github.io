export class UI {
    constructor() {
        this.scoreEl = document.getElementById('score-val');
        this.healthEl = document.getElementById('health-bar');
        this.trialEl = document.getElementById('trial-text');
        this.screen = document.getElementById('ui-screen');
    }
    reset() { this.screen.classList.remove('active'); this.healthEl.style.width = '100%'; }
    update(s, l) {
        this.scoreEl.innerText = s.toString().padStart(6, '0');
        this.healthEl.style.width = `${(l/3)*100}%`;
        if(l === 2) this.trialEl.innerText = "二審上訴中";
        if(l === 1) this.trialEl.innerText = "三審拼清白";
    }
    flash() { gsap.to("body", { backgroundColor: "#500", duration: 0.1, yoyo: true, repeat: 1 }); }
    showGameOver(s) {
        this.screen.classList.add('active');
        document.getElementById('game-over-info').style.display = 'block';
        document.getElementById('final-score-display').innerText = `最終獻金：${s}`;
        document.getElementById('game-over-quote').innerText = "「台灣的司法是給有錢人開的！」";
    }
}
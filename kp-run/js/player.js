export class Player {
    constructor(w, h) {
        this.w = 60; this.h = 80;
        this.x = 100; this.y = h - 200;
        this.vx = 0; this.vy = 0;
        this.gravity = 0.8;
        this.jumpPower = -15;
        this.speed = 6;
        this.isGrounded = false;
        this.jumpCount = 0;
        this.hp = 100;
        this.keys = {};
        this.facing = 1; // 1: 右, -1: 左
        this.invincible = 0; // 無敵時間
    }

    handleInput(key, isDown) {
        this.keys[key.toLowerCase()] = isDown;
        if (isDown && (key === ' ' || key === 'j')) {
            if (this.jumpCount < 2) {
                this.vy = this.jumpPower;
                this.jumpCount++;
            }
        }
    }

    update(dt, platforms) {
        // 左右移動
        if (this.keys['a'] || this.keys['arrowleft']) { this.vx = -this.speed; this.facing = -1; }
        else if (this.keys['d'] || this.keys['arrowright']) { this.vx = this.speed; this.facing = 1; }
        else { this.vx *= 0.8; }

        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;

        // 簡單地板碰撞
        this.isGrounded = false;
        platforms.forEach(p => {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y + this.h < p.y + p.h + this.vy) {
                this.y = p.y - this.h;
                this.vy = 0;
                this.isGrounded = true;
                this.jumpCount = 0;
            }
        });

        if (this.invincible > 0) this.invincible -= dt;
    }

    draw(ctx) {
        if (this.invincible > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;

        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        if (this.facing === -1) ctx.scale(-1, 1);

        // 繪製 Q 版阿北 (楓之谷風)
        // 身體 (水藍色襯衫)
        ctx.fillStyle = '#add8e6';
        ctx.fillRect(-20, -10, 40, 30);
        // 高腰褲
        ctx.fillStyle = '#333';
        ctx.fillRect(-21, 10, 42, 15);
        // 頭部
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(-15, -35, 30, 30);
        // 招牌白髮
        ctx.fillStyle = '#eee';
        ctx.fillRect(-17, -38, 34, 10);
        // 眼鏡
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        ctx.strokeRect(-10, -25, 8, 8); ctx.strokeRect(2, -25, 8, 8);

        ctx.restore();
    }

    takeDamage(amount) {
        if (this.invincible > 0) return;
        this.hp -= amount;
        this.invincible = 1500;
        return true;
    }
}
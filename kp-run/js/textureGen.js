import * as THREE from 'three';
export function createNeonTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#050505'; ctx.fillRect(0,0,256,512);
    ctx.strokeStyle = '#1dbfb4'; ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, 236, 492);
    ctx.fillStyle = '#1dbfb4'; ctx.font = 'bold 40px Arial';
    ctx.fillText('科學理性', 50, 100);
    ctx.fillText('務實', 80, 180);
    return new THREE.CanvasTexture(canvas);
}
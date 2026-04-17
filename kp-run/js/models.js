import * as THREE from 'three';

export async function buildPlayerModel() {
    const group = new THREE.Group();
    // 單車本體
    const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.1, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x1dbfb4, metalness: 0.8, roughness: 0.2 })
    );
    frame.position.y = 1;
    
    // 阿伯本體 (簡化但有特徵)
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.4, 0.8, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    body.position.y = 1.8;
    
    // 霓虹發光輪圈
    const ringGeo = new THREE.TorusGeometry(0.7, 0.05, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const fWheel = new THREE.Mesh(ringGeo, ringMat);
    fWheel.position.set(0, 0.7, 1);
    
    group.add(frame, body, fWheel);
    return group;
}

export function buildNetArmyCar() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1, roughness: 0.1 })
    );
    
    // 側邊發光「1450」
    const light = new THREE.Mesh(
        new THREE.BoxGeometry(3.1, 0.5, 2),
        new THREE.MeshBasicMaterial({ color: 0xff0055 })
    );
    light.position.y = 0.2;
    
    group.add(body, light);
    return group;
}
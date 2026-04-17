import * as THREE from 'three';
import { buildNetArmyCar } from './models.js';
import { createNeonTexture } from './textureGen.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.createRoad();
        this.buildings = [];
        for(let i=0; i<20; i++) this.createBuilding(i);
    }

    createRoad() {
        const geo = new THREE.PlaneGeometry(20, 1000);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x050505, 
            metalness: 0.9, 
            roughness: 0.1 
        });
        const road = new THREE.Mesh(geo, mat);
        road.rotation.x = -Math.PI/2;
        this.scene.add(road);
        
        // 分隔線
        const grid = new THREE.GridHelper(20, 20, 0x1dbfb4, 0x1dbfb4);
        grid.position.y = 0.05;
        this.scene.add(grid);
    }

    createBuilding(i) {
        const h = 10 + Math.random() * 30;
        const b = new THREE.Mesh(
            new THREE.BoxGeometry(8, h, 8),
            new THREE.MeshStandardMaterial({ 
                map: createNeonTexture(), 
                emissive: 0x1dbfb4, 
                emissiveIntensity: 0.1 
            })
        );
        b.position.set(i % 2 === 0 ? -15 : 15, h/2, -i * 30);
        this.scene.add(b);
        this.buildings.push(b);
    }

    update(distance, speed) {
        if (Math.random() < 0.02) {
            const obs = buildNetArmyCar();
            const lane = Math.floor(Math.random() * 3) - 1;
            obs.position.set(lane * 5, 0.75, -distance - 200);
            obs.userData = { type: 'obstacle' };
            this.scene.add(obs);
            this.obstacles.push(obs);
        }

        this.obstacles.forEach((o, i) => {
            o.position.z += speed;
            if (o.position.z > 20) this.removeObstacle(i);
        });

        this.buildings.forEach(b => {
            b.position.z += speed;
            if (b.position.z > 50) b.position.z -= 600;
        });
    }

    removeObstacle(i) {
        this.scene.remove(this.obstacles[i]);
        this.obstacles.splice(i, 1);
    }
}
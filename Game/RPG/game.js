// 게임 상태
let gameState = {
    selectedClass: null,
    player: null,
    scene: null,
    camera: null,
    renderer: null,
    enemies: [],
    isMoving: { forward: false, backward: false, left: false, right: false },
    mouseX: 0,
    mouseY: 0,
    keys: {},
    shiftPressed: false,
    ctrlPressed: false,
    cameraDistance: 3  // 카메라 거리 (스크롤로 조절)
};

// 클래스 정의
const classes = {
    warrior: {
        name: '전사',
        hp: 150,
        maxHp: 150,
        mp: 30,
        maxMp: 30,
        attack: 25,
        defense: 20,
        speed: 5,
        skills: [
            { name: '강타', key: 'Q', cost: 5, damage: 40, type: 'attack', animation: 'attack' },
            { name: '방어 태세', key: 'T', cost: 10, type: 'buff', defense: 10, animation: 'defend' },
            { name: '돌진', key: 'E', cost: 15, damage: 50, type: 'attack', animation: 'charge' },
            { name: '분노', key: 'R', cost: 20, type: 'buff', attack: 15, animation: 'buff' }
        ]
    },
    assassin: {
        name: '암살자',
        hp: 100,
        maxHp: 100,
        mp: 60,
        maxMp: 60,
        attack: 35,
        defense: 10,
        speed: 8,
        skills: [
            { name: '참격', key: 'Q', cost: 10, damage: 45, type: 'attack', animation: 'slash' },
            { name: '은신', key: 'T', cost: 20, type: 'buff', speed: 5, animation: 'stealth' },
            { name: '연속 타격', key: 'E', cost: 25, damage: 60, type: 'attack', animation: 'combo' },
            { name: '치명타', key: 'R', cost: 30, damage: 100, type: 'attack', animation: 'critical' }
        ]
    },
    mage: {
        name: '마법사',
        hp: 80,
        maxHp: 80,
        mp: 120,
        maxMp: 120,
        attack: 40,
        defense: 8,
        speed: 4,
        skills: [
            { name: '파이어볼', key: 'Q', cost: 15, damage: 55, type: 'attack', animation: 'cast' },
            { name: '아이스볼', key: 'T', cost: 15, damage: 50, type: 'attack', animation: 'cast' },
            { name: '라이트닝', key: 'E', cost: 25, damage: 70, type: 'attack', animation: 'cast' },
            { name: '메테오', key: 'R', cost: 40, damage: 120, type: 'attack', animation: 'cast' }
        ]
    },
    priest: {
        name: '사제',
        hp: 100,
        maxHp: 100,
        mp: 100,
        maxMp: 100,
        attack: 20,
        defense: 15,
        speed: 5,
        skills: [
            { name: '힐', key: 'Q', cost: 20, heal: 40, type: 'heal', animation: 'heal' },
            { name: '힐링 오라', key: 'T', cost: 30, heal: 60, type: 'heal', animation: 'heal' },
            { name: '방어 버프', key: 'E', cost: 25, type: 'buff', defense: 15, animation: 'buff' },
            { name: '대치유', key: 'R', cost: 40, heal: 100, type: 'heal', animation: 'heal' }
        ]
    }
};

// 클래스 선택 이벤트
document.querySelectorAll('.class-card').forEach(card => {
    card.addEventListener('click', () => {
        const className = card.dataset.class;
        gameState.selectedClass = classes[className];
        startGame();
    });
});

// 게임 초기화
function startGame() {
    document.getElementById('classSelection').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    initThreeJS();
    createPlayer();
    createWorld();
    setupControls();
    setupUI();
    animate();
}

// Three.js 초기화
function initThreeJS() {
    const canvas = document.getElementById('gameCanvas');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Scene
    gameState.scene = new THREE.Scene();
    gameState.scene.background = new THREE.Color(0x87CEEB);
    gameState.scene.fog = new THREE.Fog(0x87CEEB, 0, 500);
    
    // Camera
    gameState.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    gameState.camera.position.set(0, 10, 20);
    
    // Renderer
    gameState.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    gameState.renderer.setSize(width, height);
    gameState.renderer.shadowMap.enabled = true;
    gameState.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    gameState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    gameState.scene.add(directionalLight);
    
    // 리사이즈 핸들러
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        gameState.camera.aspect = width / height;
        gameState.camera.updateProjectionMatrix();
        gameState.renderer.setSize(width, height);
    });
}

// 플레이어 생성
function createPlayer() {
    const color = getClassColor(gameState.selectedClass.name);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.3,
        roughness: 0.7
    });
    
    // 더 어두운 색상으로 몸통
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color).multiplyScalar(0.8),
        metalness: 0.2,
        roughness: 0.8
    });
    
    // 피부 색상 (머리)
    const skinMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffdbac,
        roughness: 0.9
    });
    
    // 사람 형태 모델링 - 그룹으로 조합
    const playerGroup = new THREE.Group();
    
    // 머리 (더 둥근 형태)
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 1.6, 0);
    head.castShadow = true;
    playerGroup.add(head);
    
    // 머리 장식 (헬멧/모자 느낌)
    const hatGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
    const hat = new THREE.Mesh(hatGeometry, baseMaterial);
    hat.position.set(0, 1.75, 0);
    hat.castShadow = true;
    playerGroup.add(hat);
    
    // 목
    const neckGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.set(0, 1.3, 0);
    neck.castShadow = true;
    playerGroup.add(neck);
    
    // 어깨 (양쪽)
    const shoulderGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, baseMaterial);
    leftShoulder.position.set(-0.5, 1.2, 0);
    leftShoulder.castShadow = true;
    playerGroup.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry, baseMaterial);
    rightShoulder.position.set(0.5, 1.2, 0);
    rightShoulder.castShadow = true;
    playerGroup.add(rightShoulder);
    
    // 몸통 (상체)
    const torsoGeometry = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.set(0, 0.7, 0);
    torso.castShadow = true;
    playerGroup.add(torso);
    
    // 가슴 부위 (갑옷 느낌)
    const chestGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.3);
    const chest = new THREE.Mesh(chestGeometry, baseMaterial);
    chest.position.set(0, 0.85, 0.15);
    chest.castShadow = true;
    playerGroup.add(chest);
    
    // 허리
    const waistGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.4);
    const waist = new THREE.Mesh(waistGeometry, bodyMaterial);
    waist.position.set(0, 0.3, 0);
    waist.castShadow = true;
    playerGroup.add(waist);
    
    // 왼쪽 팔 상단
    const leftUpperArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, baseMaterial);
    leftUpperArm.position.set(-0.5, 0.9, 0);
    leftUpperArm.rotation.z = Math.PI / 6;
    leftUpperArm.castShadow = true;
    playerGroup.add(leftUpperArm);
    
    // 왼쪽 팔 하단
    const leftLowerArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8);
    const leftLowerArm = new THREE.Mesh(leftLowerArmGeometry, baseMaterial);
    leftLowerArm.position.set(-0.7, 0.5, 0);
    leftLowerArm.rotation.z = Math.PI / 4;
    leftLowerArm.castShadow = true;
    playerGroup.add(leftLowerArm);
    
    // 오른쪽 팔 상단
    const rightUpperArmGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, baseMaterial);
    rightUpperArm.position.set(0.5, 0.9, 0);
    rightUpperArm.rotation.z = -Math.PI / 6;
    rightUpperArm.castShadow = true;
    playerGroup.add(rightUpperArm);
    
    // 오른쪽 팔 하단
    const rightLowerArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8);
    const rightLowerArm = new THREE.Mesh(rightLowerArmGeometry, baseMaterial);
    rightLowerArm.position.set(0.7, 0.5, 0);
    rightLowerArm.rotation.z = -Math.PI / 4;
    rightLowerArm.castShadow = true;
    playerGroup.add(rightLowerArm);
    
    // 왼쪽 다리 상단
    const leftUpperLegGeometry = new THREE.CylinderGeometry(0.18, 0.2, 0.5, 8);
    const leftUpperLeg = new THREE.Mesh(leftUpperLegGeometry, bodyMaterial);
    leftUpperLeg.position.set(-0.22, -0.05, 0);
    leftUpperLeg.castShadow = true;
    playerGroup.add(leftUpperLeg);
    
    // 왼쪽 다리 하단
    const leftLowerLegGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
    const leftLowerLeg = new THREE.Mesh(leftLowerLegGeometry, bodyMaterial);
    leftLowerLeg.position.set(-0.22, -0.5, 0);
    leftLowerLeg.castShadow = true;
    playerGroup.add(leftLowerLeg);
    
    // 왼쪽 발
    const leftFootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.4);
    const leftFoot = new THREE.Mesh(leftFootGeometry, baseMaterial);
    leftFoot.position.set(-0.22, -0.75, 0.1);
    leftFoot.castShadow = true;
    playerGroup.add(leftFoot);
    
    // 오른쪽 다리 상단
    const rightUpperLegGeometry = new THREE.CylinderGeometry(0.18, 0.2, 0.5, 8);
    const rightUpperLeg = new THREE.Mesh(rightUpperLegGeometry, bodyMaterial);
    rightUpperLeg.position.set(0.22, -0.05, 0);
    rightUpperLeg.castShadow = true;
    playerGroup.add(rightUpperLeg);
    
    // 오른쪽 다리 하단
    const rightLowerLegGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 8);
    const rightLowerLeg = new THREE.Mesh(rightLowerLegGeometry, bodyMaterial);
    rightLowerLeg.position.set(0.22, -0.5, 0);
    rightLowerLeg.castShadow = true;
    playerGroup.add(rightLowerLeg);
    
    // 오른쪽 발
    const rightFootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.4);
    const rightFoot = new THREE.Mesh(rightFootGeometry, baseMaterial);
    rightFoot.position.set(0.22, -0.75, 0.1);
    rightFoot.castShadow = true;
    playerGroup.add(rightFoot);
    
    gameState.player = {
        mesh: playerGroup,
        bodyParts: { 
            head, hat, neck, torso, chest, waist,
            leftUpperArm, leftLowerArm, rightUpperArm, rightLowerArm,
            leftUpperLeg, leftLowerLeg, leftFoot, rightUpperLeg, rightLowerLeg, rightFoot
        },
        class: gameState.selectedClass,
        hp: gameState.selectedClass.hp,
        maxHp: gameState.selectedClass.maxHp,
        mp: gameState.selectedClass.mp,
        maxMp: gameState.selectedClass.maxMp,
        attack: gameState.selectedClass.attack,
        defense: gameState.selectedClass.defense,
        speed: gameState.selectedClass.speed,
        level: 1,
        exp: 0,
        expToNext: 100,
        position: new THREE.Vector3(0, 1, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        rotation: 0,
        canJump: true,
        mpRegenTimer: 0,  // 마나 회복 타이머
        isRunning: false,  // 대시 상태
        isAnimating: false  // 스킬 애니메이션 중인지
    };
    
    gameState.player.mesh.position.copy(gameState.player.position);
    gameState.scene.add(gameState.player.mesh);
    
    // 카메라를 플레이어 뒤에 배치
    updateCamera();
}

// 클래스별 색상
function getClassColor(className) {
    const colors = {
        '전사': 0xff4444,
        '암살자': 0x4444ff,
        '마법사': 0xff44ff,
        '사제': 0x44ff44
    };
    return colors[className] || 0x888888;
}

// 월드 생성
function createWorld() {
    // 지형 생성 (여러 개의 평면으로 언덕 표현)
    const groundSize = 200;
    const segments = 50;
    
    // 메인 지면
    const floorGeometry = new THREE.PlaneGeometry(groundSize, groundSize, segments, segments);
    
    // 높이맵 생성 (언덕 효과)
    const vertices = floorGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        // 여러 개의 파도 효과로 언덕 생성
        const height = 
            Math.sin(x * 0.05) * 2 +
            Math.cos(z * 0.05) * 2 +
            Math.sin((x + z) * 0.03) * 1.5;
        vertices[i + 1] = height;
    }
    floorGeometry.computeVertexNormals();
    
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7cb342,
        roughness: 0.9,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    gameState.scene.add(floor);
    
    // 바위 추가
    for (let i = 0; i < 30; i++) {
        const rockSize = Math.random() * 1.5 + 0.5;
        const rockGeometry = new THREE.IcosahedronGeometry(rockSize, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.1
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 10;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        rock.position.set(x, rockSize, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        gameState.scene.add(rock);
    }
    
    // 나무 추가
    for (let i = 0; i < 50; i++) {
        const treeGroup = new THREE.Group();
        
        // 나무 줄기
        const trunkHeight = Math.random() * 3 + 2;
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        treeGroup.add(trunk);
        
        // 나뭇잎 (여러 개)
        const leafColor = new THREE.Color().setHSL(0.3 + Math.random() * 0.1, 0.7, 0.4);
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: leafColor,
            roughness: 0.8
        });
        
        for (let j = 0; j < 3; j++) {
            const leafSize = Math.random() * 1.5 + 1;
            const leafGeometry = new THREE.ConeGeometry(leafSize, leafSize * 1.5, 8);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 1,
                trunkHeight + (j * leafSize * 0.8),
                (Math.random() - 0.5) * 1
            );
            leaf.castShadow = true;
            leaf.receiveShadow = true;
            treeGroup.add(leaf);
        }
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 70 + 15;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        treeGroup.position.set(x, trunkHeight / 2, z);
        gameState.scene.add(treeGroup);
    }
    
    // 풀 추가 (작은 원뿔들)
    for (let i = 0; i < 200; i++) {
        const grassSize = Math.random() * 0.3 + 0.2;
        const grassGeometry = new THREE.ConeGeometry(grassSize, grassSize * 2, 6);
        const grassMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4caf50,
            roughness: 0.9
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 90;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        grass.position.set(x, grassSize, z);
        grass.rotation.y = Math.random() * Math.PI;
        grass.castShadow = true;
        grass.receiveShadow = true;
        gameState.scene.add(grass);
    }
    
    // 돌탑/기둥 추가
    for (let i = 0; i < 15; i++) {
        const pillarHeight = Math.random() * 4 + 3;
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.6, pillarHeight, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.2
        });
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 20;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        pillar.position.set(x, pillarHeight / 2, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        gameState.scene.add(pillar);
        
        // 기둥 위 장식
        const topGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.8);
        const top = new THREE.Mesh(topGeometry, pillarMaterial);
        top.position.set(x, pillarHeight + 0.15, z);
        top.castShadow = true;
        top.receiveShadow = true;
        gameState.scene.add(top);
    }
    
    // 몬스터 생성
    createEnemy(10, 0, 10);
    createEnemy(-10, 0, -10);
    createEnemy(15, 0, -15);
    createEnemy(-15, 0, 15);
    createEnemy(20, 0, -20);
}

// 몬스터 생성
function createEnemy(x, y, z) {
    const enemyGroup = new THREE.Group();
    
    // 몬스터 머리 (빨간색 구)
    const headGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b0000,
        roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.2, 0);
    head.castShadow = true;
    enemyGroup.add(head);
    
    // 눈 (노란색)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.25, 0.35);
    enemyGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.25, 0.35);
    enemyGroup.add(rightEye);
    
    // 뿔 (왼쪽)
    const hornGeometry = new THREE.ConeGeometry(0.08, 0.3, 6);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(-0.2, 1.45, 0);
    leftHorn.rotation.z = -0.3;
    leftHorn.castShadow = true;
    enemyGroup.add(leftHorn);
    
    // 뿔 (오른쪽)
    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(0.2, 1.45, 0);
    rightHorn.rotation.z = 0.3;
    rightHorn.castShadow = true;
    enemyGroup.add(rightHorn);
    
    // 목
    const neckGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 8);
    const neck = new THREE.Mesh(neckGeometry, headMaterial);
    neck.position.set(0, 0.95, 0);
    neck.castShadow = true;
    enemyGroup.add(neck);
    
    // 몸통 (사각형)
    const bodyGeometry = new THREE.BoxGeometry(0.7, 0.8, 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcc0000,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.5, 0);
    body.castShadow = true;
    enemyGroup.add(body);
    
    // 가슴 장식 (어두운 부분)
    const chestGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.35);
    const chestMaterial = new THREE.MeshStandardMaterial({ color: 0x990000 });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(0, 0.6, 0.3);
    chest.castShadow = true;
    enemyGroup.add(chest);
    
    // 왼쪽 팔
    const leftArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
    const leftArm = new THREE.Mesh(leftArmGeometry, bodyMaterial);
    leftArm.position.set(-0.5, 0.6, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    enemyGroup.add(leftArm);
    
    // 왼쪽 손 (갈고리)
    const leftHandGeometry = new THREE.ConeGeometry(0.1, 0.2, 6);
    const leftHand = new THREE.Mesh(leftHandGeometry, hornMaterial);
    leftHand.position.set(-0.7, 0.35, 0);
    leftHand.rotation.z = Math.PI / 2;
    leftHand.castShadow = true;
    enemyGroup.add(leftHand);
    
    // 오른쪽 팔
    const rightArmGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
    const rightArm = new THREE.Mesh(rightArmGeometry, bodyMaterial);
    rightArm.position.set(0.5, 0.6, 0);
    rightArm.rotation.z = -Math.PI / 6;
    rightArm.castShadow = true;
    enemyGroup.add(rightArm);
    
    // 오른쪽 손 (갈고리)
    const rightHandGeometry = new THREE.ConeGeometry(0.1, 0.2, 6);
    const rightHand = new THREE.Mesh(rightHandGeometry, hornMaterial);
    rightHand.position.set(0.7, 0.35, 0);
    rightHand.rotation.z = -Math.PI / 2;
    rightHand.castShadow = true;
    enemyGroup.add(rightHand);
    
    // 왼쪽 다리
    const leftLegGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8);
    const leftLeg = new THREE.Mesh(leftLegGeometry, bodyMaterial);
    leftLeg.position.set(-0.25, -0.1, 0);
    leftLeg.castShadow = true;
    enemyGroup.add(leftLeg);
    
    // 왼쪽 발
    const leftFootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.35);
    const leftFoot = new THREE.Mesh(leftFootGeometry, hornMaterial);
    leftFoot.position.set(-0.25, -0.4, 0.1);
    leftFoot.castShadow = true;
    enemyGroup.add(leftFoot);
    
    // 오른쪽 다리
    const rightLegGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8);
    const rightLeg = new THREE.Mesh(rightLegGeometry, bodyMaterial);
    rightLeg.position.set(0.25, -0.1, 0);
    rightLeg.castShadow = true;
    enemyGroup.add(rightLeg);
    
    // 오른쪽 발
    const rightFootGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.35);
    const rightFoot = new THREE.Mesh(rightFootGeometry, hornMaterial);
    rightFoot.position.set(0.25, -0.4, 0.1);
    rightFoot.castShadow = true;
    enemyGroup.add(rightFoot);
    
    // 꼬리
    const tailGeometry = new THREE.ConeGeometry(0.1, 0.4, 6);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 0.3, -0.4);
    tail.rotation.x = Math.PI / 4;
    tail.castShadow = true;
    enemyGroup.add(tail);
    
    const enemy = {
        mesh: enemyGroup,
        bodyParts: { head, body, leftArm, rightArm, leftLeg, rightLeg, tail },
        hp: 50,
        maxHp: 50,
        attack: 15,
        position: new THREE.Vector3(x, y + 0.75, z),
        target: null,
        state: 'idle', // idle, chase, attack
        attackCooldown: 0
    };
    
    enemy.mesh.position.copy(enemy.position);
    gameState.scene.add(enemy.mesh);
    gameState.enemies.push(enemy);
}

// 컨트롤 설정
function setupControls() {
    // 키보드
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key.toLowerCase()] = true;
        
        // Shift 키 감지 (왼쪽/오른쪽 모두)
        if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            gameState.shiftPressed = true;
        }
        
        // Ctrl 키 감지
        if (e.key === 'Control' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
            gameState.ctrlPressed = true;
            // 포인터 잠금 해제
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
        
        if (e.key.toLowerCase() === 'w') gameState.isMoving.forward = true;
        if (e.key.toLowerCase() === 's') gameState.isMoving.backward = true;
        if (e.key.toLowerCase() === 'a') gameState.isMoving.left = true;
        if (e.key.toLowerCase() === 'd') gameState.isMoving.right = true;
        
        if (e.key === ' ') {
            jump();
        }
        
        // 스킬 사용
        if (e.key.toLowerCase() === 'q') useSkill(0);
        if (e.key.toLowerCase() === 't') useSkill(1);
        if (e.key.toLowerCase() === 'e') useSkill(2);
        if (e.key.toLowerCase() === 'r') useSkill(3);
        
        // 인벤토리
        if (e.key.toLowerCase() === 'i') {
            toggleInventory();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key.toLowerCase()] = false;
        
        // Shift 키 해제 (왼쪽/오른쪽 모두)
        if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            gameState.shiftPressed = false;
        }
        
        // Ctrl 키 해제
        if (e.key === 'Control' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
            gameState.ctrlPressed = false;
        }
        
        if (e.key.toLowerCase() === 'w') gameState.isMoving.forward = false;
        if (e.key.toLowerCase() === 's') gameState.isMoving.backward = false;
        if (e.key.toLowerCase() === 'a') gameState.isMoving.left = false;
        if (e.key.toLowerCase() === 'd') gameState.isMoving.right = false;
    });
    
    // 마우스
    document.addEventListener('mousemove', (e) => {
        // Ctrl이 눌려있지 않을 때만 화면 회전
        if (document.pointerLockElement === document.getElementById('gameCanvas') && !gameState.ctrlPressed) {
            gameState.mouseX += e.movementX * 0.002;
            gameState.mouseY += e.movementY * 0.003;  // 위아래 회전 감도 증가
            // gameState.mouseY = Math.max(-Math.PI, Math.min(Math.PI, gameState.mouseY));  // 180도 범위
        }
    });
    
    document.getElementById('gameCanvas').addEventListener('click', () => {
        // Ctrl이 눌려있지 않을 때만 포인터 잠금
        if (!gameState.ctrlPressed) {
            document.getElementById('gameCanvas').requestPointerLock();
        }
    });
    
    // 포인터 잠금 해제 시 감지
    document.addEventListener('pointerlockchange', () => {
        if (!document.pointerLockElement && gameState.ctrlPressed) {
            // Ctrl이 눌려있으면 포인터 잠금하지 않음
        }
    });
    
    // 마우스 휠로 카메라 확대/축소
    document.getElementById('gameCanvas').addEventListener('wheel', (e) => {
        e.preventDefault();
        gameState.cameraDistance += e.deltaY * 0.01;
        gameState.cameraDistance = Math.max(1, Math.min(10, gameState.cameraDistance)); // 1~10 범위 제한
    });
    
    // 스킬 버튼 클릭
    document.querySelectorAll('.skill-slot').forEach((slot, index) => {
        slot.addEventListener('click', () => {
            useSkill(index);
        });
    });
}

// 점프
function jump() {
    if (gameState.player.canJump) {
        gameState.player.velocity.y = 8;
        gameState.player.canJump = false;
    }
}

// 스킬 사용
function useSkill(index) {
    const player = gameState.player;
    const skill = player.class.skills[index];
    
    if (!skill) return;
    if (player.mp < skill.cost) {
        addBattleLog('마나가 부족합니다!', 'damage');
        return;
    }
    
    player.mp -= skill.cost;
    updateUI();
    
    // 스킬 애니메이션 실행
    if (skill.animation) {
        playSkillAnimation(skill.animation);
    }
    
    if (skill.type === 'attack') {
        // 가장 가까운 적에게 공격
        const nearestEnemy = findNearestEnemy();
        if (nearestEnemy && getDistance(player.position, nearestEnemy.position) < 10) {
            const damage = skill.damage + player.attack;
            nearestEnemy.hp -= damage;
            addBattleLog(`${skill.name}! ${damage} 데미지!`, 'damage');
            
            if (nearestEnemy.hp <= 0) {
                removeEnemy(nearestEnemy);
                player.exp += 50;
                // 몬스터 처치 시 마나 회복 (최대 마나의 20%)
                const mpRestored = Math.floor(player.maxMp * 0.2);
                player.mp = Math.min(player.maxMp, player.mp + mpRestored);
                addBattleLog(`마나 ${mpRestored} 회복!`, 'heal');
                checkLevelUp();
            }
        } else {
            addBattleLog(`${skill.name} 사용!`, 'skill');
        }
    } else if (skill.type === 'heal') {
        const healAmount = skill.heal;
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        addBattleLog(`${skill.name}! ${healAmount} 회복!`, 'heal');
    } else if (skill.type === 'buff') {
        if (skill.attack) player.attack += skill.attack;
        if (skill.defense) player.defense += skill.defense;
        if (skill.speed) player.speed += skill.speed;
        addBattleLog(`${skill.name} 사용!`, 'skill');
        
        // 버프는 10초 후 제거
        setTimeout(() => {
            if (skill.attack) player.attack -= skill.attack;
            if (skill.defense) player.defense -= skill.defense;
            if (skill.speed) player.speed -= skill.speed;
        }, 10000);
    }
}

// 가장 가까운 적 찾기
function findNearestEnemy() {
    let nearest = null;
    let minDistance = Infinity;
    
    gameState.enemies.forEach(enemy => {
        const distance = getDistance(gameState.player.position, enemy.position);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = enemy;
        }
    });
    
    return nearest;
}

// 거리 계산
function getDistance(pos1, pos2) {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2) +
        Math.pow(pos1.z - pos2.z, 2)
    );
}

// 적 제거
function removeEnemy(enemy) {
    gameState.scene.remove(enemy.mesh);
    gameState.enemies = gameState.enemies.filter(e => e !== enemy);
    
    // 새 몬스터 생성
    setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 20;
        createEnemy(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
    }, 3000);
}

// 레벨 업 체크
function checkLevelUp() {
    const player = gameState.player;
    if (player.exp >= player.expToNext) {
        player.level++;
        player.exp -= player.expToNext;
        player.expToNext = Math.floor(player.expToNext * 1.5);
        
        // 스탯 증가
        player.maxHp += 20;
        player.hp = player.maxHp;
        player.maxMp += 10;
        player.mp = player.maxMp;
        player.attack += 5;
        
        addBattleLog(`레벨 업! 레벨 ${player.level}`, 'heal');
        updateUI();
    }
}

// UI 설정
function setupUI() {
    const player = gameState.player;
    
    // 스킬 이름 설정
    player.class.skills.forEach((skill, index) => {
        document.getElementById(`skill${index + 1}Name`).textContent = skill.name;
        document.getElementById(`skill${index + 1}Icon`).textContent = skill.key;
    });
    
    updateUI();
}

// UI 업데이트
function updateUI() {
    const player = gameState.player;
    
    // HP/MP 바
    const hpPercent = (player.hp / player.maxHp) * 100;
    const mpPercent = (player.mp / player.maxMp) * 100;
    const expPercent = (player.exp / player.expToNext) * 100;
    
    document.getElementById('hpBar').style.width = hpPercent + '%';
    document.getElementById('mpBar').style.width = mpPercent + '%';
    document.getElementById('expBar').style.width = expPercent + '%';
    
    document.getElementById('hpText').textContent = `${Math.floor(player.hp)}/${player.maxHp}`;
    document.getElementById('mpText').textContent = `${Math.floor(player.mp)}/${player.maxMp}`;
    document.getElementById('expText').textContent = `${player.exp}/${player.expToNext}`;
    document.getElementById('levelText').textContent = player.level;
}

// 전투 로그
function addBattleLog(message, type = '') {
    const log = document.getElementById('battleLog');
    const logEntry = document.createElement('div');
    logEntry.className = type;
    logEntry.textContent = message;
    log.appendChild(logEntry);
    
    // UI 표시
    document.getElementById('battleUI').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('battleUI').classList.add('hidden');
    }, 2000);
    
    // 로그 제한
    if (log.children.length > 5) {
        log.removeChild(log.firstChild);
    }
}

// 인벤토리 토글
function toggleInventory() {
    const inventory = document.getElementById('inventory');
    inventory.classList.toggle('hidden');
}

// 카메라 업데이트 (숄더뷰)
function updateCamera() {
    const player = gameState.player;
    const camera = gameState.camera;
    
    // 숄더뷰 설정: 플레이어 뒤 어깨 높이에서 약간 옆에 위치
    const shoulderOffset = 1.5;  // 어깨 옆 오프셋
    const cameraHeight = 1.8;    // 어깨 높이
    const cameraDistance = gameState.cameraDistance;  // 스크롤로 조절 가능한 거리
    
    // 플레이어의 회전 각도에 따라 카메라 위치 계산
    const angle = gameState.mouseX;
    const offsetX = Math.sin(angle) * shoulderOffset;
    const offsetZ = Math.cos(angle) * shoulderOffset;
    const backX = Math.sin(angle + Math.PI) * cameraDistance;
    const backZ = Math.cos(angle + Math.PI) * cameraDistance;
    
    // 카메라 위치: 플레이어 뒤 + 어깨 옆
    camera.position.x = player.position.x + offsetX + backX;
    camera.position.z = player.position.z + offsetZ + backZ;
    camera.position.y = player.position.y + cameraHeight + Math.sin(gameState.mouseY) * 2;
    
    // 카메라가 플레이어를 바라보도록 설정
    const lookAtX = player.position.x + Math.sin(angle) * 0.5;
    const lookAtZ = player.position.z + Math.cos(angle) * 0.5;
    camera.lookAt(lookAtX, player.position.y + 1.5, lookAtZ);
}

// 플레이어 이동
function updatePlayer(deltaTime) {
    const player = gameState.player;
    
    // 중력
    player.velocity.y -= 20 * deltaTime;
    
    // 마나 자동 회복 (2초마다 최대 마나의 5% 회복)
    player.mpRegenTimer += deltaTime;
    if (player.mpRegenTimer >= 2.0 && player.mp < player.maxMp) {
        const mpRegen = Math.max(1, Math.floor(player.maxMp * 0.05));
        player.mp = Math.min(player.maxMp, player.mp + mpRegen);
        player.mpRegenTimer = 0;
    }
    
    // 대시 기능: Shift+W로 빠른 이동
    const isRunning = gameState.shiftPressed && gameState.isMoving.forward;
    player.isRunning = isRunning;
    const speedMultiplier = isRunning ? 2.0 : 1.0;  // 대시 시 2배 속도
    
    // 이동 (W: 앞, S: 뒤, A: 왼쪽, D: 오른쪽 - 플레이어가 바라보는 방향 기준)
    const moveSpeed = player.speed * speedMultiplier * deltaTime;
    const moveDirection = new THREE.Vector3();
    
    // 플레이어의 회전 각도 기준으로 이동 방향 계산
    const angle = gameState.mouseX;
    
    if (gameState.isMoving.forward) {
        // 앞으로 (플레이어가 바라보는 방향)
        moveDirection.x += Math.sin(angle);
        moveDirection.z += Math.cos(angle);
    }
    if (gameState.isMoving.backward) {
        // 뒤로
        moveDirection.x -= Math.sin(angle);
        moveDirection.z -= Math.cos(angle);
    }
    if (gameState.isMoving.left) {
        // 왼쪽으로
        moveDirection.x += Math.cos(angle);
        moveDirection.z -= Math.sin(angle);
    }
    if (gameState.isMoving.right) {
        // 오른쪽으로
        moveDirection.x -= Math.cos(angle);
        moveDirection.z += Math.sin(angle);
    }
    
    moveDirection.normalize();
    moveDirection.multiplyScalar(moveSpeed);
    
    player.position.x += moveDirection.x;
    player.position.z += moveDirection.z;
    player.position.y += player.velocity.y * deltaTime;
    
    // 바닥 체크 (지형 높이 고려)
    const groundHeight = 2; // 지형의 평균 높이
    if (player.position.y <= groundHeight) {
        player.position.y = groundHeight;
        player.velocity.y = 0;
        player.canJump = true;
    }
    
    player.mesh.position.copy(player.position);
    player.mesh.rotation.y = gameState.mouseX + Math.PI;
    
    // 이동 애니메이션 (걸을 때 팔/다리 흔들기)
    animatePlayerBody(deltaTime);
}

// 플레이어 신체 애니메이션
function animatePlayerBody(deltaTime) {
    const player = gameState.player;
    if (!player.bodyParts) return;
    
    // 스킬 애니메이션 중이면 이동 애니메이션 무시
    if (player.isAnimating) return;
    
    const isMoving = gameState.isMoving.forward || gameState.isMoving.backward || 
                     gameState.isMoving.left || gameState.isMoving.right;
    
    if (isMoving) {
        const speed = player.isRunning ? 2 : 1;
        const time = Date.now() * 0.008 * speed;  // 애니메이션 속도 증가
        
        // 걷기/뛰기 모션 (더 자연스러운 보행 애니메이션)
        const walkCycle = Math.sin(time);
        const walkCycle2 = Math.sin(time + Math.PI);  // 반대 위상
        
        // 팔 흔들기 (상단/하단 팔) - 걷기 모션
        if (player.bodyParts.leftUpperArm) {
            // 왼팔과 오른팔이 반대 방향으로 움직임
            player.bodyParts.leftUpperArm.rotation.z = walkCycle * 0.8;
            player.bodyParts.leftUpperArm.rotation.x = walkCycle * 0.3;
            player.bodyParts.rightUpperArm.rotation.z = -walkCycle * 0.8;
            player.bodyParts.rightUpperArm.rotation.x = -walkCycle * 0.3;
            
            // 팔꿈치 구부리기
            player.bodyParts.leftLowerArm.rotation.x = Math.max(0, walkCycle) * 0.5;
            player.bodyParts.rightLowerArm.rotation.x = Math.max(0, -walkCycle) * 0.5;
        }
        
        // 다리 흔들기 (상단/하단 다리) - 걷기 모션
        if (player.bodyParts.leftUpperLeg) {
            // 다리를 앞뒤로 움직임
            player.bodyParts.leftUpperLeg.rotation.x = walkCycle * 0.6;
            player.bodyParts.rightUpperLeg.rotation.x = -walkCycle * 0.6;
            
            // 무릎 구부리기
            player.bodyParts.leftLowerLeg.rotation.x = Math.max(0, walkCycle) * 0.8;
            player.bodyParts.rightLowerLeg.rotation.x = Math.max(0, -walkCycle) * 0.8;
            
            // 발 위치 조정 (발을 들어올리는 효과)
            if (player.bodyParts.leftFoot && player.bodyParts.rightFoot) {
                const originalFootY = -0.75; // 원래 foot y 위치
                player.bodyParts.leftFoot.position.y = originalFootY + Math.max(0, walkCycle) * 0.15;
                player.bodyParts.rightFoot.position.y = originalFootY + Math.max(0, -walkCycle) * 0.15;
            }
        }
        
        // 몸통 약간 위아래로 (걷기 리듬) - 상대 위치
        if (player.bodyParts.torso) {
            const originalTorsoY = 0.7; // 원래 torso y 위치
            player.bodyParts.torso.position.y = originalTorsoY + Math.abs(walkCycle) * 0.05;
            player.bodyParts.torso.rotation.x = Math.sin(time * 0.5) * 0.05;
        }
        
        // 머리도 약간 흔들림 - 상대 위치
        if (player.bodyParts.head) {
            const originalHeadY = 1.6; // 원래 head y 위치
            player.bodyParts.head.rotation.x = Math.sin(time * 0.5) * 0.03;
            player.bodyParts.head.position.y = originalHeadY + Math.abs(walkCycle) * 0.02;
        }
        
        // 대시 시 더 빠른 모션
        if (player.isRunning) {
            if (player.bodyParts.torso) {
                player.bodyParts.torso.rotation.x = -0.2;  // 앞으로 기울임
            }
        }
    } else {
        // 정지 상태로 복귀
        if (player.bodyParts.leftUpperArm) {
            player.bodyParts.leftUpperArm.rotation.x = 0;
            player.bodyParts.leftUpperArm.rotation.z = 0;
            player.bodyParts.rightUpperArm.rotation.x = 0;
            player.bodyParts.rightUpperArm.rotation.z = 0;
            player.bodyParts.leftLowerArm.rotation.x = 0;
            player.bodyParts.rightLowerArm.rotation.x = 0;
        }
        if (player.bodyParts.leftUpperLeg) {
            player.bodyParts.leftUpperLeg.rotation.x = 0;
            player.bodyParts.rightUpperLeg.rotation.x = 0;
            player.bodyParts.leftLowerLeg.rotation.x = 0;
            player.bodyParts.rightLowerLeg.rotation.x = 0;
        }
        if (player.bodyParts.torso) {
            player.bodyParts.torso.rotation.x = 0;
            player.bodyParts.torso.position.y = 0.7; // 원래 위치로 복귀
        }
        if (player.bodyParts.head) {
            player.bodyParts.head.rotation.x = 0;
            player.bodyParts.head.position.y = 1.6; // 원래 위치로 복귀
        }
        if (player.bodyParts.leftFoot && player.bodyParts.rightFoot) {
            player.bodyParts.leftFoot.position.y = -0.75; // 원래 위치로 복귀
            player.bodyParts.rightFoot.position.y = -0.75; // 원래 위치로 복귀
        }
    }
}

// 스킬 애니메이션 재생
function playSkillAnimation(animationType) {
    const player = gameState.player;
    if (!player.bodyParts) return;
    
    player.isAnimating = true;
    const duration = 500; // 0.5초 애니메이션
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        switch(animationType) {
            case 'attack':
            case 'slash':
                // 공격 동작: 팔을 앞으로 휘두르기
                if (player.bodyParts.rightUpperArm) {
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.5;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.leftUpperArm.rotation.x = Math.sin(progress * Math.PI) * 0.3;
                    player.bodyParts.torso.rotation.x = Math.sin(progress * Math.PI) * 0.2;
                }
                break;
                
            case 'combo':
                // 연속 타격: 빠른 공격 동작
                if (player.bodyParts.rightUpperArm) {
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI * 3) * 1.2;
                    player.bodyParts.leftUpperArm.rotation.x = Math.sin(progress * Math.PI * 3) * 1.2;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI * 3) * 0.8;
                    player.bodyParts.leftLowerArm.rotation.x = Math.sin(progress * Math.PI * 3) * 0.8;
                }
                break;
                
            case 'critical':
                // 치명타: 강한 공격 동작
                if (player.bodyParts.rightUpperArm) {
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 2.0;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 1.5;
                    player.bodyParts.torso.rotation.x = Math.sin(progress * Math.PI) * 0.3;
                    player.bodyParts.leftUpperLeg.rotation.x = -Math.sin(progress * Math.PI) * 0.2;
                }
                break;
                
            case 'charge':
                // 돌진: 앞으로 몸 기울이기
                if (player.bodyParts.torso) {
                    player.bodyParts.torso.rotation.x = -Math.sin(progress * Math.PI) * 0.4;
                    player.bodyParts.leftUpperArm.rotation.x = Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.rightUpperArm.rotation.x = Math.sin(progress * Math.PI) * 0.8;
                }
                break;
                
            case 'defend':
                // 방어 태세: 팔을 앞으로 올리기
                if (player.bodyParts.leftUpperArm) {
                    player.bodyParts.leftUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.leftLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.torso.rotation.x = -Math.sin(progress * Math.PI) * 0.1;
                }
                break;
                
            case 'cast':
                // 마법 시전: 팔을 위로 올리기
                if (player.bodyParts.leftUpperArm) {
                    player.bodyParts.leftUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.2;
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.2;
                    player.bodyParts.leftLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.head.rotation.x = Math.sin(progress * Math.PI) * 0.2;
                }
                break;
                
            case 'heal':
                // 힐: 팔을 앞으로 뻗기
                if (player.bodyParts.leftUpperArm) {
                    player.bodyParts.leftUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.leftLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.6;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.6;
                    player.bodyParts.torso.rotation.x = Math.sin(progress * Math.PI) * 0.1;
                }
                break;
                
            case 'buff':
                // 버프: 팔을 위로 올리기
                if (player.bodyParts.leftUpperArm) {
                    player.bodyParts.leftUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.rightUpperArm.rotation.x = -Math.sin(progress * Math.PI) * 1.0;
                    player.bodyParts.leftLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                    player.bodyParts.rightLowerArm.rotation.x = -Math.sin(progress * Math.PI) * 0.8;
                }
                break;
                
            case 'stealth':
                // 은신: 몸을 낮추기
                if (player.bodyParts.torso) {
                    player.bodyParts.torso.rotation.x = Math.sin(progress * Math.PI) * 0.3;
                    player.bodyParts.leftUpperLeg.rotation.x = Math.sin(progress * Math.PI) * 0.5;
                    player.bodyParts.rightUpperLeg.rotation.x = Math.sin(progress * Math.PI) * 0.5;
                }
                break;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 애니메이션 종료 후 원래 상태로 복귀
            if (player.bodyParts.leftUpperArm) {
                player.bodyParts.leftUpperArm.rotation.x = 0;
                player.bodyParts.rightUpperArm.rotation.x = 0;
                player.bodyParts.leftLowerArm.rotation.x = 0;
                player.bodyParts.rightLowerArm.rotation.x = 0;
            }
            if (player.bodyParts.leftUpperLeg) {
                player.bodyParts.leftUpperLeg.rotation.x = 0;
                player.bodyParts.rightUpperLeg.rotation.x = 0;
                player.bodyParts.leftLowerLeg.rotation.x = 0;
                player.bodyParts.rightLowerLeg.rotation.x = 0;
            }
            if (player.bodyParts.torso) {
                player.bodyParts.torso.rotation.x = 0;
            }
            if (player.bodyParts.head) {
                player.bodyParts.head.rotation.x = 0;
            }
            player.isAnimating = false;
        }
    };
    
    animate();
}

// 적 업데이트
function updateEnemies(deltaTime) {
    const player = gameState.player;
    
    gameState.enemies.forEach(enemy => {
        const distance = getDistance(player.position, enemy.position);
        
        if (distance < 15) {
            // 추적
            const direction = new THREE.Vector3();
            direction.subVectors(player.position, enemy.position);
            direction.normalize();
            direction.multiplyScalar(3 * deltaTime);
            
            enemy.position.add(direction);
            enemy.position.y = 2.75; // 지형 높이에 맞춤
            enemy.mesh.position.copy(enemy.position);
            
            // 플레이어를 바라보도록 회전
            const angle = Math.atan2(
                player.position.x - enemy.position.x,
                player.position.z - enemy.position.z
            );
            enemy.mesh.rotation.y = angle;
            
            // 공격
            if (distance < 2 && enemy.attackCooldown <= 0) {
                const damage = Math.max(1, enemy.attack - player.defense);
                player.hp -= damage;
                addBattleLog(`몬스터 공격! ${damage} 데미지!`, 'damage');
                enemy.attackCooldown = 2;
                
                if (player.hp <= 0) {
                    gameOver();
                }
            }
        }
        
        enemy.attackCooldown -= deltaTime;
    });
}

// 캐릭터 선택 화면으로 돌아가기
function returnToClassSelection() {
    // 게임 상태 초기화
    if (gameState.player && gameState.player.mesh) {
        gameState.scene.remove(gameState.player.mesh);
    }
    gameState.enemies.forEach(enemy => {
        if (enemy.mesh) {
            gameState.scene.remove(enemy.mesh);
        }
    });
    gameState.enemies = [];
    gameState.player = null;
    
    // 포인터 잠금 해제
    if (document.pointerLockElement) {
        document.exitPointerLock();
    }
    
    // 화면 전환
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('classSelection').classList.add('active');
}

// 게임 오버
function gameOver() {
    alert('게임 오버!');
    location.reload();
}

// 애니메이션 루프
let lastTime = 0;
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    if (gameState.player) {
        updatePlayer(deltaTime);
        updateEnemies(deltaTime);
        updateCamera();
        updateUI();
    }
    
    gameState.renderer.render(gameState.scene, gameState.camera);
}


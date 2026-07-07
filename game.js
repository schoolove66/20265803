// ==========================================
// game.js - Game logic & graphics engine
// ==========================================

// --- Web Audio API Synth Engine ---
class AudioManager {
    constructor() {
        this.ctx = null;
        this.bgmInterval = null;
        this.isBgmActive = true;
        this.isSfxActive = true;
        this.bgmSequenceIndex = 0;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSFX(type) {
        if (!this.isSfxActive || !this.ctx) return;
        this.init();
        
        const now = this.ctx.currentTime;
        
        if (type === 'drag') {
            // 부드러운 드래그 시작 팝 사운드
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } 
        else if (type === 'tick') {
            // 게이지 슬라이더 째깍 소리
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            
            osc.start(now);
            osc.stop(now + 0.03);
        }
        else if (type === 'laser') {
            // 치료 레이저 작동 SFX (주파수 스윕)
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(150, now);
            osc2.frequency.exponentialRampToValueAtTime(600, now + 0.4);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            
            osc.start(now);
            osc2.start(now);
            osc.stop(now + 0.4);
            osc2.stop(now + 0.4);
        }
        else if (type === 'laser_fail') {
            // 타이밍 실패 SFX (낮고 힘빠지는 부저)
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.3);
            
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            
            osc.start(now);
            osc.stop(now + 0.3);
        }
        else if (type === 'correct') {
            // 정답 딩동댕 실로폰 사운드
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                
                gain.gain.setValueAtTime(0, now + idx * 0.1);
                gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.35);
                
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.4);
            });
        }
        else if (type === 'incorrect') {
            // 오답 땡 사운드
            const notes = [293.66, 277.18]; // D4, C#4
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                
                gain.gain.setValueAtTime(0.15, now + idx * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.3);
                
                osc.start(now + idx * 0.15);
                osc.stop(now + idx * 0.15 + 0.35);
            });
        }
        else if (type === 'victory') {
            // 승리 트럼펫 팡파레
            const trumpet = [523.25, 523.25, 523.25, 523.25, 659.25, 783.99, 1046.50];
            const durations = [0.15, 0.15, 0.15, 0.3, 0.3, 0.3, 0.8];
            let accumTime = 0;
            
            trumpet.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + accumTime);
                
                gain.gain.setValueAtTime(0.15, now + accumTime);
                gain.gain.exponentialRampToValueAtTime(0.01, now + accumTime + durations[idx]);
                
                osc.start(now + accumTime);
                osc.stop(now + accumTime + durations[idx]);
                accumTime += durations[idx] - 0.05;
            });
        }
        else if (type === 'gameover') {
            // 게임오버 멜로디
            const notes = [392.00, 349.23, 311.13, 246.94]; // G4, F4, D#4, B3
            let accumTime = 0;
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + accumTime);
                
                gain.gain.setValueAtTime(0.18, now + accumTime);
                gain.gain.exponentialRampToValueAtTime(0.01, now + accumTime + 0.4);
                
                osc.start(now + accumTime);
                osc.stop(now + accumTime + 0.45);
                accumTime += 0.3;
            });
        }
    }

    startBGM() {
        if (this.bgmInterval) return;
        this.init();
        
        // 4개의 코드 진행을 순환하는 아르페지오 배경 음악 재생
        const chords = [
            [261.63, 329.63, 392.00, 523.25], // C Major: C4, E4, G4, C5
            [349.23, 440.00, 523.25, 698.46], // F Major: F4, A4, C5, F5
            [392.00, 493.88, 587.33, 783.99], // G Major: G4, B4, D5, G5
            [261.63, 329.63, 392.00, 523.25]  // C Major
        ];
        
        let step = 0;
        this.bgmInterval = setInterval(() => {
            if (!this.isBgmActive || !this.ctx) return;
            
            const currentChord = chords[Math.floor(step / 4) % chords.length];
            const noteFreq = currentChord[step % currentChord.length];
            
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(noteFreq, now);
            
            // 메인 멜로디는 작고 부드럽게
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 0.45);
            
            step++;
        }, 500);
    }

    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
}

const audio = new AudioManager();

// --- SVG 리소스 생성기 ---
const SVGFactory = {
    getDoctorAssistant() {
        return `
        <svg viewBox="0 0 100 100" width="70" height="90">
            <circle cx="50" cy="30" r="18" fill="#FFE0B2"/>
            <!-- 모자 -->
            <path d="M 32 20 Q 50 5 68 20" stroke="#00BFA5" stroke-width="6" fill="none"/>
            <path d="M 45 15 L 55 15 M 50 10 L 50 20" stroke="#FF4081" stroke-width="2.5"/>
            <!-- 눈과 미소 -->
            <circle cx="43" cy="28" r="2" fill="#37474F"/>
            <circle cx="57" cy="28" r="2" fill="#37474F"/>
            <path d="M 45 36 Q 50 40 55 36" stroke="#37474F" stroke-width="1.5" fill="none"/>
            <!-- 머리 -->
            <path d="M 32 30 Q 50 12 68 30 Q 72 25 50 12 Q 28 25 32 30" fill="#3E2723"/>
            <!-- 몸통 (간호사 복장) -->
            <path d="M 35 48 L 65 48 L 70 95 L 30 95 Z" fill="#E0F2F1"/>
            <path d="M 42 48 L 50 62 L 58 48" fill="#00BFA5"/>
            <!-- 손과 차트 -->
            <path d="M 28 55 Q 15 65 30 75" fill="none" stroke="#FFE0B2" stroke-width="6" stroke-linecap="round"/>
            <rect x="25" y="60" width="18" height="22" rx="2" fill="#FFECB3" stroke="#BCAAA4" stroke-width="2"/>
            <line x1="29" y1="66" x2="39" y2="66" stroke="#3E2723" stroke-width="1.5"/>
            <line x1="29" y1="71" x2="39" y2="71" stroke="#3E2723" stroke-width="1.5"/>
            <line x1="29" y1="76" x2="35" y2="76" stroke="#3E2723" stroke-width="1.5"/>
        </svg>`;
    },

    getNurseLeft() {
        return `
        <svg viewBox="0 0 100 100" width="48" height="60">
            <circle cx="50" cy="30" r="16" fill="#FFE0B2"/>
            <circle cx="44" cy="28" r="1.8" fill="#263238"/>
            <circle cx="56" cy="28" r="1.8" fill="#263238"/>
            <path d="M 46 34 Q 50 37 54 34" stroke="#263238" stroke-width="1.5" fill="none"/>
            <!-- 단발 머리 -->
            <path d="M 34 25 Q 50 10 66 25 L 68 40 Q 64 35 50 35 Q 36 35 32 40 Z" fill="#F48FB1"/>
            <!-- 옷 -->
            <path d="M 35 46 L 65 46 L 68 90 L 32 90 Z" fill="#B2DFDB"/>
            <path d="M 50 46 L 50 90" stroke="#00BFA5" stroke-width="2"/>
            <rect x="36" y="55" width="8" height="8" rx="1" fill="#E0F2F1"/>
            <!-- 약 가방 -->
            <rect x="58" y="58" width="16" height="14" rx="2" fill="#FF8A80"/>
            <path d="M 62 58 L 62 54 L 70 54 L 70 58" fill="none" stroke="#FF5252" stroke-width="2"/>
        </svg>`;
    },

    getNurseRight() {
        return `
        <svg viewBox="0 0 100 100" width="48" height="60">
            <circle cx="50" cy="30" r="16" fill="#FFE0B2"/>
            <circle cx="44" cy="28" r="1.8" fill="#263238"/>
            <circle cx="56" cy="28" r="1.8" fill="#263238"/>
            <path d="M 46 34 Q 50 37 54 34" stroke="#263238" stroke-width="1.5" fill="none"/>
            <!-- 머리 -->
            <path d="M 34 26 Q 50 11 66 26 Q 70 20 50 8 Q 30 20 34 26" fill="#37474F"/>
            <!-- 양갈래 머리 -->
            <circle cx="28" cy="35" r="7" fill="#37474F"/>
            <circle cx="72" cy="35" r="7" fill="#37474F"/>
            <!-- 옷 -->
            <path d="M 35 46 L 65 46 L 68 90 L 32 90 Z" fill="#F8BBD0"/>
            <!-- 링거 물통 -->
            <path d="M 22 45 L 22 90 M 12 50 L 32 50" stroke="#78909C" stroke-width="3"/>
            <rect x="15" y="54" width="14" height="20" rx="3" fill="rgba(255,255,255,0.7)" stroke="#4FC3F7" stroke-width="2"/>
            <path d="M 22 74 Q 22 84 32 84" fill="none" stroke="#E1F5FE" stroke-width="1.5"/>
        </svg>`;
    },

    // 환자 아바타 SVG 생성 (상태: 'pain' - 아픔, 'healing' - 레이저 치료 중, 'cured' - 완치 싱글벙글)
    getPatientSVG(id, state = 'pain') {
        let expression = ''; // 표정
        let aura = ''; // 아픈 부위 분위기 스파크
        let skinColor = '#FFE0B2';
        let bodyColor = '#E0F7FA'; // 병원복 색상

        if (state === 'pain') {
            expression = `
                <!-- 찡그린 눈 -->
                <path d="M 40 32 L 46 35 M 40 35 L 46 32" stroke="#4E342E" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 60 32 L 54 35 M 60 35 L 54 32" stroke="#4E342E" stroke-width="2.5" stroke-linecap="round"/>
                <!-- 찡그린 눈썹 -->
                <path d="M 38 27 Q 44 29 48 24 M 62 27 Q 56 29 52 24" fill="none" stroke="#4E342E" stroke-width="2"/>
                <!-- 입: 어구구.. -->
                <path d="M 45 44 Q 50 38 55 44" stroke="#4E342E" stroke-width="2.5" fill="none"/>
                <!-- 볼 터치 (창백함/식은땀) -->
                <ellipse cx="38" cy="40" rx="4" ry="2.5" fill="#B2DFDB" opacity="0.6"/>
                <ellipse cx="62" cy="40" rx="4" ry="2.5" fill="#B2DFDB" opacity="0.6"/>
                <path d="M 32 20 Q 30 25 33 28" fill="none" stroke="#4FC3F7" stroke-width="1.5"/> <!-- 식은땀 -->
            `;
            // 아픈 스파크 오라
            aura = `<circle cx="50" cy="50" r="45" stroke="#FF1744" stroke-width="2.5" stroke-dasharray="4,4" fill="none" class="pain-glow-ring"/>`;
        } else if (state === 'healing') {
            expression = `
                <!-- 질끈 감은 눈 -->
                <path d="M 38 34 Q 44 31 46 35 M 62 34 Q 56 31 54 35" fill="none" stroke="#4E342E" stroke-width="2.5" stroke-linecap="round"/>
                <!-- 입: 흡! 참는 중 -->
                <line x1="45" y1="41" x2="55" y2="41" stroke="#4E342E" stroke-width="3" stroke-linecap="round"/>
                <ellipse cx="38" cy="40" rx="5" ry="4" fill="#FF8A80" opacity="0.8"/>
                <ellipse cx="62" cy="40" rx="5" ry="4" fill="#FF8A80" opacity="0.8"/>
            `;
            // 에너지 충전 오라
            aura = `<circle cx="50" cy="50" r="46" stroke="#00E5FF" stroke-width="4" stroke-dasharray="10,5" fill="none" style="animation: rotate-laser 2s linear infinite;"/>`;
        } else if (state === 'cured') {
            expression = `
                <!-- 웃는 반달 눈 -->
                <path d="M 38 32 Q 44 26 46 34 M 62 32 Q 56 26 54 34" fill="none" stroke="#263238" stroke-width="3" stroke-linecap="round"/>
                <!-- 신나는 넓은 입 -->
                <path d="M 42 40 Q 50 48 58 40 Z" fill="#D81B60"/>
                <!-- 발그레 볼 터치 -->
                <ellipse cx="36" cy="40" rx="6" ry="5" fill="#FF4081" opacity="0.5"/>
                <ellipse cx="64" cy="40" rx="6" ry="5" fill="#FF4081" opacity="0.5"/>
            `;
            // 별가루 반짝임 오라
            aura = `
                <circle cx="50" cy="50" r="45" stroke="#4CAF50" stroke-width="2" stroke-dasharray="1,8" fill="none"/>
                <text x="12" y="24" font-size="12">✨</text>
                <text x="76" y="24" font-size="12">✨</text>
                <text x="20" y="80" font-size="12">❤️</text>
                <text x="74" y="80" font-size="12">❤️</text>
            `;
        }

        // 환자별 고유 커스터마이징 데코
        let hairAndProps = '';
        if (id === 1) { // 민우: 말썽쟁이 소년, 붕대 이마
            hairAndProps = `
                <!-- 부스스한 갈색 머리 -->
                <path d="M 30 26 Q 50 8 70 26 L 73 34 Q 50 20 27 34 Z" fill="#5D4037"/>
                <rect x="36" y="22" width="28" height="7" rx="2" fill="#ECEFF1" stroke="#CFD8DC" stroke-width="1" transform="rotate(-5, 50, 25)"/>
            `;
        } else if (id === 2) { // 지혜: 수줍은 단발 소녀
            hairAndProps = `
                <!-- 검은 생머리 단발 -->
                <path d="M 28 28 Q 50 8 72 28 L 74 46 Q 66 40 50 40 Q 34 40 26 46 Z" fill="#212121"/>
                <circle cx="34" cy="24" r="4" fill="#FF80AB"/> <!-- 귀여운 머리핀 -->
            `;
        } else if (id === 3) { // 철수: 힘든 표정, 머리에 아이스팩
            hairAndProps = `
                <!-- 주황색 짧은 머리 -->
                <path d="M 30 28 Q 50 10 70 28 L 72 32 Q 50 22 28 32 Z" fill="#E65100"/>
                <!-- 아이스팩 주머니 -->
                <ellipse cx="50" cy="12" rx="15" ry="8" fill="#90CAF9"/>
                <rect x="47" y="4" width="6" height="5" fill="#1565C0"/>
            `;
        } else if (id === 4) { // 영희: 노란 양갈래 땋은 머리
            hairAndProps = `
                <!-- 노란 머리 -->
                <path d="M 32 28 Q 50 12 68 28 Z" fill="#FBC02D"/>
                <path d="M 28 35 Q 18 42 22 50 Q 28 42 32 35 Z" fill="#FBC02D"/> <!-- 양갈래 좌 -->
                <path d="M 72 35 Q 82 42 78 50 Q 72 42 68 35 Z" fill="#FBC02D"/> <!-- 양갈래 우 -->
            `;
        } else if (id === 5) { // 준서: 만성피로, 안경잽이
            hairAndProps = `
                <!-- 삐죽 초록/갈색 머리 -->
                <path d="M 28 28 Q 50 6 72 28 L 74 34 Q 50 20 26 34 Z" fill="#37474F"/>
                <!-- 처진 눈가 다크서클 -->
                <path d="M 32 37 Q 40 45 46 37" stroke="#90A4AE" stroke-width="3" fill="none" opacity="0.8"/>
                <path d="M 54 37 Q 60 45 68 37" stroke="#90A4AE" stroke-width="3" fill="none" opacity="0.8"/>
            `;
        }

        // 환자의 누운 자세 몸통 그래픽
        let patientBody = `
            <!-- 몸뚱아리 환자복 -->
            <path d="M 25 78 L 75 78 L 85 100 L 15 100 Z" fill="${bodyColor}" stroke="#B2DFDB" stroke-width="2"/>
            <!-- 환자복 깃 단추 -->
            <line x1="50" y1="78" x2="50" y2="100" stroke="#00BFA5" stroke-width="2"/>
            <circle cx="50" cy="86" r="2.5" fill="#008B7A"/>
            <circle cx="50" cy="94" r="2.5" fill="#008B7A"/>
        `;

        // 깁스 등의 특수 붕대 효과 (환자별 증상 데코)
        if (state !== 'cured') {
            if (id === 1) { // 발목 골절/삠 깁스 표시
                patientBody += `<rect x="18" y="85" width="14" height="15" rx="2" fill="#ECEFF1" stroke="#CFD8DC" stroke-width="1.5" transform="rotate(-15, 25, 92)"/>`;
            } else if (id === 3) { // 팔 깁스
                patientBody += `<path d="M 68 84 L 84 94" stroke="#ECEFF1" stroke-width="12" stroke-linecap="round" fill="none"/>
                                <path d="M 68 84 L 84 94" stroke="#FF5252" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="2,4"/>`;
            }
        }

        return `
        <svg viewBox="0 0 100 100" width="220" height="220">
            ${aura}
            <!-- 귀와 목 -->
            <circle cx="28" cy="36" r="4.5" fill="#FDD835" opacity="0.2"/> <!-- 뒤그림자 -->
            <rect x="45" y="44" width="10" height="12" fill="#F5C293"/>
            <circle cx="31" cy="36" r="5" fill="${skinColor}"/> <!-- 좌 귀 -->
            <circle cx="69" cy="36" r="5" fill="${skinColor}"/> <!-- 우 귀 -->
            
            <!-- 머리통 기본 -->
            <circle cx="50" cy="34" r="21" fill="${skinColor}"/>
            
            ${hairAndProps}
            ${expression}
            ${patientBody}
        </svg>`;
    },

    // X-ray 스크린에 띄울 인체 골격/근육 SVG
    getXraySVG(id, isCured = false) {
        let glowColor = isCured ? "#00E676" : "#FF1744"; // 성공 시 초록, 대기 시 빨강
        let painStyle = isCured ? "" : "class='pain-glow'";

        // 기본 뼈대 라인
        let ribs = `
            <!-- 갈비뼈 -->
            <path d="M 42 42 Q 50 44 58 42 M 40 47 Q 50 49 60 47 M 42 52 Q 50 54 58 52" stroke="#ECEFF1" stroke-width="2" fill="none"/>
        `;
        let spine = `
            <!-- 척추뼈 -->
            <line x1="50" y1="36" x2="50" y2="70" stroke="#ECEFF1" stroke-width="4"/>
        `;
        let skull = `
            <!-- 해골 머리 -->
            <path d="M 40 26 Q 50 12 60 26 Q 62 34 50 34 Q 38 34 40 26 Z" fill="#ECEFF1"/>
            <circle cx="45" cy="25" r="3.5" fill="#001015"/> <!-- 눈구멍 -->
            <circle cx="55" cy="25" r="3.5" fill="#001015"/>
            <path d="M 48 30 L 50 28 L 52 30 Z" fill="#001015"/> <!-- 코구멍 -->
            <path d="M 44 32 L 56 32" stroke="#001015" stroke-width="1.5"/> <!-- 입술선 -->
        `;
        let shoulders = `
            <!-- 빗장뼈 및 어깨라인 -->
            <path d="M 30 38 L 70 38" stroke="#ECEFF1" stroke-width="3" stroke-linecap="round"/>
        `;

        if (id === 1) { // 발목 골절/삠 X-ray
            return `
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <!-- 발목 및 발가락 뼈대 구조 -->
                <rect x="0" y="0" width="100" height="100" fill="none"/>
                <!-- 정강이 뼈 -->
                <line x1="50" y1="10" x2="50" y2="60" stroke="#ECEFF1" stroke-width="5" stroke-linecap="round"/>
                <line x1="42" y1="10" x2="42" y2="58" stroke="#ECEFF1" stroke-width="2.5" stroke-linecap="round"/>
                
                <!-- 복사뼈 관절 (통증 중심부) -->
                <circle cx="50" cy="62" r="7.5" fill="#ECEFF1" ${painStyle}/>
                
                <!-- 발 뼈대 -->
                <path d="M 50 62 Q 54 82 78 82" stroke="#ECEFF1" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <path d="M 72 82 L 85 82 M 72 86 L 82 86" stroke="#ECEFF1" stroke-width="2.5" stroke-linecap="round"/>
                
                <!-- 부상 부위 붉은 아지랑이/스파크 (오열 표시) -->
                ${isCured ? '' : `
                <path d="M 35 62 Q 50 50 65 62 Q 50 74 35 62 Z" fill="rgba(255, 23, 68, 0.25)" class="pain-glow-ring"/>
                <text x="25" y="52" fill="${glowColor}" font-size="8" font-weight="bold">삐끗!</text>
                <text x="65" y="70" fill="${glowColor}" font-size="8" font-weight="bold">통증</text>
                `}
            </svg>`;
        }
        else if (id === 2 || id === 4) { // 근육 약화 / 관절 X-ray (근육 구조 가상 레이아웃)
            let redMuscle = isCured ? '#00E676' : '#FF1744';
            return `
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <!-- 머리 및 몸 전체 윤곽 -->
                <rect x="0" y="0" width="100" height="100" fill="none"/>
                ${skull}
                ${shoulders}
                ${spine}
                ${ribs}
                
                <!-- 허벅지 및 종아리 뼈대 -->
                <line x1="38" y1="70" x2="32" y2="92" stroke="#ECEFF1" stroke-width="3"/>
                <line x1="62" y1="70" x2="68" y2="92" stroke="#ECEFF1" stroke-width="3"/>

                <!-- 허벅지 다리 대퇴근육 (통증/약화 부위) -->
                <path d="M 28 70 Q 38 80 34 90 Q 24 80 28 70 Z" fill="${redMuscle}" opacity="0.65" ${painStyle}/>
                <path d="M 72 70 Q 62 80 66 90 Q 76 80 72 70 Z" fill="${redMuscle}" opacity="0.65" ${painStyle}/>

                ${isCured ? '' : `
                <text x="10" y="80" fill="${glowColor}" font-size="6" font-weight="bold">근육 약화</text>
                <text x="72" y="80" fill="${glowColor}" font-size="6" font-weight="bold">힘없음</text>
                `}
            </svg>`;
        }
        else if (id === 3) { // 팔 골절 (팔뼈 부러진 틈새 표시)
            return `
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="0" y="0" width="100" height="100" fill="none"/>
                <!-- 어깨 관절 -->
                <circle cx="30" cy="30" r="6" fill="#ECEFF1"/>
                
                <!-- 위 팔뼈 (상완골) -->
                <line x1="30" y1="30" x2="45" y2="52" stroke="#ECEFF1" stroke-width="4.5"/>
                <!-- 팔꿈치 관절 -->
                <circle cx="47" cy="55" r="5" fill="#ECEFF1"/>

                <!-- 아래 팔뼈 (요골/척골) 부러진 흔적 표시 -->
                ${isCured ? `
                <!-- 치료 후: 단단히 붙은 뼈 -->
                <line x1="49" y1="57" x2="72" y2="82" stroke="#ECEFF1" stroke-width="4"/>
                ` : `
                <!-- 치료 전: 골절 균열 발생 -->
                <line x1="49" y1="57" x2="59" y2="69" stroke="#ECEFF1" stroke-width="3.8"/>
                <line x1="62" y1="71" x2="72" y2="82" stroke="#ECEFF1" stroke-width="3.8"/>
                <!-- 골절 금 간 부분 번개 모양 빨간 균열 -->
                <path d="M 57 65 L 61 71 L 58 72 L 63 76" stroke="${glowColor}" stroke-width="2.5" fill="none" ${painStyle}/>
                `}

                <!-- 손뼈 -->
                <path d="M 72 82 Q 78 88 88 88" stroke="#ECEFF1" stroke-width="3" stroke-linecap="round" fill="none"/>
                
                ${isCured ? '' : `
                <text x="35" y="78" fill="${glowColor}" font-size="8" font-weight="bold">골절 발생!</text>
                `}
            </svg>`;
        }
        else if (id === 5) { // 거북목/어깨 척추 결림 X-ray
            return `
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <rect x="0" y="0" width="100" height="100" fill="none"/>
                
                <!-- 과장된 C자형 (거북목) 목 뼈 라인 -->
                ${isCured ? `
                <!-- 똑바른 목뼈와 척추뼈 -->
                <path d="M 50 28 Q 50 48 50 78" stroke="#ECEFF1" stroke-width="5" fill="none" stroke-linecap="round"/>
                ` : `
                <!-- 심하게 구부러진 거북목 구조 -->
                <path d="M 50 28 Q 66 42 50 68 L 50 82" stroke="#ECEFF1" stroke-width="5" fill="none" stroke-linecap="round"/>
                <!-- 뭉쳐서 붉어진 어깨 및 뒷목 근육 -->
                <path d="M 54 38 Q 66 48 58 58" stroke="${glowColor}" stroke-width="8" stroke-linecap="round" fill="none" ${painStyle}/>
                `}
                
                ${skull}
                ${shoulders}
                
                ${isCured ? '' : `
                <text x="64" y="48" fill="${glowColor}" font-size="7" font-weight="bold">거북목</text>
                <text x="18" y="54" fill="${glowColor}" font-size="7" font-weight="bold">어깨 뭉침</text>
                `}
            </svg>`;
        }
    }
};

// --- 환자 및 처방 데이터베이스 ---
const patientsData = [
    {
        id: 1,
        name: "민우",
        symptom: "아야! 축구를 하다가 발목을 삐끗해서 걸을 때마다 쑤셔요. 뼈와 인대가 굳은 걸 풀어줘야 할 것 같아요!",
        correctKey: "stretching",
        correctText: "정답입니다! 🧘‍♂️\n스트레칭을 꾸준히 해주면 발목 주변의 굳은 근육과 힘줄(인대)을 유연하게 늘려주어 부상을 예방하고 혈액 순환을 도와 치유 속도를 빠르게 만듭니다.",
        incorrectTexts: {
            salty: "오답입니다! 🍟\n짠 음식을 많이 먹으면 섭취한 소금(나트륨) 성분이 우리 몸속 칼슘을 신장을 통해 소변으로 배출하게 만들어 뼈를 약하게 해요.",
            indoor: "오답입니다! 🏠\n방 안에만 가만히 누워 있으면 뼈에 자극이 가지 않아 인대가 굳고, 실내 조명만으론 비타민 D 합성을 할 수 없어 뼈 건강이 악화돼요.",
            nosleep: "오답입니다! 📱\n잠을 자지 않고 깨어 있으면 몸에 피로 피드가 쌓여 긴장도가 올라가고, 근육 세포와 관절이 쉬지 못해 염증이 심해질 수 있습니다.",
            sweets: "오답입니다! 🍭\n단 과자나 액상과당을 많이 먹으면 당을 분해하는 과정에서 칼슘이 소비되어 뼈가 약해질 우려가 큽니다.",
            posture: "오답입니다! 🥱\n구부정하게 앉아 폰만 보는 자세는 발목뿐만 아니라 척추까지 망가뜨려 관절 통증을 극대화합니다.",
            skipwarmup: "오답입니다! ⚠️\n다친 직후에 준비운동도 없이 격렬하게 움직이거나 과도하게 비틀면 상처 부위가 찢어지는 2차 부상을 초래할 수 있습니다."
        }
    },
    {
        id: 2,
        name: "영희",
        symptom: "다리에 힘이 하나도 없어요. 조금만 걸어도 다리가 후들거리고 쉽게 넘어져요. 뼈와 근육량을 튼튼하게 채워주세요!",
        correctKey: "exercise",
        correctText: "정답입니다! 🏃‍♂️\n규칙적인 근력 운동과 유산소 운동은 뼈에 적당한 물리적 압력을 가해 골밀도를 높여 튼튼하게 만들어 주고, 근육 세포를 성장시켜 관절을 강력하게 지탱해 줍니다.",
        incorrectTexts: {
            salty: "오답입니다! 🍟\n짠 음식은 칼슘을 소변으로 몰아내 뼈의 구멍을 숭숭 뚫리게(골다공증 유발) 하며 근육 운동에 꼭 필요한 영양 공급을 방해합니다.",
            indoor: "오답입니다! 🏠\n햇빛을 보지 못하면 뼈 칼슘 흡수를 돕는 비타민 D가 결핍되며, 사용하지 않는 근육은 빠르게 위축(근손실)되어 다리가 더 힘없어집니다.",
            nosleep: "오답입니다! 📱\n밤샘은 근육 회복에 꼭 필요한 성장 호르몬 분비를 막아 피로물질인 젖산만 몸속에 쌓이게 하고 근섬유 합성을 가로막습니다.",
            sweets: "오답입니다! 🍭\n설탕은 몸을 산성화시켜 뼈 속 유익한 무기질을 녹여내 뼈와 근육의 기력을 낮춥니다.",
            posture: "오답입니다! 🥱\n구부정하게 스마트폰을 하면 척추 골반 균형이 비틀어지며 다리로 가야 할 체중 하중 배분이 깨져 다리 통증이 더 심해집니다.",
            skipwarmup: "오답입니다! ⚠️\n준비운동 없이 갑자기 근력 운동을 시작하면 차가운 고무줄을 늘리듯 근섬유가 쉽게 파열될 수 있습니다."
        }
    },
    {
        id: 3,
        name: "철수",
        symptom: "아이쿠! 친구와 놀다 넘어져서 팔뼈에 금이 갔어요. 뼈세포가 빨리 다시 살아나고 손상된 부위가 아물도록 푹 쉬고 싶어요.",
        correctKey: "sleep",
        correctText: "정답입니다! 😴\n우리가 깊은 잠(서파 수면)에 빠져 있을 때 뇌하수체에서 성장호르몬이 듬뿍 분비됩니다. 이 호르몬은 뼈를 이루는 뼈아세포와 근육 단백질의 합성을 가장 촉진하여 상처를 치료해 줍니다.",
        incorrectTexts: {
            salty: "오답입니다! 🍟\n짠 음식 속 과다한 나트륨은 칼슘의 체내 흡수를 원천 봉쇄하여 부러진 팔뼈가 단단히 결합하는 데 엄청난 방해를 줍니다.",
            indoor: "오답입니다! 🏠\n실외에서 조금이라도 햇볕을 쬐며 산책해야 뼈 결합에 중요한 역할을 하는 천연 비타민 D가 피부 밑에서 생성됩니다. 가만히 실내에만 있으면 뼈 회복이 더딥니다.",
            nosleep: "오답입니다! 📱\n밤늦게 스마트폰을 하느라 잠을 참으면 스트레스 호르몬인 코르티솔이 솟구쳐 뼈 회복을 지연시키고 근육통을 유발합니다.",
            sweets: "오답입니다! 🍭\n초콜릿이나 사탕의 당분은 염증 반응을 촉진하여 골절 부위 주변의 붓기와 염증 통증을 가중시킵니다.",
            posture: "오답isms: 🥱\n삐딱한 자세로 종일 앉아 있는 것은 신체 대사 능력을 떨어뜨려 다친 부위로 피가 원활히 돌지 못하게 만듭니다.",
            skipwarmup: "오답입니다! ⚠️\n골절 부상을 입었는데 준비운동 없이 힘껏 상체를 움직이면 뼈가 어긋나 큰 수술을 해야 할 위험이 생깁니다."
        }
    },
    {
        id: 4,
        name: "지혜",
        symptom: "매일 앉아만 있어서 몸이 뻣뻣해요. 특히 고개를 숙여 스마트폰을 오래 했더니 목덜미와 허리 뼈가 굳어 펴지지 않아요!",
        correctKey: "stretching",
        correctText: "정답입니다! 🧘‍♂️\n정기적인 전신 스트레칭은 스마트폰 시청으로 좁아진 관절을 넓혀주고, 수축되어 굳어진 승모근과 척추 주변 근육을 길게 이완해 주어 거북목 증후군을 말끔히 치료해 줍니다.",
        incorrectTexts: {
            salty: "오답입니다! 🍟\n짠 가공식품은 수분을 빨아들여 체내 관절과 척추 디스크 주변의 수분 공급을 방해하여 목뼈 쿠션(디스크)을 뻑뻑하고 딱딱하게 만들 수 있습니다.",
            indoor: "오답입니다! 🏠\n실내에 구부정하게 갇혀만 있으면 근육을 풀어줄 기회가 사라져 뭉침 증세가 점점 누적되어 통증으로 이어집니다.",
            nosleep: "오답입니다! 📱\n밤잠이 부족하면 스트레스로 인해 자율신경계가 과민해져 승모근과 척추 근육이 자동으로 잔뜩 긴장하고 수축하여 담 걸리는 원인이 됩니다.",
            sweets: "오답입니다! 🍭\n단 군것질거리는 몸속 젖산 농도를 증가시켜 가뜩이나 단단하게 굳은 어깨 근육의 피로도를 최고치로 올립니다.",
            posture: "오답입니다! 🥱\n구부정하게 앉아서 유튜브를 보면 목뼈가 받아내는 머리 무게 하중이 5배 이상 증가해 거북목 증세를 가속화합니다.",
            skipwarmup: "오답입니다! ⚠️\n목이 이미 심하게 결려 있는 상태에서 준비운동 없이 갑자기 머리를 격하게 비틀면 목 디스크 이탈(탈출)이 발생할 수 있습니다."
        }
    },
    {
        id: 5,
        name: "준서",
        symptom: "최근 시험공부 때문에 잠을 며칠 못 잤더니 뼈와 근육 마디마디가 쑤시고 아파요. 망가진 뼈와 근육의 세포 재생을 활발하게 할 충전이 필요해요!",
        correctKey: "sleep",
        correctText: "정답입니다! 😴\n충분한 꿀잠은 최고의 명약입니다! 잘 자는 동안 분비되는 호르몬들이 근육과 뼈 조직의 세포를 새것으로 교체해 주어 전신 근육통을 사라지게 해줍니다.",
        incorrectTexts: {
            salty: "오답입니다! 🍟\n수면 부족으로 피곤한 상태에서 짠 컵라면이나 과자를 먹으면 체액이 탁해지고 나트륨이 칼슘 흡수를 차단하여 뼈마디가 더욱 저리게 됩니다.",
            indoor: "오답입니다! 🏠\n햇빛을 보지 않는 실내 생활은 수면 유도 호르몬인 멜라토닌 분비를 방해해 밤에 깊은 잠을 더 못 들게 만들어 피로 회복의 악순환에 빠집니다.",
            nosleep: "오답입니다! 📱\n또 잠을 안 잔다니요! 수면 부족은 뼈 속 무기질 함량을 줄이고 단백질 이화 작용(근손실)을 가속화해 뼈마디가 연약해집니다.",
            sweets: "오답입니다! 🍭\n잠이 깬다고 단 커피나 에너지 음료를 많이 먹으면 뼈에 필요한 무기질 대사가 방해되어 장기적으로 골격을 약하게 합니다.",
            posture: "오답입니다! 🥱\n피곤한 상태에서 비스듬히 누워 스마트폰을 조작하면 척추 척수관 압력이 가중되어 뼈와 신경에 나쁜 영향을 줍니다.",
            skipwarmup: "오답입니다! ⚠️\n체력이 소진되어 근육 통제력이 떨어진 상태에서 스트레칭이나 사전 몸풀기 없이 돌발 행동을 하면 인대 파열로 직행하기 쉽습니다."
        }
    }
];

// 치료 카드 선택지 정보
const remedyCardsPool = {
    correct: [
        { key: "stretching", label: "스트레칭 하기", icon: "🧘‍♂️" },
        { key: "exercise", label: "운동 많이 하기", icon: "🏃‍♂️" },
        { key: "sleep", label: "잠 잘자기", icon: "😴" }
    ],
    incorrect: [
        { key: "salty", label: "짠 음식 먹기", icon: "🍟" },
        { key: "indoor", label: "실내에만 있기", icon: "🏠" },
        { key: "nosleep", label: "잠 안자기", icon: "📱" },
        { key: "sweets", label: "단 것 많이 먹기", icon: "🍭" },
        { key: "posture", label: "구부정한 스마트폰", icon: "🥱" },
        { key: "skipwarmup", label: "준비운동 생략", icon: "⚠️" }
    ]
};

// --- 게임 상태 관리 변수 ---
let currentScore = 30; // 시작 점수 30
let currentPatient = null;
let selectedRemedyCard = null; // 드래그 중인 카드 정보
let timingAnimationId = null;
let sliderPos = 0;
let sliderDirection = 1;
let isTimingActive = false;
let isMutedBgm = false;
let isMutedSfx = false;

// 승리 치료 목록 (결과화면용)
let curedPatientsCount = [];

// --- DOM 요소 바인딩 ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const muteBgmBtn = document.getElementById('mute-bgm');
const muteSfxBtn = document.getElementById('mute-sfx');

const scoreEl = document.getElementById('current-score');
const progressBarEl = document.getElementById('score-progress');
const patientSpeechEl = document.getElementById('patient-speech');
const patientCharEl = document.getElementById('patient-character');
const doctorSpeechEl = document.getElementById('doctor-speech');
const xrayVisualEl = document.getElementById('xray-visual');
const xrayStatusEl = document.getElementById('xray-status');

const timingPanel = document.getElementById('timing-panel');
const timingSlider = document.getElementById('timing-slider');
const activateLaserBtn = document.getElementById('activate-laser-btn');
const cardsContainer = document.getElementById('cards-container');
const patientDropZone = document.getElementById('patient-drop-zone');

const explanationModal = document.getElementById('explanation-modal');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

const resultScreen = document.getElementById('result-screen');
const resultEmoji = document.getElementById('result-emoji');
const resultTitle = document.getElementById('result-title');
const resultSubtitle = document.getElementById('result-subtitle');
const curedGallery = document.getElementById('cured-patients-gallery');
const retryBtn = document.getElementById('retry-btn');
const particleContainer = document.getElementById('particle-container');

// --- 애니메이션용 간호사 로드 ---
function loadNurses() {
    document.getElementById('nurse-left').innerHTML = SVGFactory.getNurseLeft();
    document.getElementById('nurse-right').innerHTML = SVGFactory.getNurseRight();
    document.querySelector('.assistant-body').innerHTML = SVGFactory.getDoctorAssistant();
}

// --- 게임 시작 버튼 핸들러 ---
startBtn.addEventListener('click', () => {
    // 브라우저 AudioContext 잠금 해제 및 시작
    audio.init();
    audio.startBGM();
    
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    loadNurses();
    initGame();
});

// --- 음향 토글 제어 ---
muteBgmBtn.addEventListener('click', () => {
    isMutedBgm = !isMutedBgm;
    audio.isBgmActive = !isMutedBgm;
    if (isMutedBgm) {
        muteBgmBtn.textContent = "🔇 BGM OFF";
        muteBgmBtn.classList.add('muted');
        audio.stopBGM();
    } else {
        muteBgmBtn.textContent = "🎵 BGM ON";
        muteBgmBtn.classList.remove('muted');
        audio.startBGM();
    }
});

muteSfxBtn.addEventListener('click', () => {
    isMutedSfx = !isMutedSfx;
    audio.isSfxActive = !isMutedSfx;
    if (isMutedSfx) {
        muteSfxBtn.textContent = "🔇 SFX OFF";
        muteSfxBtn.classList.add('muted');
    } else {
        muteSfxBtn.textContent = "🔊 SFX ON";
        muteSfxBtn.classList.remove('muted');
    }
});

// --- 파티클 효과 메이커 ---
function createParticles(x, y, isSuccess = true) {
    const colors = isSuccess 
        ? ['#00E676', '#00BFA5', '#00E5FF', '#FFEB3B', '#FF4081'] 
        : ['#90A4AE', '#CFD8DC', '#546E7A', '#FF7043', '#B0BEC5'];
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 랜덤 크기 및 도달 목표 설정
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 120 + 40;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        
        particleContainer.appendChild(particle);
        
        // 애니메이션 끝나면 삭제
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// --- 게임 초기화 ---
function initGame() {
    currentScore = 30;
    curedPatientsCount = [];
    updateScoreUI();
    nextPatient();
}

// --- 환자 배정 및 치료 카드 세팅 ---
function nextPatient() {
    // 타이밍 및 드래그 변수 초기화
    cancelAnimationFrame(timingAnimationId);
    isTimingActive = false;
    selectedRemedyCard = null;
    timingPanel.classList.remove('active');
    
    // 무작위 환자 선정
    const randIdx = Math.floor(Math.random() * patientsData.length);
    currentPatient = patientsData[randIdx];

    // 말풍선 및 환자/X-ray 기본 렌더링
    patientSpeechEl.textContent = `"${currentPatient.symptom}"`;
    patientCharEl.innerHTML = SVGFactory.getPatientSVG(currentPatient.id, 'pain');
    xrayVisualEl.innerHTML = SVGFactory.getXraySVG(currentPatient.id, false);
    xrayStatusEl.textContent = `상태: ${currentPatient.name} 환자 진단 중...`;
    
    // 가이드 코멘트
    doctorSpeechEl.textContent = "환자 증상에 알맞은 올바른 카드를 마우스로 환자에게 끌어다 놓으세요!";

    // 선택지 구성 (정답 1개 + 오답 3개 무작위 추출)
    setupCards();
}

// --- 치료 카드 렌더링 ---
function setupCards() {
    // 1. 현재 환자의 정답 카드 찾기
    const correctCardInfo = remedyCardsPool.correct.find(c => c.key === currentPatient.correctKey);
    
    // 2. 오답 풀에서 3개 랜덤 추출 (중복 불가)
    const shuffledIncorrect = [...remedyCardsPool.incorrect].sort(() => 0.5 - Math.random());
    const selectedIncorrect = shuffledIncorrect.slice(0, 3);
    
    // 3. 네 개의 카드를 합친 뒤 셔플
    const roundCards = [correctCardInfo, ...selectedIncorrect].sort(() => 0.5 - Math.random());
    
    // 4. HTML 동적 생성
    cardsContainer.innerHTML = '';
    roundCards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('remedy-card');
        cardDiv.setAttribute('draggable', 'true');
        cardDiv.dataset.key = card.key;
        cardDiv.dataset.label = card.label;
        cardDiv.dataset.icon = card.icon;
        
        cardDiv.innerHTML = `
            <div class="card-icon">${card.icon}</div>
            <div class="card-label">${card.label}</div>
        `;
        
        // 드래그 이벤트 바인딩
        cardDiv.addEventListener('dragstart', handleDragStart);
        cardDiv.addEventListener('dragend', handleDragEnd);
        
        // 모바일/터치 지원용 클릭 선택 핸들러 (드래그가 까다로운 모바일 환경 배려)
        cardDiv.addEventListener('click', () => {
            selectCardForMobile(card, cardDiv);
        });

        cardsContainer.appendChild(cardDiv);
    });
}

// --- 드래그앤드롭 이벤트 핸들러 ---
function handleDragStart(e) {
    selectedRemedyCard = {
        key: this.dataset.key,
        label: this.dataset.label,
        icon: this.dataset.icon
    };
    this.classList.add('dragging');
    audio.playSFX('drag');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// 드롭 영역 핸들러들
patientDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    patientDropZone.classList.add('dragover');
});

patientDropZone.addEventListener('dragleave', () => {
    patientDropZone.classList.remove('dragover');
});

patientDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    patientDropZone.classList.remove('dragover');
    
    if (selectedRemedyCard) {
        initiateTreatment();
    }
});

// 모바일 클릭 처리 (클릭 후 환자 누르면 적용되게끔)
let mobileSelectedCardElement = null;
function selectCardForMobile(card, element) {
    document.querySelectorAll('.remedy-card').forEach(c => c.style.borderColor = "#E0E0E0");
    selectedRemedyCard = card;
    mobileSelectedCardElement = element;
    element.style.borderColor = "var(--secondary-color)";
    doctorSpeechEl.textContent = "환자 침대나 X-ray 모니터를 터치하여 치료를 시작하세요!";
    audio.playSFX('drag');
}

patientDropZone.addEventListener('click', () => {
    if (selectedRemedyCard && mobileSelectedCardElement) {
        initiateTreatment();
        mobileSelectedCardElement.style.borderColor = "#E0E0E0";
        mobileSelectedCardElement = null;
    }
});

xrayVisualEl.addEventListener('click', () => {
    if (selectedRemedyCard && mobileSelectedCardElement) {
        initiateTreatment();
        mobileSelectedCardElement.style.borderColor = "#E0E0E0";
        mobileSelectedCardElement = null;
    }
});

// --- 치료 가동 상태 전환 (타이밍 게이지 기동) ---
function initiateTreatment() {
    doctorSpeechEl.textContent = "치료 레이저 준비 완료! 게이지의 타이밍을 잘 맞추어 발사하세요!";
    patientCharEl.innerHTML = SVGFactory.getPatientSVG(currentPatient.id, 'healing');
    xrayStatusEl.textContent = `진단: [${selectedRemedyCard.label}] 처방 중...`;
    
    // 타이밍 미니게임 활성화
    timingPanel.classList.add('active');
    isTimingActive = true;
    sliderPos = 0;
    sliderDirection = 1;
    
    // 포커스 맞춰 스페이스바 키 바인딩 동작 대기
    activateLaserBtn.focus();
    
    runTimingLoop();
}

// --- 타이밍 게이지 애니메이션 프레임 루프 ---
function runTimingLoop() {
    if (!isTimingActive) return;
    
    // 속도 조절 (기본적으로 좌우로 튀는 틱 사운드와 함께)
    sliderPos += 2.5 * sliderDirection;
    
    if (sliderPos >= 100) {
        sliderPos = 100;
        sliderDirection = -1;
    } else if (sliderPos <= 0) {
        sliderPos = 0;
        sliderDirection = 1;
    }
    
    // 슬라이더 바 위치 업데이트
    timingSlider.style.left = `${sliderPos}%`;
    
    timingAnimationId = requestAnimationFrame(runTimingLoop);
}

// --- 레이저 발사 이벤트 (클릭 및 스페이스바) ---
activateLaserBtn.addEventListener('click', triggerLaserShot);

// 키보드 스페이스바 전역 이벤트
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isTimingActive) {
        e.preventDefault(); // 스크롤 방지
        triggerLaserShot();
    }
});

function triggerLaserShot() {
    if (!isTimingActive) return;
    isTimingActive = false;
    cancelAnimationFrame(timingAnimationId);
    
    // 타이밍 성공 판정 (Perfect존: 42.5% ~ 57.5% - 중간 15% 영역)
    const isPerfect = (sliderPos >= 42.5 && sliderPos <= 57.5);
    
    if (isPerfect) {
        audio.playSFX('laser');
        // 치료 성공 애니메이션 입혀주기
        patientCharEl.innerHTML = SVGFactory.getPatientSVG(currentPatient.id, 'cured');
        xrayVisualEl.innerHTML = SVGFactory.getXraySVG(currentPatient.id, true);
        xrayStatusEl.textContent = `치료: 레이저 튜닝 주파수 Perfect!`;
        
        // 정답 오답 판별 팝업 띄우기
        setTimeout(() => {
            evaluateRemedy(true);
        }, 800);
    } else {
        audio.playSFX('laser_fail');
        xrayStatusEl.textContent = `치료 실패: 레이저 초점이 맞지 않았습니다!`;
        
        // 안내 문구 표시 후 슬라이더 초기화
        doctorSpeechEl.textContent = "아이쿠, 주파수 조율을 놓쳤어요! 다시 타이밍을 조율해보세요.";
        patientCharEl.innerHTML = SVGFactory.getPatientSVG(currentPatient.id, 'pain');
        
        timingPanel.classList.remove('active');
        selectedRemedyCard = null;
        
        // 카드는 복귀되며 다시 시도 가능
        setupCards();
    }
}

// --- 처방 정/오답 판정 및 모달 활성화 ---
function evaluateRemedy(isTimingSuccess) {
    timingPanel.classList.remove('active');
    
    const isCorrect = (selectedRemedyCard.key === currentPatient.correctKey);
    
    // 모달 디자인 및 해설 내용 설정
    explanationModal.classList.add('active');
    
    if (isCorrect) {
        audio.playSFX('correct');
        explanationModal.querySelector('.modal-content').classList.remove('incorrect');
        
        modalIcon.textContent = "✨🏥✨";
        modalTitle.textContent = "치료 처방 대성공! (+10점)";
        modalBody.textContent = currentPatient.correctText;
        modalConfirmBtn.textContent = "감사합니다! 확인했어요 (+10)";
        
        // 이펙트 발생 (X-ray 중심에서 분출)
        const rect = xrayVisualEl.getBoundingClientRect();
        createParticles(rect.left + rect.width/2, rect.top + rect.height/2, true);
        
        // 완치 목록 추가 (결과창 표기용)
        if (!curedPatientsCount.includes(currentPatient.name)) {
            curedPatientsCount.push(currentPatient.name);
        }
    } else {
        audio.playSFX('incorrect');
        explanationModal.querySelector('.modal-content').classList.add('incorrect');
        
        modalIcon.textContent = "⚠️😢⚠️";
        modalTitle.textContent = "오히려 통증이 심해졌어요... (-10점)";
        
        // 현재 선택한 나쁜 선택지의 해설 문구 바인딩
        const explainText = currentPatient.incorrectTexts[selectedRemedyCard.key] || "몸에 좋지 않은 습관은 뼈와 근육을 아프게 합니다.";
        modalBody.textContent = explainText;
        modalConfirmBtn.textContent = "다음엔 올바른 습관을 처방할게요 (-10)";
        
        // 실패 파티클 발생
        const rect = patientCharEl.getBoundingClientRect();
        createParticles(rect.left + rect.width/2, rect.top + rect.height/2, false);
    }
    
    // 점수 정산 준비 (Confirm 버튼을 클릭할 때 최종 반영)
    modalConfirmBtn.onclick = () => {
        explanationModal.classList.remove('active');
        
        if (isCorrect) {
            currentScore += 10;
        } else {
            currentScore -= 10;
        }
        
        updateScoreUI();
        
        // 승리 / 게임오버 체크
        if (currentScore >= 100) {
            endGame(true);
        } else if (currentScore <= 0) {
            endGame(false);
        } else {
            nextPatient();
        }
    };
}

// --- 점수판 UI 업데이트 ---
function updateScoreUI() {
    scoreEl.textContent = currentScore;
    
    // 범위 한계점 지정 및 프로그레스 바 너비 조절
    const percent = Math.min(100, Math.max(0, currentScore));
    progressBarEl.style.width = `${percent}%`;
    
    // 게이지 가득 차기 전 애니메이션 피드백
    scoreEl.style.animation = 'none';
    scoreEl.offsetHeight; // 트리거 리플로우
    scoreEl.style.animation = 'pulse-score 0.3s ease';
}

// --- 게임 엔딩 (승리 / 게임오버) ---
function endGame(isVictory) {
    resultScreen.classList.add('active');
    
    if (isVictory) {
        audio.playSFX('victory');
        resultEmoji.textContent = "👑🏆🎉";
        resultTitle.textContent = "최고의 명의 탄생!";
        resultSubtitle.textContent = "모든 환자의 뼈와 근육을 단단하고 튼튼하게 치료해냈습니다!";
        
        // 완치된 환자들의 축하 갤러리 빌드
        curedGallery.style.display = "flex";
        curedGallery.innerHTML = '';
        
        curedPatientsCount.forEach(name => {
            const thumb = document.createElement('div');
            thumb.classList.add('cured-thumbnail');
            thumb.textContent = "😊";
            thumb.title = `${name} 환자 완치!`;
            
            const nameLabel = document.createElement('div');
            nameLabel.style.fontSize = "0.7rem";
            nameLabel.style.fontWeight = "bold";
            nameLabel.textContent = name;
            
            const wrapper = document.createElement('div');
            wrapper.style.display = "flex";
            wrapper.style.flexDirection = "column";
            wrapper.style.alignItems = "center";
            wrapper.appendChild(thumb);
            wrapper.appendChild(nameLabel);
            
            curedGallery.appendChild(wrapper);
        });
    } else {
        audio.playSFX('gameover');
        resultEmoji.textContent = "🏥🚑💥";
        resultTitle.textContent = "병원 진료 마비...";
        resultSubtitle.textContent = "환자들의 뼈와 근육 통증이 악화되었습니다. 더 유심히 처방해보세요!";
        curedGallery.style.display = "none";
    }
}

// --- 게임 재도전 ---
retryBtn.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    initGame();
});

// src/components/GamePage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gamePageStyles from '../styles/GamePage.module.scss'; // Импортируем SCSS-модуль

// Импорты для Swiper.js
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules'; // Модули для навигации и пагинации

// Импорт базовых стилей Swiper и стилей для модулей
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Импорты изображений
import geeksLogo from '../assets/img/geeksLogo.svg';
import geeksProLogo from '../assets/img/geeks_pro.svg';
import geekStudioLogo from '../assets/img/geekStudio.svg';
import geeksOneLogo from '../assets/img/geeksOneLogo.svg';

// =====================================================================
// КОНФИГУРАЦИЯ ИГРЫ И НАСТРОЙКИ УРОВНЕЙ
// =====================================================================

// НОВОЕ: Объединенный список персонажей с их свойствами
const CHARACTER_LIST = [
    {
        type: 'geek',
        name: 'Geeks',
        img: geeksLogo,
        price: 0,
        trailColor: '#FFFF00', // Желтый для Geek
    },
    {
        type: 'senior',
        name: 'GeeksPro',
        img: geeksProLogo,
        price: 300,
        trailColor: '#00BFFF', // Голубой для Senior
    },
    {
        type: 'pro',
        name: 'GeeksStudio',
        img: geekStudioLogo,
        price: 600,
        trailColor: '#90EE90', // Светло-зелёный для Pro
    },
    {
        type: 'junior',
        name: 'Junior',
        img: geekStudioLogo,
        price: 600,
        trailColor: '#90EE90', // Светло-зелёный для Pro
    },
    {
        type: 'middle',
        name: 'Middle',
        img: geekStudioLogo,
        price: 600,
        trailColor: '#90EE90', // Светло-зелёный для Pro
    },
    {
        type: 'lead',
        name: 'Senior',
        img: geekStudioLogo,
        price: 600,
        trailColor: '#90EE90', // Светло-зелёный для Pro
    },
];

// Общие настройки игры
const GAME_CONFIG = {
    BIRD_GRAVITY: 1400, // Гравитация птицы (пикселей/сек^2)
    BIRD_LIFT: -600,    // Сила прыжка птицы (пикселей/сек)
    INITIAL_PIPE_INTERVAL: 1670, // Начальный интервал между трубами (мс)
    INITIAL_PIPE_GAP: 450,       // Начальный промежуток между трубами (пикс)
    PIPE_WIDTH: 10,              // Ширина трубы (пикс)
    INITIAL_PIPE_SPEED: 200,     // Начальная скорость движения труб (пикс/сек)
    INITIAL_PIPE_COLOR: "#FFD700", // Начальный цвет труб (золотой)
    BG_SPEED: 30,                // Скорость движения фона по X (пикс/сек)
    BG_VERTICAL_SPEED: 0,        // Скорость движения фона по Y (пикс/сек) - УДАЛЕНО ПОСТОЯННОЕ ДВИЖЕНИЕ
    BG_TILE_SPACING: 12,         // Отступ между плитками фона (пикс)
    BG_COLUMN_VERTICAL_OFFSET: 8, // Вертикальное смещение для каждой колонки фона (пикс)
    TRAIL_LENGTH: 30,            // Длина следа за птицей (количество точек)
    TRAIL_COLOR: '#FFFF00', // Это значение может быть переопределено цветом из CHARACTER_LIST
    HORIZONTAL_TRAIL_OFFSET: 10, // Горизонтальное смещение для каждой точки следа
    COINS_PER_THRESHOLD: 150,    // Количество коинов за каждые 10 очков
};

// Настройки уровней (зависят от набранных очков)
const LEVEL_SETTINGS = [
    {
        scoreThreshold: 0, // Уровень 0 (начальный)
        pipeSpeed: GAME_CONFIG.INITIAL_PIPE_SPEED,
        pipeGap: GAME_CONFIG.INITIAL_PIPE_GAP,
        pipeColor: GAME_CONFIG.INITIAL_PIPE_COLOR,
        title: 'Geeks',
    },
    {
        scoreThreshold: 10, // Уровень 1 (от 10 очков)
        pipeSpeed: 240,
        pipeGap: 370,
        pipeColor: "#00BFFF", // Голубой
        title: 'Geeks Pro',
    },
    {
        scoreThreshold: 20, // Уровень 2 (от 20 очков)
        pipeSpeed: 270,
        pipeGap: 320,
        pipeColor: "#90EE90", // Светло-зелёный
        title: 'Geek Studio',
    },
    // Задел на будущие уровни (до 7)
    {
        scoreThreshold: 30,
        pipeSpeed: 300,
        pipeGap: 270,
        pipeColor: '#FFA07A', // Оранжево-красный
        title: 'Junior',
    },
    {
        scoreThreshold: 40,
        pipeSpeed: 330,
        pipeGap: 240,
        pipeColor: '#FF69B4', // Розовый
        title: 'Middle',
    },
    {
        scoreThreshold: 50,
        pipeSpeed: 360,
        pipeGap: 220,
        pipeColor: '#8A2BE2', // Сине-фиолетовый
        title: 'Senior',
    },
    {
        scoreThreshold: 60,
        pipeSpeed: 390,
        pipeGap: 200,
        pipeColor: '#FFD700', // Золотой (может быть другим оттенком)
        title: 'Team Lead',
    },
];

// =====================================================================
// КОМПОНЕНТ ИГРЫ
// =====================================================================

function GamePage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null); // Ссылка на элемент Canvas
    const birdImgRef = useRef(new Image()); // Ссылка на объект Image для птицы
    const bgImgRef = useRef(new Image());   // Ссылка на объект Image для фона

    // Состояния для управления видимостью модальных окон и UI
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [finalScoreDisplay, setFinalScoreDisplay] = useState(0);
    const [isGameRunning, setIsGameRunning] = useState(false); // Состояние для контроля игрового цикла
    const [isLoaded, setIsLoaded] = useState(false); // Состояние для анимации загрузки кнопки "Назад"
    const [currentLevelTitle, setCurrentLevelTitle] = useState(LEVEL_SETTINGS[0].title); // Состояние для заголовка уровня (для React UI)
    const currentLevelTitleRef = useRef(LEVEL_SETTINGS[0].title); // Ref для заголовка уровня в Canvas

    // Состояния для выбора персонажа (перенесены из CharacterPage)
    const [userCoins, setUserCoins] = useState(0);
    const [purchasedCharacters, setPurchasedCharacters] = useState(() => {
        try {
            const stored = localStorage.getItem('purchasedCharacters');
            return stored ? JSON.parse(stored) : ['geek'];
        } catch (error) {
            console.error("Failed to parse purchased characters from localStorage:", error);
            return ['geek']; // Fallback to default
        }
    });

    // Состояние для отображения сообщений (замена alert)
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    // Игровые переменные, которые не должны вызывать ре-рендеры при каждом изменении
    // Их начальные значения берутся из GAME_CONFIG
    const gameVariables = useRef({
        bird: {
            x: 0, y: 0, width: 0, height: 0,
            gravity: GAME_CONFIG.BIRD_GRAVITY,
            lift: GAME_CONFIG.BIRD_LIFT,
            velocity: 0,
        },
        pipes: [],
        pipeInterval: GAME_CONFIG.INITIAL_PIPE_INTERVAL,
        pipeTimer: 0,
        pipeGap: GAME_CONFIG.INITIAL_PIPE_GAP,
        pipeWidth: GAME_CONFIG.PIPE_WIDTH,
        pipeSpeed: GAME_CONFIG.INITIAL_PIPE_SPEED,
        pipeColor: GAME_CONFIG.INITIAL_PIPE_COLOR,
        score: 0,
        lastCoinReward: 0,
        coinsEarned: 0,
        bgX: 0,
        bgY: 0,
        bgSpeed: GAME_CONFIG.BG_SPEED,
        animationId: null,
        isGameOver: false,
        lastTime: 0,
        trail: [],
        trailColor: GAME_CONFIG.TRAIL_COLOR,
        trailLength: GAME_CONFIG.TRAIL_LENGTH,
        horizontalTrailOffset: GAME_CONFIG.HORIZONTAL_TRAIL_OFFSET,
        currentUser: null,
    });

    // Функция для отображения сообщения
    const showUserMessage = useCallback((msg) => {
        setMessage(msg);
        setShowMessage(true);
        const timer = setTimeout(() => {
            setShowMessage(false);
            setMessage('');
        }, 3000); // Сообщение исчезнет через 3 секунды
        return () => clearTimeout(timer);
    }, []);

    // Функция для прыжка
    const jump = useCallback(() => {
        if (!gameVariables.current.isGameOver) {
            gameVariables.current.bird.velocity = gameVariables.current.bird.lift;
        }
    }, []);

    // Функция для проверки начисления коинов
    const checkCoinReward = useCallback(() => {
        const currentThreshold = Math.floor(gameVariables.current.score / 10) * 10;
        if (currentThreshold > gameVariables.current.lastCoinReward) {
            gameVariables.current.coinsEarned += GAME_CONFIG.COINS_PER_THRESHOLD; // Используем константу
            gameVariables.current.lastCoinReward = currentThreshold;
        }
    }, []);

    // Функция завершения игры
    const gameOver = useCallback(() => {
        gameVariables.current.isGameOver = true;
        setIsGameRunning(false); // Останавливаем игровой цикл через состояние
        cancelAnimationFrame(gameVariables.current.animationId);

        const currentUser = gameVariables.current.currentUser;
        if (currentUser) {
            const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
            const userEntry = leaderboard.find(entry =>
                entry.name === currentUser.name &&
                entry.phone === currentUser.phone
            );

            if (userEntry) {
                if (gameVariables.current.score > userEntry.score) {
                    userEntry.score = gameVariables.current.score;
                }
                userEntry.coins = (userEntry.coins || 0) + gameVariables.current.coinsEarned;
            } else {
                leaderboard.push({
                    name: currentUser.name,
                    phone: currentUser.phone,
                    score: gameVariables.current.score,
                    coins: gameVariables.current.coinsEarned
                });
            }
            localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
        }

        setFinalScoreDisplay(gameVariables.current.score);
        setShowGameOverModal(true); // Показываем модалку проигрыша

        // Обновляем коины пользователя для отображения в модалке выбора персонажа
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        const currentLocalUser = JSON.parse(localStorage.getItem("currentUser"));
        let currentCoins = 0;
        if (currentLocalUser) {
            const userEntry = leaderboard.find(entry => entry.name === currentLocalUser.name);
            if (userEntry) {
                currentCoins = userEntry.coins || 0;
            }
        }
        setUserCoins(currentCoins);

    }, []);

    // Функция обновления состояния игры
    const update = useCallback((deltaTime) => {
        if (gameVariables.current.isGameOver) return;

        const { bird, pipes, bgSpeed, trail, trailLength} = gameVariables.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        bird.velocity += bird.gravity * (deltaTime / 1000);
        bird.y += bird.velocity * (deltaTime / 1000);

        // Добавляем точку в след
        trail.push({ x: bird.x + bird.width / 2, y: bird.y + bird.height / 2 });
        if (trail.length > trailLength) {
            trail.shift();
        }

        gameVariables.current.bgX -= bgSpeed * (deltaTime / 1000);
        gameVariables.current.bgY -= GAME_CONFIG.BG_VERTICAL_SPEED * (deltaTime / 1000); // Constant movement on Y

        gameVariables.current.pipeTimer += deltaTime;
        if (gameVariables.current.pipeTimer >= gameVariables.current.pipeInterval) {
            let top = Math.random() * (canvas.height - gameVariables.current.pipeGap - 100);
            pipes.push({
                x: canvas.width,
                top,
                bottom: top + gameVariables.current.pipeGap,
                passed: false
            });
            gameVariables.current.pipeTimer -= gameVariables.current.pipeInterval;
        }

        // Уровни сложности: применяем настройки из LEVEL_SETTINGS
        let currentLevelSetting = LEVEL_SETTINGS[0]; // Default to initial level
        for (let i = LEVEL_SETTINGS.length - 1; i >= 0; i--) {
            if (gameVariables.current.score >= LEVEL_SETTINGS[i].scoreThreshold) {
                currentLevelSetting = LEVEL_SETTINGS[i];
                break;
            }
        }
        gameVariables.current.pipeSpeed = currentLevelSetting.pipeSpeed;
        gameVariables.current.pipeGap = currentLevelSetting.pipeGap;
        gameVariables.current.pipeColor = currentLevelSetting.pipeColor;
        setCurrentLevelTitle(currentLevelSetting.title); // Update state for React UI (will cause re-render)
        currentLevelTitleRef.current = currentLevelSetting.title; // Update ref for Canvas (no re-render)

        try {
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= gameVariables.current.pipeSpeed * (deltaTime / 1000); // Use current pipe speed

                // Collision detection
                if (
                    bird.x + bird.width > pipes[i].x &&
                    bird.x < pipes[i].x + GAME_CONFIG.PIPE_WIDTH && // Use PIPE_WIDTH constant
                    (bird.y < pipes[i].top || bird.y + bird.height > pipes[i].bottom)
                ) {
                    gameOver();
                    return; // Exit after game over
                }

                if (pipes[i].x + GAME_CONFIG.PIPE_WIDTH < 0) { // Use PIPE_WIDTH constant
                    pipes.splice(i, 1);
                }

                if (!pipes[i].passed && pipes[i].x + GAME_CONFIG.PIPE_WIDTH < bird.x) { // Use PIPE_WIDTH constant
                    pipes[i].passed = true;
                    gameVariables.current.score++;
                    checkCoinReward();
                }
            }
        } catch (error) {
            console.log(error);
        }


        // Collision with top/bottom edges
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            bird.velocity = 0;
        } else if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }
    }, [checkCoinReward, gameOver]); // Removed setCurrentLevelTitle from dependencies

    // Function to draw game elements on Canvas
    const draw = useCallback(() => {
        if (gameVariables.current.isGameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { bird, pipes, score, coinsEarned, pipeColor, trail, trailLength, horizontalTrailOffset } = gameVariables.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background - Updated logic for repeating SVG with spacing and diagonal offset
        if (bgImgRef.current.complete && bgImgRef.current.naturalHeight !== 0) {
            const imgWidth = bgImgRef.current.naturalWidth;
            const imgHeight = bgImgRef.current.naturalHeight;
            const tileTotalWidth = imgWidth + GAME_CONFIG.BG_TILE_SPACING;   // Tile width + spacing
            const tileTotalHeight = imgHeight + GAME_CONFIG.BG_TILE_SPACING; // Tile height + spacing

            const effectiveBgX = gameVariables.current.bgX % tileTotalWidth;
            const effectiveBgY = gameVariables.current.bgY % tileTotalHeight;

            // Draw repeating background. Start one tile left/up to ensure full coverage.
            for (let x = effectiveBgX - tileTotalWidth; x < canvas.width; x += tileTotalWidth) {
                const columnIndex = x / tileTotalWidth;
                const columnVerticalOffset = columnIndex * GAME_CONFIG.BG_COLUMN_VERTICAL_OFFSET;

                const currentColumnEffectiveY = (effectiveBgY + columnVerticalOffset) % tileTotalHeight;
                const finalYOffset = currentColumnEffectiveY < 0 ? currentColumnEffectiveY + tileTotalHeight : currentColumnEffectiveY;


                for (let y = finalYOffset - tileTotalHeight; y < canvas.height; y += tileTotalHeight) {
                    ctx.drawImage(bgImgRef.current, x, y, imgWidth, imgHeight); // Draw image without spacing
                }
            }
        } else {
            ctx.fillStyle = "#87CEEB";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Trail
        if (trail.length > 1) {
            ctx.beginPath();
            const firstPosition = trail[0];
            const firstDrawX = firstPosition.x - trailLength * horizontalTrailOffset;
            ctx.moveTo(firstDrawX, firstPosition.y);

            for (let i = 1; i < trail.length; i++) {
                const position = trail[i];
                const alpha = (i + 1) / trail.length;
                const lineWidth = (i + 1) / trail.length * (birdImgRef.current.naturalHeight);
                const drawX = position.x - (trailLength - i) * horizontalTrailOffset;

                ctx.globalAlpha = alpha * 0.02;
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = gameVariables.current.trailColor; // USE TRAIL COLOR FROM gameVariables
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                ctx.lineTo(drawX, position.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(drawX, position.y);
            }
            ctx.globalAlpha = 1;
        }

        // Bird
        if (birdImgRef.current.complete && birdImgRef.current.naturalHeight !== 0) {
            ctx.drawImage(birdImgRef.current, bird.x, bird.y, bird.width, bird.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }

        // Pipes
        pipes.forEach(pipe => {
            ctx.save();
            let glowColor;
            // Determine pipe glow color based on current level
            let currentLevelSetting = LEVEL_SETTINGS[0];
            for (let i = LEVEL_SETTINGS.length - 1; i >= 0; i--) {
                if (score >= LEVEL_SETTINGS[i].scoreThreshold) {
                    currentLevelSetting = LEVEL_SETTINGS[i];
                    break;
                }
            }
            glowColor = currentLevelSetting.pipeColor;


            // Set glow parameters before drawing pipes
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 8; // Reduce blur for less extensive glow

            // Top pipe
            ctx.beginPath();
            ctx.roundRect(pipe.x, 0, GAME_CONFIG.PIPE_WIDTH, pipe.top, [0, 0, 10, 10]); // Use PIPE_WIDTH constant
            ctx.fillStyle = pipeColor;
            ctx.fill(); // Fill only, no stroke

            // Bottom pipe
            ctx.beginPath();
            ctx.roundRect(pipe.x, pipe.bottom, GAME_CONFIG.PIPE_WIDTH, canvas.height - pipe.bottom, [10, 10, 0, 0]); // Use PIPE_WIDTH constant
            ctx.fill(); // Fill only, no stroke

            ctx.restore();
        });

        // Score and Coins
        ctx.fillStyle = "#FFD700";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Счёт: ${score}`, canvas.width / 2, 40);
        ctx.fillText(`💰 Коины: ${coinsEarned}`, canvas.width / 2, 70);

        // Display level title
        ctx.fillStyle = "#FFD700"; // Color for level title
        ctx.font = "bold 26px Arial"; // Bold font for title
        ctx.textAlign = "center";
        ctx.fillText(`Этап: ${currentLevelTitleRef.current}`, canvas.width / 2, 105); // USE currentLevelTitleRef.current
    }, []); // Removed currentLevelTitle from dependencies

    // Main game loop
    const gameLoop = useCallback((timestamp) => {
        if (gameVariables.current.isGameOver) return;

        const deltaTime = (gameVariables.current.lastTime === 0) ? 0 : timestamp - gameVariables.current.lastTime;
        gameVariables.current.lastTime = timestamp;

        update(deltaTime);
        draw();

        gameVariables.current.animationId = requestAnimationFrame(gameLoop);
    }, [update, draw]);

    // Function to change character
    const changeCharacter = useCallback(() => {
        const selectedCharacter = localStorage.getItem('selectedCharacter') || 'geek';
        const charInfo = CHARACTER_LIST.find(char => char.type === selectedCharacter); // Find character info from the new list
        if (charInfo) {
            birdImgRef.current.src = charInfo.img; // Use .img from CHARACTER_LIST
            gameVariables.current.trailColor = charInfo.trailColor; // Update trail color
        }
    }, []);

    // Function to reset game
    const resetGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Reset all game variables to initial values from GAME_CONFIG
        gameVariables.current = {
            bird: {
                x: canvas.width / 4, // Set initial bird position
                y: canvas.height / 2,
                width: birdImgRef.current.naturalWidth,
                height: birdImgRef.current.naturalHeight,
                gravity: GAME_CONFIG.BIRD_GRAVITY,
                lift: GAME_CONFIG.BIRD_LIFT,
                velocity: 0
            },
            pipes: [],
            pipeInterval: GAME_CONFIG.INITIAL_PIPE_INTERVAL,
            pipeTimer: 0,
            pipeGap: GAME_CONFIG.INITIAL_PIPE_GAP,
            pipeWidth: GAME_CONFIG.PIPE_WIDTH,
            pipeSpeed: GAME_CONFIG.INITIAL_PIPE_SPEED,
            pipeColor: GAME_CONFIG.INITIAL_PIPE_COLOR,
            score: 0,
            lastCoinReward: 0,
            coinsEarned: 0,
            bgX: 0,
            bgY: 0,
            bgSpeed: GAME_CONFIG.BG_SPEED,
            animationId: null,
            isGameOver: false,
            lastTime: 0, // Reset lastTime for new loop
            trail: [],
            trailLength: GAME_CONFIG.TRAIL_LENGTH,
            horizontalTrailOffset: GAME_CONFIG.HORIZONTAL_TRAIL_OFFSET,
            currentUser: gameVariables.current.currentUser, // Preserve current user
        };

        setShowGameOverModal(false); // Hide game over modal
        changeCharacter(); // Update character (so trail color also resets/sets)
        setCurrentLevelTitle(LEVEL_SETTINGS[0].title); // Reset level title state
        currentLevelTitleRef.current = LEVEL_SETTINGS[0].title; // Reset level title ref
        setIsGameRunning(true); // Start game loop
        gameVariables.current.animationId = requestAnimationFrame(gameLoop);
    }, [changeCharacter, gameLoop]);

    // Function to check user and start game/modal
    const checkUserAndStartGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initialize bird size and position
        gameVariables.current.bird.width = birdImgRef.current.naturalWidth;
        gameVariables.current.bird.height = birdImgRef.current.naturalHeight;
        gameVariables.current.bird.x = canvas.width / 4;
        gameVariables.current.bird.y = canvas.height / 2;

        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
            gameVariables.current.currentUser = JSON.parse(savedUser);
            setShowRegistrationModal(false);
            changeCharacter();
            setIsGameRunning(true); // Set flag that game is running
            gameVariables.current.animationId = requestAnimationFrame(gameLoop);
        } else {
            setShowRegistrationModal(true);
        }
        setIsLoaded(true); // Set isLoaded to true after initial setup
    }, [changeCharacter, gameLoop]);

    // useEffect for Canvas initialization, image loading, and event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.getContext("2d");
        const loadImages = () => {
            let loadedCount = 0;
            const totalImages = 2;

            const imageLoadedHandler = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    checkUserAndStartGame();
                }
            };

            const imageErrorHandler = (e) => {
                console.error("Error loading image:", e.target.src);
                // Can add fallback behavior
            };

            birdImgRef.current.onload = imageLoadedHandler;
            birdImgRef.current.onerror = imageErrorHandler;
            bgImgRef.current.onload = imageLoadedHandler;
            bgImgRef.current.onerror = imageErrorHandler;

            // Load selected character or use default
            const selectedCharacter = localStorage.getItem('selectedCharacter') || 'geek';
            const charInfo = CHARACTER_LIST.find(char => char.type === selectedCharacter);
            if (charInfo) {
                birdImgRef.current.src = charInfo.img;
                gameVariables.current.trailColor = charInfo.trailColor; // Set initial trail color
            } else {
                birdImgRef.current.src = CHARACTER_LIST[0].img; // Fallback to default if not found
                gameVariables.current.trailColor = CHARACTER_LIST[0].trailColor;
            }
            bgImgRef.current.src = geeksOneLogo;
        };

        loadImages();

        // Add event listeners
        document.addEventListener("keydown", jump);
        document.addEventListener("touchstart", jump);

        // Event listener for window resize to adapt Canvas
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // When resizing, also need to update bird position,
            // so it remains centered or in correct proportion
            gameVariables.current.bird.x = canvas.width / 4;
            gameVariables.current.bird.y = canvas.height / 2;
        };
        window.addEventListener('resize', handleResize);

        // Listener for character update in localStorage
        const handleStorageChange = (e) => {
            if (e.key === 'selectedCharacter') {
                changeCharacter();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Cleanup function
        return () => {
            cancelAnimationFrame(gameVariables.current.animationId);
            document.removeEventListener("keydown", jump);
            document.removeEventListener("touchstart", jump);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [jump, checkUserAndStartGame, changeCharacter, gameLoop]); // Dependencies for useEffect

    // Handler for saving user (for registration)
    const handleSaveUser = async () => {
        const name = userName.trim();
        const phone = userPhone.trim();

        const kyrgyzPhoneRegex = /^\+996\d{9}$/;

        if (!name || !kyrgyzPhoneRegex.test(phone)) {
            showUserMessage("Введите имя и корректный номер (+996XXXXXXXXX)");
            return;
        }

        gameVariables.current.currentUser = { name, phone, score: 0 };
        localStorage.setItem("currentUser", JSON.stringify(gameVariables.current.currentUser));

        const apiUrl = "https://geektech.bitrix24.ru/rest/1/e08w1jvst0jj152c/crm.lead.add.json";
        const params = new URLSearchParams({
            "fields[SOURCE_ID]": 127,
            "fields[NAME]": name,
            "fields[TITLE]": "GEEKS GAME: Хакатон 2025",
            "fields[PHONE][0][VALUE]": phone,
            "fields[PHONE][0][VALUE_TYPE]": "WORK"
        });

        try {
            const response = await fetch(apiUrl + '?' + params.toString(), {
                method: "GET",
            });
            const data = await response.json();

            if (data.result) {
                setShowRegistrationModal(false);
                setIsGameRunning(true);
                gameVariables.current.animationId = requestAnimationFrame(gameLoop);
            } else {
                showUserMessage("Произошла ошибка при отправке данных на сервер.");
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            showUserMessage("Ошибка сети. Попробуйте позже.");
        }
    };

    // Handler for "Back to Menu" button
    const handleBackToMenu = () => {
        navigate('/');
    };

    // Обработчик выбора/покупки персонажа (перенесен из CharacterPage)
    const handleCharacterAction = (characterType) => {
        if (purchasedCharacters.includes(characterType)) {
            // Если персонаж уже куплен - выбираем его
            localStorage.setItem('selectedCharacter', characterType);
            showUserMessage(`Персонаж ${CHARACTER_LIST.find(char => char.type === characterType).name || characterType} выбран!`);
            // Можно закрыть модалку или перейти к игре
            setShowGameOverModal(false); // Закрываем модалку после выбора
            resetGame(); // Начинаем новую игру с выбранным персонажем
        } else {
            // Покупка персонажа
            const price = CHARACTER_LIST.find(char => char.type === characterType).price; // Используем CHARACTER_LIST для получения цены
            if (userCoins >= price) {
                // Вычитаем коины
                const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
                const currentUser = gameVariables.current.currentUser; // Используем currentUser из gameVariables

                if (currentUser) {
                    const userEntry = leaderboard.find(entry => entry.name === currentUser.name);
                    if (userEntry) {
                        userEntry.coins = userCoins - price; // Обновляем коины в записи пользователя
                        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
                        setUserCoins(userCoins - price); // Обновляем состояние коинов
                    }
                }

                // Добавляем персонажа в купленные
                setPurchasedCharacters(prev => [...prev, characterType]);
                localStorage.setItem('purchasedCharacters', JSON.stringify([...purchasedCharacters, characterType])); // Обновляем localStorage

                showUserMessage(`Поздравляем! Вы приобрели персонажа ${CHARACTER_LIST.find(char => char.type === characterType).name || characterType}!`);
                // После покупки можно автоматически выбрать персонажа или оставить выбор за игроком
                localStorage.setItem('selectedCharacter', characterType);
                // Можно обновить UI, чтобы кнопка стала "Выбрать"
            } else {
                showUserMessage(`Недостаточно монет для покупки ${CHARACTER_LIST.find(char => char.type === characterType).name || characterType}. Вам нужно ${price} монет.`);
            }
        }
    };

    const getNextLevelMessage = useCallback(() => {
        const nextLevelInfo = LEVEL_SETTINGS.find(level => level.scoreThreshold > finalScoreDisplay);
        if (nextLevelInfo) {
            return `Пройди до ${nextLevelInfo.scoreThreshold} очков и ты достигнешь ${nextLevelInfo.title} :)`;
        } else {
            return 'Ты достиг высшего уровня! Поздравляем!';
        }
    }, [finalScoreDisplay]);

    return (
        <div className={`${gamePageStyles.gamePageContainer} ${isLoaded ? gamePageStyles.loaded : ''}`}>
            <canvas ref={canvasRef} className={gamePageStyles.gameCanvas}></canvas>

            {/* Message Box Modal */}
            {showMessage && (
                <div className={gamePageStyles.messageBox}>
                    <p>{message}</p>
                </div>
            )}

            {/* Registration Modal */}
            {showRegistrationModal && (
                <div id="registrationModal" className={gamePageStyles.modal}>
                    <div className={gamePageStyles.modalContent}>
                        <h2>Регистрация</h2>
                        <input
                            type="text"
                            id="userName"
                            placeholder="Имя"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <input
                            type="tel"
                            id="userPhone"
                            placeholder="Телефон (+996...)"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                        />
                        <button onClick={handleSaveUser}>Сохранить</button>
                    </div>
                </div>
            )}

            {/* Game Over Modal */}
            {showGameOverModal && (
                <div id="gameOverModal" className={gamePageStyles.modal}>
                    <div className={gamePageStyles.modalContent}>
                        <h2>Игра окончена</h2>
                        <p>Очки: <span id="finalScore">{finalScoreDisplay}</span></p>
                        <p>{getNextLevelMessage()}</p>

                        <hr className={gamePageStyles.hr} /> {/* Разделитель */}

                        {/* Character Selection Section (moved from CharacterPage) */}
                        <h1 className={gamePageStyles.characterSectionTitle}>Выбор персонажа</h1>
                        <div className={gamePageStyles.coinsDisplay}>💰 {userCoins} coins</div>

                        {/* Swiper Container */}
                        <div className={gamePageStyles.characterSwiperContainer}>
                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={GAME_CONFIG.BG_TILE_SPACING} // Use BG_TILE_SPACING for space between slides
                                slidesPerView={1} // Show 1 slide at a time
                                navigation={{
                                    prevEl: '.swiper-button-prev',
                                    nextEl: '.swiper-button-next',
                                }}
                                breakpoints={{
                                    // when window width is >= 768px
                                    320: {
                                        slidesPerView: 1,
                                    },

                                    768: {
                                        slidesPerView: 2,
                                        spaceBetween: 30,
                                    },
                                    // when window width is >= 1024px
                                    1024: {
                                        slidesPerView: 3,
                                        spaceBetween: 30,
                                    },
                                }}
                            >
                                {CHARACTER_LIST.map((char) => {
                                    const isLocked = !purchasedCharacters.includes(char.type) && userCoins < char.price; // ИСПОЛЬЗУЕМ char.price
                                    const isPurchased = purchasedCharacters.includes(char.type);
                                    const buttonText = isPurchased ? 'Выбрать' : (isLocked ? 'Заблокировано' : `Купить за ${char.price} 💰`); // ИСПОЛЬЗУЕМ char.price

                                    return (
                                        <SwiperSlide key={char.type}>
                                            <div
                                                className={`${gamePageStyles.characterItem} ${isLocked ? gamePageStyles.locked : ''}`}
                                                data-character={char.type}
                                            >
                                                <img src={char.img} alt={char.name} />
                                                <h3>{char.name}</h3>
                                                <p className={gamePageStyles.cardPrice}>{char.price} coins</p> {/* ИСПОЛЬЗУЕМ char.price */}
                                                <div className={gamePageStyles.characterBtnDiv}>
                                                    <button
                                                        className={gamePageStyles.selectBtn}
                                                        onClick={() => handleCharacterAction(char.type)}
                                                        disabled={isLocked && !isPurchased}
                                                    >
                                                        {buttonText}
                                                    </button>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>

                            <div className="swiper-button-prev"></div>
                            <div className="swiper-button-next"></div>
                        </div>
                        {/* End Character Selection Section */}

                        <button onClick={resetGame}>Рестарт</button>
                        <button onClick={handleBackToMenu}>Назад в меню</button>
                    </div>
                </div>
            )}

            {/* Back to Menu Button (displayed only when modals are hidden) */}
            {!showRegistrationModal && !showGameOverModal && (
                <button id="backBtn" className={gamePageStyles.backBtn} onClick={handleBackToMenu}>⬅ Назад в меню</button>
            )}
        </div>
    );
}

export default GamePage;

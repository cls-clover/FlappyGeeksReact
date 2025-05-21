// src/components/CharacterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/CharacterPage.module.scss'; // Импортируем SCSS-модуль

// Импортируем изображения
import geeksLogo from '../assets/img/geeksLogo.svg';
import geeksProLogo from '../assets/img/geeks_pro.svg';
import geekStudioLogo from '../assets/img/geekStudio.svg';

// Цены персонажей (можно вынести в отдельный файл констант, если их много)
const CHARACTER_PRICES = {
    'geek': 0,
    'senior': 300,
    'pro': 600
};

function CharacterPage() {
    const navigate = useNavigate();
    // Состояние для отображения количества монет пользователя
    const [userCoins, setUserCoins] = useState(0);
    // Состояние для списка купленных персонажей (по умолчанию "geek" куплен)
    const [purchasedCharacters, setPurchasedCharacters] = useState(() => {
        try {
            const stored = localStorage.getItem('purchasedCharacters');
            return stored ? JSON.parse(stored) : ['geek'];
        } catch (error) {
            console.error("Failed to parse purchased characters from localStorage:", error);
            return ['geek']; // Fallback to default
        }
    });
    // Состояние для отображения сообщения (замена alert)
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    // useEffect для инициализации данных при загрузке компонента
    useEffect(() => {
        // Анимация появления кнопки "Назад"
        document.body.classList.add(styles.loaded); // Добавляем класс для анимации

        // Получаем данные пользователя и его коины из localStorage
        const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        let currentCoins = 0;
        if (currentUser) {
            const userEntry = leaderboard.find(entry => entry.name === currentUser.name);
            if (userEntry) {
                currentCoins = userEntry.coins || 0;
            }
        }
        setUserCoins(currentCoins);

        // Очистка класса при размонтировании компонента
        return () => {
            document.body.classList.remove(styles.loaded);
        };
    }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании

    // useEffect для сохранения купленных персонажей в localStorage при их изменении
    useEffect(() => {
        localStorage.setItem('purchasedCharacters', JSON.stringify(purchasedCharacters));
    }, [purchasedCharacters]);

    // Функция для отображения сообщения
    const showUserMessage = (msg) => {
        setMessage(msg);
        setShowMessage(true);
        const timer = setTimeout(() => {
            setShowMessage(false);
            setMessage('');
        }, 3000); // Сообщение исчезнет через 3 секунды
        return () => clearTimeout(timer);
    };

    // Обработчик кнопки "Назад в меню"
    const handleBackToMenu = () => {
        navigate('/'); // Возвращаемся на главную страницу
    };

    // Обработчик выбора/покупки персонажа
    const handleCharacterAction = (characterType) => {
        if (purchasedCharacters.includes(characterType)) {
            // Если персонаж уже куплен - выбираем его
            localStorage.setItem('selectedCharacter', characterType);
            navigate('/game'); // Переходим на страницу игры
        } else {
            // Покупка персонажа
            const price = CHARACTER_PRICES[characterType];
            if (userCoins >= price) {
                // Вычитаем коины
                const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
                const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

                showUserMessage(`Поздравляем! Вы приобрели персонажа ${characterType}!`);
            } else {
                showUserMessage(`Недостаточно монет для покупки ${characterType}. Вам нужно ${price} монет.`);
            }
        }
    };

    // Данные о персонажах для удобного рендеринга
    const charactersData = [
        { type: 'geek', name: 'Geeks', img: geeksLogo, description: '0 coins' }, // Используем импортированные изображения
        { type: 'senior', name: 'GeeksPro', img: geeksProLogo, description: '300 coins' },
        { type: 'pro', name: 'GeeksStudio', img: geekStudioLogo, description: '600 coins' },
    ];

    return (
        <div className={styles.bodyBackground}>
            {/* Кнопка "Назад" */}
            <button id="backBtn" className={styles.backBtn} onClick={handleBackToMenu}>⬅ Назад в меню</button>

            {/* Модальное окно для сообщений */}
            {showMessage && (
                <div className={styles.messageBox}>
                    <p>{message}</p>
                </div>
            )}

            <div className={styles.centerCharacters}>
                <h1>🎮 Выбор персонажа</h1>
                {/* Отображение монет пользователя */}
                <div className={styles.coinsDisplay}>💰 {userCoins} coins</div>
                <hr className={styles.hr} /> {/* Используем класс для стилизации hr */}
                <div className={styles.characterGrid}>
                    {charactersData.map((char) => {
                        const isLocked = !purchasedCharacters.includes(char.type) && userCoins < CHARACTER_PRICES[char.type];
                        const isPurchased = purchasedCharacters.includes(char.type);
                        const buttonText = isPurchased ? 'Выбрать' : (isLocked ? 'Заблокировано' : `Купить за ${CHARACTER_PRICES[char.type]} 💰`);

                        return (
                            <div
                                key={char.type}
                                className={`${styles.characterItem} ${isLocked ? styles.locked : ''}`}
                                data-character={char.type}
                            >
                                <img src={char.img} alt={char.name} />
                                <h3>{char.name}</h3>
                                <p className={styles.cardPrice}>{char.description}</p>
                                <div className={styles.characterBtnDiv}>
                                    <button
                                        className={styles.selectBtn}
                                        onClick={() => handleCharacterAction(char.type)}
                                        disabled={isLocked && !isPurchased} // Кнопка отключена, если заблокирована и не куплена
                                    >
                                        {buttonText}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CharacterPage;

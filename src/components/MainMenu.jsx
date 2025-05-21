// src/components/MainMenu.js
import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/MainMenu.module.scss';

function MainMenu() {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate('/game');
    };

    const handleGoToRecords = () => {
        navigate('/records');
    };

    const handleCharacterSelection = () => {
        navigate('/character');
    };

    return (
        <div className={styles.bodyBackground}>
            <div className={styles.menuContainer}>
                <h1 className={styles.gameTitle}>FlappyGeek</h1>
                <h3 className={styles.geekChill}>Cделано командой Geekchill</h3>
                <div className={styles.inst}>
                    <a href="https://www.instagram.com/zhumnzarovass/" target="_blank"
                       rel="noopener noreferrer">zhumnzarovass</a>
                    <span>&#9672;</span>
                    <a href="https://www.instagram.com/cls.clover/" target="_blank"
                       rel="noopener noreferrer">cls.clover</a>
                    <span>&#9672;</span>
                    <a href="https://www.instagram.com/rzakirov1/" target="_blank"
                       rel="noopener noreferrer">rzakirov1</a>
                </div>
                <div className={styles.menuButtons}>
                    <button onClick={handleStartGame}>🎮 Старт игры</button>
                    <button onClick={handleGoToRecords}>🏆 Таблица лидеров</button>
                </div>
            </div>
            <div className={styles.characterBtnDiv}>
                <button onClick={handleCharacterSelection}>👤 Выбор персонажа</button>
            </div>
        </div>
    );
}

export default MainMenu;
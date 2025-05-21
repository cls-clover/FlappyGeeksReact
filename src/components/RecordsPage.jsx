// src/components/RecordsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/RecordsPage.module.scss'; // Импортируем SCSS-модуль

function RecordsPage() {
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        // Анимация появления кнопки "Назад"
        document.body.classList.add(styles.loaded);

        // Получаем данные лидерборда из localStorage
        const storedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        // Сортируем данные по очкам в убывающем порядке
        storedLeaderboard.sort((a, b) => b.score - a.score);
        setLeaderboardData(storedLeaderboard);

        // Очистка класса при размонтировании компонента
        return () => {
            document.body.classList.remove(styles.loaded);
        };
    }, []); // Пустой массив зависимостей означает, что эффект запустится один раз при монтировании

    // Обработчик кнопки "Назад в меню"
    const handleBackToMenu = () => {
        navigate('/'); // Возвращаемся на главную страницу
    };

    // Медали для первых трех мест
    const medals = ["🥇", "🥈", "🥉"];

    return (
        <div className={styles.bodyBackground}>
            {/* Кнопка "Назад" */}
            <button id="backBtn" className={styles.backBtn} onClick={handleBackToMenu}>⬅ Назад в меню</button>

            <h1 className={styles.h1}>🏆 Лидерборд</h1>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th className={styles.th}>Место</th>
                    <th className={styles.th}>Имя</th>
                    <th className={styles.th}>Телефон</th>
                    <th className={styles.th}>Очки</th>
                    <th className={styles.th}>Коины</th>
                </tr>
                </thead>
                <tbody>
                {leaderboardData.map((user, index) => (
                    <tr key={index} className={styles.tr}> {/* Используем index как key, если нет уникального ID */}
                        <td className={styles.td}>{medals[index] || (index + 1)}</td>
                        <td className={styles.td}>{user.name}</td>
                        <td className={styles.td}>{user.phone}</td>
                        <td className={styles.td}>{user.score}</td>
                        <td className={styles.td}>{user.coins || 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default RecordsPage;

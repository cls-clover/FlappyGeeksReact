// src/components/RecordsPage.js
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/RecordsPage.module.scss';

function RecordsPage() {
    const navigate = useNavigate();
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        document.body.classList.add(styles.loaded);

        const storedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
        storedLeaderboard.sort((a, b) => b.score - a.score);
        setLeaderboardData(storedLeaderboard);

        return () => {
            document.body.classList.remove(styles.loaded);
        };
    }, []);

    const handleBackToMenu = () => {
        navigate('/');
    };

    const medals = ["🥇", "🥈", "🥉"];

    return (
        <div className={styles.bodyBackground}>
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
                    <tr key={index} className={styles.tr}>
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

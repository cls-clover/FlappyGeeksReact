// src/App.js
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import MainMenu from './components/MainMenu';
import RecordsPage from './components/RecordsPage';
import GamePage from './components/GamePage';

import './styles/global.scss';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainMenu/>}/>
                <Route path="/records" element={<RecordsPage/>}/>
                <Route path="/game" element={<GamePage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
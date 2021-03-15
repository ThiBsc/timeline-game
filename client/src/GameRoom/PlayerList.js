import React from 'react';

import './PlayerList.css';

const PlayerList = (props) => {
    
    return (
        <div className="player-list">
            <h2>Players</h2>
            <ul className="players list-group">
                {props.players.map((player, i) => (
                <li
                    key={i}
                    className={`list-group-item list-group-item-action py-1 ${
                    props.pseudo === player.pseudo ? "list-group-item-info" : "list-group-item-light"
                    }`}
                >
                    {
                    player.isMaster &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    </svg>
                    }
                    {player.pseudo}
                </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerList;
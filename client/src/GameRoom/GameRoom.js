import React, { useEffect, useState } from 'react';

import useGameRoom from '../useGameRoom';
import CardList from './CardList';
import PlayerList from './PlayerList';

import 'bootstrap/dist/css/bootstrap.min.css';
import './GameRoom.css';

const GameRoom = (props) => {
	const { gameId, pseudo } = props.match.params; // Gets gameId and pseudo from URL
	const {
		sendMessage,
		gameLogs,
		players,
		playedCards,
		playerCards,
		isMaster,
		isPlaying,
		winner
	} = useGameRoom(gameId, pseudo); // Creates a websocket and manages messaging
	const [selectedCard, setSelectedCard] = useState(0);
	const [displayGameInfo, setDisplayGameInfo] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  
	const handleSendShuffleMessage = () => {
	  sendMessage("shuffle");
	}

	const handleWindowSizeChange = () => {
		setIsMobile(window.innerWidth <= 600);
	}

	const playCard = (boardCardId) => {
		sendMessage(`play;${selectedCard};${boardCardId}`);
		setSelectedCard(0);
	}

	const toggleGameInfo = () => {
		setDisplayGameInfo(!displayGameInfo);
	}

	useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange);
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange);
		}
	})
  
	return (
	  <div className="game-room">
		<div className="game-info" style={{marginLeft: `${!isMobile || displayGameInfo ? '0' : '-150px'}`}}>
			<button onClick={toggleGameInfo} className="btn btn-warning form-control collapse-btn"
					style={{left: `${displayGameInfo ? '150px' : '0'}`, display: `${isMobile ? 'block' : 'none'}`}}>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
					<path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
				</svg>
			</button>
			<div className="player-container">
				<PlayerList pseudo={pseudo} players={players}/>
				<ul className="logs list-group">
					{gameLogs.map((log, i) => (
					<li	key={i}	className={"list-group-item list-group-item-action list-group-item-secondary py-1"}>
						{log}
					</li>
					))}
				</ul>
				{ isMaster ?
					<button onClick={handleSendShuffleMessage} className="btn btn-secondary form-control">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
							<path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
							<path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
						</svg>
						&nbsp;Shuffle
					</button>
					: null
				}
			</div>
		</div>
		<div className="game-board">
			<h1 className="room-name">Room: {gameId}</h1>
			<CardList
				cards={playedCards}
				showSolution={true}
				canPlay={!winner && isPlaying && playerCards.length}
				playCard={playCard}/>

			<div className="player-card">
				<CardList
					cards={playerCards}
					showSolution={false}
					canPlay={!winner && isPlaying}
					selectCard={setSelectedCard}
					selectedCard={selectedCard}/>
			</div>
			{ winner ?
				<div className="winner">
					<span>{winner.pseudo}</span><br/> won this game !
				</div>
				: null
			}
		</div>
	  </div>
	);
};
		
export default GameRoom;
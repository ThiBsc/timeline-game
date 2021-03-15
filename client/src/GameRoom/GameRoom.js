import React from 'react';

import useGameRoom from '../useGameRoom';
import CardList from './CardList';
import PlayerList from './PlayerList';

import 'bootstrap/dist/css/bootstrap.min.css';
import './GameRoom.css';

const GameRoom = (props) => {
	const { gameId, pseudo } = props.match.params; // Gets gameId and pseudo from URL
	const {
		sendMessage,
		players,
		playedCards,
		playerCards,
		isMaster
	} = useGameRoom(gameId, pseudo); // Creates a websocket and manages messaging
  
	const handleSendShuffleMessage = () => {
	  sendMessage("shuffle");
	};
  
	return (
	  <div className="game-room">
		<div className="game-info">
			<div className="player-container">
				<PlayerList pseudo={pseudo} players={players}/>
				{ isMaster ?
					<button onClick={handleSendShuffleMessage} className="btn btn-secondary form-control">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
							<path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
							<path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
						</svg>
					</button>
					: null
				}
			</div>
		</div>
		<div className="game-board">
			<h1 className="room-name">Room: {gameId}</h1>
			<CardList cards={playedCards} showSolution={true}/>

			<div className="player-card">
				<CardList cards={playerCards}/>
			</div>
		</div>
	  </div>
	);
};
		
export default GameRoom;
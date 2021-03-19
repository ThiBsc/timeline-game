const cards = require("./Cards");

const server = require("http").createServer();
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});

const PORT = 4000;
const NEW_MASSAGE_EVENT = "newMessageEvent";
const PLAYER_EVENT = 'playerEvent';
const PLAYED_CARD_EVENT = 'cardPlayedEvent';
const PLAYER_CARD_EVENT = 'cardPlayerEvent';
const WINNER_EVENT = 'winnerEvent';

let roomPlayers = {};
let deckCards = [
	...cards.monument.map(c => { c.category = 'monument'; return c; }),
	...cards.invention.map(c => { c.category = 'invention'; return c; }),
	...cards.discovery.map(c => { c.category = 'discovery'; return c; })
];

shuffle = (a) => {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

dispatchCards = (roomId, cardPerPlayer) => {
	let room = roomPlayers[roomId];
	let cards = room.cards;
	// Get all player and played card back to the deck
	cards = cards.concat(room.playedCards);

	room.playedCards = [];
	room.players.forEach(p => {
		cards = cards.concat(p.cards);
		p.cards = [];
	});

	cards = shuffle(cards);
	room.playedCards.push(cards.shift());
	for (let i = 0; i < cardPerPlayer; i++) {
		// Dispatch the deck to players
		room.players.forEach(p => {
			p.cards.push(cards.shift());
		});
	}
	room.cards = cards;
}

io.on("connection", (socket) => {

	// Join a room
	const { roomId, pseudo } = socket.handshake.query;
	socket.join(roomId);

	// Init or update the room
	if (roomPlayers[roomId] === undefined) {
		// The deck
		let deck = [...deckCards];
		// Random starting card
		let index = Math.floor(Math.random() * deck.length);
		let playedCards = [...deck.splice(index, 1)];

		roomPlayers[roomId] = {
			players: [{ pseudo: pseudo, isMaster: true, id: socket.id, cards: [], isPlaying: false }],
			playedCards: playedCards,
			cards: deck
		};
	} else {
		roomPlayers[roomId].players = [...roomPlayers[roomId].players, {
			pseudo: pseudo, isMaster: false, id: socket.id, cards: [], isPlaying: false
		}];
	}

	console.log("connection", roomId, pseudo);
	// Send the new list of players to all
	io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
	// Send room info to the new player
	io.to(socket.id).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);

	// Listen for new messages
	socket.on(NEW_MASSAGE_EVENT, (data) => {
		console.log("action message", data);
		if (data.action === 'shuffle') {
			// Shuffle and give card to every players in the room
			let playerCount = roomPlayers[roomId].players.length;
			let cardPerPlayer = playerCount <= 3 ? 6 : (playerCount <= 5 ? 5 : 4);
			dispatchCards(roomId, cardPerPlayer);
			roomPlayers[roomId].players.forEach(p => {
				//console.log(p.id);
				p.isPlaying = false;
				io.to(p.id).emit(PLAYER_CARD_EVENT, p.cards);
			});
			// Send the beggining card to everyone
			io.in(roomId).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);
			// Which player start the game ?
			let nPlayers = roomPlayers[roomId].players.length;
			roomPlayers[roomId].players[Math.floor(Math.random() * nPlayers)].isPlaying = true;
			io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
			io.in(roomId).emit(WINNER_EVENT, null);
		} else if (/^play;\d+;\d+/.test(data.action)) {
			// The player is guessing a card
			let playerIndex = roomPlayers[roomId].players.findIndex(p => p.id === data.senderId);
			let currentPlayer = roomPlayers[roomId].players[playerIndex];
			let move = data.action.split(';');
			move.shift();
			move = move.map(value => +value);
			let playerPos = move[0];
			let boardPos = move[1];
			// Move the player card and test if it is correct
			let playerCard = currentPlayer.cards.splice(playerPos, 1)[0];
			let boardCards = roomPlayers[roomId].playedCards;
			let goodAnswer = false;
			if (boardPos === 0) {
				//console.log(`${playerCard.intSolution} <= ${boardCards[boardPos].intSolution}`);
				goodAnswer = (playerCard.intSolution <= boardCards[boardPos].intSolution);
			} else if (boardPos === boardCards.length) {
				//console.log(`${playerCard.intSolution} >= ${boardCards[boardPos-1].intSolution}`);
				goodAnswer = (playerCard.intSolution >= boardCards[boardPos - 1].intSolution);
			} else {
				//console.log(`${boardCards[boardPos-1].intSolution} <= ${playerCard.intSolution} <= ${boardCards[boardPos].intSolution}`);
				goodAnswer = (boardCards[boardPos - 1].intSolution <= playerCard.intSolution &&
					playerCard.intSolution <= boardCards[boardPos].intSolution);
			}
			if (goodAnswer) {
				// Put the card in the played card
				boardCards.splice(boardPos, 0, playerCard);
			} else {
				// Put the card back in the deck and give another card to the current player
				roomPlayers[roomId].cards.push(playerCard);
				currentPlayer.cards.push(roomPlayers[roomId].cards.shift());
			}
			let message = `${goodAnswer ? '✅' : '❌'} ${currentPlayer.pseudo}, ${playerCard.name}${goodAnswer ? '' : ` (${playerCard.solution})`}`;
			io.in(roomId).emit(NEW_MASSAGE_EVENT, message);
			if (goodAnswer && currentPlayer.cards.length === 0) {
				// we have a winner
				io.in(roomId).emit(WINNER_EVENT, currentPlayer);
				io.in(roomId).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);
			} else {
				// give the turn to the next player and send the turn update
				currentPlayer.isPlaying = false;
				if (playerIndex + 1 === roomPlayers[roomId].players.length) {
					playerIndex = -1;
				}
				roomPlayers[roomId].players[playerIndex + 1].isPlaying = true;
				io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
				if (goodAnswer) {
					io.in(roomId).emit(PLAYED_CARD_EVENT, roomPlayers[roomId].playedCards);
				}
				io.to(data.senderId).emit(PLAYER_CARD_EVENT, currentPlayer.cards);
			}
		}
	});

	// Leave the room if the user closes the socket
	socket.on("disconnect", () => {
		console.log("disconnect", roomId, pseudo);
		// Find the leaving player
		let leavingPlayer = roomPlayers[roomId].players.find(p => p.id === socket.id);
		// Remove it
		roomPlayers[roomId].players = roomPlayers[roomId].players.filter(p => p.id !== socket.id);
		// Put back the player card in the deck
		roomPlayers[roomId].cards = [...roomPlayers[roomId].cards, ...leavingPlayer.cards];
		// If the room is empty, delete
		if (roomPlayers[roomId].players.length === 0) {
			delete roomPlayers[roomId];
		} else {
			// If the leaving player is the master, change it
			if (leavingPlayer.isMaster) {
				roomPlayers[roomId].players[0]["isMaster"] = true;
			}
			io.in(roomId).emit(PLAYER_EVENT, roomPlayers[roomId].players);
		}
		socket.leave(roomId);
	});
});

server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

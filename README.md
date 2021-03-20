# React Timeline Game

This is a timeline game in React

## How to test

```sh
git clone https://github.com/thibsc/timeline-game
cd timeline-game

# client side
cd client
npm start

# server side
cd server
node timelineGameServer.js
```

## Cards

The file `server/Cards.json` contains the description of the cards in this format

```json
{
    "monument": [
        {
            "name": "Taj Mahal",
            "imgUrl": "https://you_image.jpg",
            "solution": "1631",
            "intSolution": 1631,
            "dateSource": "Unesco"
        },
        ...
    ],
    "other_category": []
}
```
To add a card to the game, you just have to add a json object in the list of your wanted category.


import React from 'react';

import Card from './Card';

const CardList = ({cards, showSolution, canPlay, playCard, selectCard, selectedCard}) => {
    
    return (
        <div className="cards">
            {
                cards.map( (card, index) => {
                    return <Card
                            key={index}
                            index={index}
                            canPlay={canPlay}
                            playCard={playCard}
                            selectCard={selectCard}
                            selectedCard={selectedCard}
                            showSolution={showSolution}
                            {...card}/>
                })
            }
        </div>
    );
};

export default CardList;
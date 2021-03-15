import React from 'react';

import Card from './Card';

const CardList = (props) => {
    
    return (
        <div className="cards">
            {
                props.cards.map( (card, index) => {
                    return <Card
                            key={index}
                            showSolution={props.showSolution}
                            {...card}/>
                })
            }
        </div>
    );
};

export default CardList;
import React from 'react';

import './Card.css';

const Card = ({index, name, solution, imgUrl, category, showSolution, canPlay, playCard, selectCard, selectedCard}) => {

    const handleCardSelection = (event) => {
        selectCard(index);
    }
    
    return (
        <div className="card">
            { canPlay && !showSolution ?
                <input type="radio" name="myCard" onChange={handleCardSelection} checked={index===selectedCard}/>
                : null
            }
            <div className="card-body">
                <img src={imgUrl} alt={name}/>
            </div>
            <div className={`card-footer ${category}`} title={category}>
                {name}
            </div>
            <div className="card-solution">
                {showSolution && solution}
            </div>
            { canPlay && showSolution ?
                <div className="card-button">
                    <button className="left-button" onClick={() => playCard(index)}>
                        &lt;
                    </button>
                    <button className="right-button" onClick={() => playCard(index+1)}>
                        &gt;
                    </button>
                </div>
                : null
            }
        </div>
    );
};
		
export default Card;
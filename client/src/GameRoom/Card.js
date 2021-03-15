import React from 'react';

import './Card.css';

const Card = (props) => {

    return (
        <div className="card">
            <div className="card-body">
                <img src={props.imgUrl} alt={props.imgAlt}/>
            </div>
            <div className="card-footer">
                {props.name}
            </div>
            <div className="card-solution">
                {props.showSolution && props.solution}
            </div>
        </div>
    );
};
		
export default Card;
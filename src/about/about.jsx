import React, { useState, useEffect } from 'react';

export function About() {
  const [cardPrice, setCardPrice] = useState(null);

  useEffect(() => {
    // Placeholder for Scryfall API call
    const fetchCardPrice = async () => {
      const cardName = "Black Lotus"; 
      const value = 1000000; 

      

      setCardPrice(`The ${cardName} card is worth $${value} today.`);
      console.log('API placeholder executed');
    };

    fetchCardPrice();

  }, []); 
  return (
    <main className="bg-secondary text-light" style={{ lineHeight: 1.3 }}>
      <div className="container text-center my-4">
        <img src="magic.png" className="img-fluid" alt="Table Top Tracker" style={{ maxHeight: '200px' }} />
      </div>
      
      <div className="container py-4">
        <h1 className="text-center mb-3">About Table Top Tracker</h1>
        <p className="lead">
          Table Top Tracker is a free online service with the goal of making all board games easier to play by keeping
          track of all the moving parts in your game. Say goodbye to flimsy cards and small pieces, 
          with Table Top Tracker you can streamline your physical pieces and never lose another brick card again.
        </p>

        {/* Display the placeholder API result */}
        {cardPrice && (
          <div className="alert alert-info mt-4 text-center">
            {cardPrice}
          </div>
        )}
      
      </div>
      
      <div className="text-center my-3">
        <a href="/" className="btn btn-primary">Return to Home</a>
      </div>
    </main>
  );
}

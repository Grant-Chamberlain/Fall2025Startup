import React from 'react';

export function About() {
  return (
    <main className="bg-secondary text-light" style={{lineHeight: 1.3}}>
      <img src="magic.png"  />
      <div className="container">
        <p className="mb-0">
          Table Top Tracker is a free online service with the goal of making all board games easier to play by keeping
          track of all the moving parts in your game. Say goodbye to flimsy cards and small pieces, 
          with Table Top Tracker you can streamline your physical pieces and never lose another brick card again.
        </p>
      </div>
      
    </main>
  );
}
# A New Perspective on Health

[My Notes](notes.md)

This website functions as a tracker for health points and other counters used in board games or card games. It will be accessible by anyone playing from their devices so no one has to sacrifice their phone to track life totals.


> [!NOTE]
>  If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

## 🚀 Specification Deliverable


For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

If you like to play table top games with friends you have probably used an app to track points or life totals. While it can be convenient to track the numbers online there is always someone sacrificing their device so everyone can see tally. Our website aims to resolve this struggle by hosting live updates to your point tracking. While playing the game anyone present can check in on their device to see the health points, energy counters, or resources available. Now no one needs to give up their phone priviliges to enjoy an easy and efficient board game!

### Design

![Design image](Webdesign.png)


There are a lot of moving pieces to create a tracker for multiple games. Our simple design is made to track the needed counters for up to 6 players. Expansions are on the way for more games and more styles.


### Key features

- Easy Interface to quickly adjust life counts and other tallies in real time
- Live update to all devices so no one has to give up their phone to display the values
- History of games to remember who won and how often 

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - I will use html to display multiple number trackers that are easy to change and quick to refresh
- **CSS** - I will use CSS to make the displays of each player very easy to see and fun to customize
- **React** - I will use react to make it easy to adjust counters and change values 
- **Service** - Used to authenticate users to ensure the data stored is accurate for their games played
- **DB/Login** - DB/Logio will be used to save data for each game the host has played and who has won each game. 
- **WebSocket** - Websocket will be used to update each individual device that is connecting to the current game.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Server deployed and accessible with custom domain name** - [My server link](https://tabletoptracker.click).

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **HTML pages** - Ic reated pages for each part of my website in HTML
- [x] **Proper HTML element usage** - I used each tag correctly for my tables, nav, headers, and footers, etc.
- [x] **Links** - I have links connecting my pages together
- [x] **Text** - I have text explaining each page and for each input 
- [x] **3rd party API placeholder** - I have 4 spaces for API input on my Life Counts page
- [x] **Images** - I am using an API to recieve inamges in 4 places
- [x] **Login placeholder** - My login placeholder is in the home page
- [x] **DB data placeholder** - I have a data place holder on my join a room page to keep a database of online clients
- [x] **WebSocket placeholder** - I have 4 spots for weebsocket interaction for life counts on my life counts page

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] **Header, footer, and main content body** - I implemented the bootstrap stylings for all sections of my site.
- [x] **Navigation elements** - I modeled my navbar after the simon.css example
- [x] **Responsive to window resizing** - I modeled my rezising after the simon example
- [x] **Application elements** - I added a bootstrap grid where I will later have the backend updates sent to clients
- [x] **Application text content** - I resized and formatted the texts to for the pages
- [x] **Application images** - I applied my image location to the bootsrap grid I created.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - I did not complete this part of the deliverable.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.


## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.

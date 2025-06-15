# League of Legends Team Distributor

A modern web application that creates fair and balanced teams for League of Legends games, supporting up to 30 players with intelligent team distribution algorithms.

## Features

- 🎮 **Fair Team Distribution**: Advanced algorithm that prioritizes team balance first, then position preferences
- 👥 **Up to 30 Players**: Support for large group games and tournaments
- 🏆 **Tier System**: Full League of Legends tier support (Iron to Master+)
- 🎯 **Position Preferences**: Multiple position preferences with priority ordering
- ⚡ **Advanced Tiers**: Different skill levels for different positions
- 💾 **Persistent Storage**: LocalStorage caching for player data
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS
- 🔥 **Firebase Ready**: Optimized for Firebase hosting

## Live Demo

*Deploy to Firebase to get your live demo URL*

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lol-team-distributor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## Usage

### Adding Players

1. **Basic Mode**: Enter name, tier, and preferred position
2. **Advanced Mode**: 
   - Select multiple position preferences in order
   - Set different tiers for different positions
   - Example: Main tier Gold, but Silver for Jungle/Top

### Generating Teams

1. Add at least 10 players (minimum for 2 teams)
2. Select number of teams (2-6 teams depending on player count)
3. Click "Generate Fair Teams"
4. View balanced teams with skill analysis

### Team Balance Algorithm

The algorithm considers:
- **Primary**: Overall team skill balance
- **Secondary**: Position preference satisfaction
- **Tertiary**: Position-specific skill ratings

## Firebase Deployment

### Setup Firebase Project

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Create a new project** at [Firebase Console](https://console.firebase.google.com)

4. **Initialize Firebase in your project**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Set up automatic builds: No

5. **Update .firebaserc**
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

### Deploy

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Access your live site**
   ```
   https://your-project-id.web.app
   ```

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage (browser)
- **Hosting**: Firebase Hosting
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── PlayerForm.jsx      # Add/edit player form
│   ├── PlayerList.jsx      # Display player list
│   └── TeamDisplay.jsx     # Show generated teams
├── utils/
│   ├── teamDistribution.js # Team balancing algorithm
│   └── storage.js          # localStorage utilities
├── App.jsx                 # Main application
├── main.jsx               # React entry point
└── index.css              # Global styles
```

## Algorithm Details

### Team Distribution

The algorithm uses a greedy approach optimized for fairness:

1. **Skill Calculation**: Convert tiers to numerical values (Iron=1 to Master+=8)
2. **Position-Specific Skills**: Use advanced tiers if available
3. **Team Assignment**: Minimize skill variance between teams
4. **Position Assignment**: Satisfy preferences while maintaining balance

### Balance Scoring

- **Perfect Balance**: 100/100 (identical team skills)
- **Good Balance**: 80-99/100 (minor differences)
- **Fair Balance**: 60-79/100 (acceptable differences)
- **Poor Balance**: <60/100 (significant imbalance)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for your tournaments and events!

## Support

For issues or feature requests, please create an issue in the repository.

---

**Made for the League of Legends community** 🎮⚔️ 
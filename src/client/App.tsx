import { useState, useEffect } from 'react';
import { Player, Boss, ActionType } from '../shared/types';
import { CLASSES, YOKAI } from '../shared/constants';
import './App.css';

type Screen = 'splash' | 'loading' | 'create' | 'hub' | 'battle' | 'results';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash'); // Changed from 'loading'
  const [showSplash, setShowSplash] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [boss, setBoss] = useState<Boss | null>(null);

  const [battleResult, setBattleResult] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    if (!showSplash) {
      setScreen('loading');
      fetch('/api/init')
        .then(res => res.json())
        .then(data => {
          console.log('Init data:', data);
          setPlayer(data.player);
          setBoss(data.boss);

          if (data.player) {
            setScreen('hub');
          } else {
            setScreen('create');
          }
        })
        .catch(err => {
          console.error('Init error:', err);
          alert('Failed to load game');
        });
    }
  }, [showSplash]);



  // Create character
  const handleCreateCharacter = async (name: string, playerClass: keyof typeof CLASSES) => {
    try {
      const res = await fetch('/api/character/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, class: playerClass })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to create character');
        return;
      }

      const data = await res.json();
      setPlayer(data.player);
      setScreen('hub');
    } catch (err) {
      console.error('Create character error:', err);
      alert('Failed to create character');
    }
  };



  // Battle
  const handleBattle = async (actions: [ActionType, ActionType, ActionType]) => {
    try {
      const res = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions })
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Battle failed');
        return;
      }

      const data = await res.json();
      setPlayer(data.player);
      setBoss(data.boss);
      setBattleResult(data.result);
      setScreen('results');
    } catch (err) {
      console.error('Battle error:', err);
      alert('Battle failed');
    }
  };

  // LOADING SCREEN
  if (screen === 'loading') {
    return (
      <div className="app loading">
        <h1>⛩️ Yokai Slayers ⛩️</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // SPLASH SCREEN
  if (screen === 'splash' && showSplash) {
    return <SplashScreen onStart={() => setShowSplash(false)} />;
  }

  // CHARACTER CREATION SCREEN
  if (screen === 'create') {
    return <CharacterCreation onCreate={handleCreateCharacter} />;
  }

  // MAIN HUB SCREEN
  if (screen === 'hub' && player && boss) {
    return (
      <Hub
        player={player}
        boss={boss}
        onBattle={() => setScreen('battle')}
      />
    );
  }

  // BATTLE SCREEN
  if (screen === 'battle' && player && boss) {
    return (
      <Battle
        player={player}
        boss={boss}
        onComplete={handleBattle}
        onBack={() => setScreen('hub')}
      />
    );
  }

  // RESULTS SCREEN
  if (screen === 'results' && battleResult) {
    return (
      <Results
        result={battleResult}
        boss={boss!}
        onContinue={() => setScreen('hub')}
      />
    );
  }

  return <div className="app">Error: Invalid state</div>;
}

// ============================================
// CHARACTER CREATION COMPONENT
// ============================================
function CharacterCreation({ onCreate }: { onCreate: (name: string, playerClass: keyof typeof CLASSES) => void }) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<keyof typeof CLASSES | null>(null);

  return (
    <div className="app character-creation">
      <h1>⛩️ Create Your Warrior ⛩️</h1>

      <div className="name-input">
        <label>Warrior Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </div>

      <div className="class-selection">
        {(Object.keys(CLASSES) as Array<keyof typeof CLASSES>).map((key) => {
          const classData = CLASSES[key];
          return (
            <div
              key={key}
              className={`class-card ${selectedClass === key ? 'selected' : ''}`}
              onClick={() => setSelectedClass(key)}
            >
              <h2>{classData.name}</h2>
              <h3>{classData.nameJP}</h3>
              <div className="stats">
                <div>HP: {classData.maxHP}</div>
                <div>ATK: {classData.baseAttack}</div>
                <div>DEF: {classData.baseDefense}</div>
              </div>
              <div className="special">
                <strong>Special:</strong> {classData.special.name}
                <br />
                <small>{classData.special.nameJP}</small>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="create-button"
        onClick={() => selectedClass && name && onCreate(name, selectedClass)}
        disabled={!selectedClass || !name}
      >
        Begin Your Journey
      </button>
    </div>
  );
}

// ============================================
// HUB COMPONENT (with Leaderboard)
// ============================================
function Hub({ player, boss, onBattle }: { player: Player; boss: Boss; onBattle: () => void }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showYokaiGallery, setShowYokaiGallery] = useState(false);

  const isAIYokai = boss.type === 'ai_generated';
  const yokaiData = isAIYokai ? null : YOKAI[boss.type as keyof typeof YOKAI];
  const yokaiName = boss.name || yokaiData?.name || 'Unknown Yokai';
  const yokaiNameJP = boss.nameJP || yokaiData?.nameJP || '';
  const yokaiDescription = boss.description || yokaiData?.description || '';

  const hpPercent = (boss.currentHP / boss.maxHP) * 100;
  const attemptsLeft = 3 - player.attemptsToday;

  const handleReset = async () => {
    await fetch('/api/admin/clear-all', { method: 'POST' });
  };

  // Load leaderboard
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
      })
      .catch(err => console.error('Leaderboard error:', err));
  }, []);

  return (
    <div className="app hub">
      <h1>⛩️ Yokai Slayers ⛩️</h1>

      {/* Today's Yokai */}
      <div className="yokai-display">
        <h2>Today's Yokai</h2>
        <div className="yokai-card">
          {/* Show yokai image - either AI-generated or static */}
          <img
            src={boss.imageUrl || yokaiData?.imageUrl || '/default-icon.png'}
            alt={yokaiName}
            className="yokai-image-hub"
            onError={(e) => {
              console.error('Failed to load yokai image:', boss.imageUrl || yokaiData?.imageUrl);
              // Try fallback image
              if (e.currentTarget.src !== '/default-icon.png') {
                e.currentTarget.src = '/default-icon.png';
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
            onLoad={() => {
              console.log('Successfully loaded yokai image:', boss.imageUrl || yokaiData?.imageUrl);
            }}
          />

          <h3>{yokaiName}</h3>
          <p className="japanese">{yokaiNameJP}</p>
          <p className="description">{yokaiDescription}</p>

          {/* Show backstory for AI yokai */}
          {boss.backstory && (
            <details className="backstory">
              <summary>📜 Read Backstory</summary>
              <p>{boss.backstory}</p>
            </details>
          )}

          <div className="hp-bar">
            <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }}></div>
            <div className="hp-bar-text">
              {boss.currentHP.toLocaleString()} / {boss.maxHP.toLocaleString()} HP
            </div>
          </div>

          <p className="participants">⚔️ {boss.totalParticipants} Warriors Fighting</p>

          {boss.defeatedAt && (
            <div className="victory-section">
              <p className="defeated-banner">🎉 BOSS DEFEATED! 🎉</p>
              <p className="victory-text">The {yokaiName} has been vanquished!</p>
              <p className="victory-text">The subreddit celebrates your victory!</p>
              <p className="victory-bonus">+500 XP Victory Bonus awarded to all warriors!</p>
              <p className="next-boss">⏰ Next yokai spawns tomorrow at midnight UTC</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Info */}
      <div className="player-info">
        <h3>{player.name}</h3>
        <p>Level {player.level} {CLASSES[player.class].name}</p>
        <p>⚔️ {player.attack} | 🛡️ {player.defense} | ❤️ {player.maxHP}</p>
        <p className="xp">XP: {player.xp}</p>
      </div>

      {/* Battle Button */}
      <div className="battle-section">
        <p className="attempts">Attempts Remaining: {attemptsLeft} / 3</p>
        <button
          className="battle-button"
          onClick={onBattle}
          disabled={attemptsLeft === 0 || boss.defeatedAt !== null}
        >
          {boss.defeatedAt ? '✓ Boss Defeated!' :
            attemptsLeft > 0 ? '⚔️ BATTLE!' : '✓ Come Back Tomorrow'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="hub-actions">
        <button
          className="leaderboard-toggle"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? '📊 Hide Leaderboard' : '📊 Show Leaderboard'}
        </button>

        <button
          className="yokai-gallery-toggle"
          onClick={() => setShowYokaiGallery(!showYokaiGallery)}
        >
          {showYokaiGallery ? '👹 Hide Yokai Gallery' : '👹 View All Yokai'}
        </button>
      </div>

      <button
        className="reset-button"
        onClick={handleReset}
        style={{
          background: '#8B0000',
          border: '2px solid #DC143C',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
          fontSize: '14px'
        }}
      >
        🗑️ Reset My Data (Testing)
      </button>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="leaderboard">
          <h2>🏆 Top Warriors Today 🏆</h2>
          {leaderboard.length === 0 ? (
            <p>No warriors yet. Be the first!</p>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`leaderboard-entry ${entry.userId === player.userId ? 'current-player' : ''}`}
                >
                  <span className="rank">#{entry.rank}</span>
                  <span className="name">{entry.username}</span>
                  <span className="damage">{entry.damage.toLocaleString()} dmg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yokai Gallery */}
      {showYokaiGallery && (
        <div className="yokai-gallery">
          <h2>👹 Legendary Yokai 👹</h2>
          <p className="gallery-description">Discover the mythical creatures that roam the realm</p>
          <div className="yokai-grid">
            {(Object.keys(YOKAI) as Array<keyof typeof YOKAI>).map((yokaiKey) => {
              const yokai = YOKAI[yokaiKey];
              const isCurrentBoss = boss.type === yokaiKey;
              return (
                <div
                  key={yokaiKey}
                  className={`yokai-gallery-card ${isCurrentBoss ? 'current-boss' : ''}`}
                >
                  <img
                    src={yokai.imageUrl || '/default-icon.png'}
                    alt={yokai.name}
                    className="yokai-gallery-image"
                    onError={(e) => {
                      console.error('Failed to load gallery yokai image:', yokai.imageUrl);
                      // Try fallback image
                      if (e.currentTarget.src !== '/default-icon.png') {
                        e.currentTarget.src = '/default-icon.png';
                      } else {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  />
                  <div className="yokai-gallery-info">
                    <h3>{yokai.name}</h3>
                    <p className="japanese">{yokai.nameJP}</p>
                    <p className="yokai-stats">
                      ❤️ {yokai.hp.toLocaleString()} HP | 🛡️ {yokai.defense} DEF
                    </p>
                    <p className="yokai-description">{yokai.description}</p>
                    {isCurrentBoss && (
                      <div className="current-boss-badge">⚔️ TODAY'S BOSS</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BATTLE COMPONENT
// ============================================
function Battle({
  player,
  boss,
  onComplete,
  onBack
}: {
  player: Player;
  boss: Boss;
  onComplete: (actions: [ActionType, ActionType, ActionType]) => void;
  onBack: () => void;
}) {
  const [actions, setActions] = useState<ActionType[]>([]);
  const classData = CLASSES[player.class];
  const isAIYokai = boss.type === 'ai_generated';
  const yokaiData = isAIYokai ? null : YOKAI[boss.type as keyof typeof YOKAI];
  const yokaiName = boss.name || yokaiData?.name || 'Unknown Yokai';
  const yokaiNameJP = boss.nameJP || yokaiData?.nameJP || '';

  const handleAction = (action: ActionType) => {
    const newActions = [...actions, action];
    setActions(newActions);

    if (newActions.length === 3) {
      // Battle complete
      onComplete(newActions as [ActionType, ActionType, ActionType]);
    }
  };

  return (
    <div className="app battle">
      <h1>⛩️ Battle ⛩️</h1>

      <div className="yokai-enemy">
        <img
          src={boss.imageUrl || yokaiData?.imageUrl || '/default-icon.png'}
          alt={yokaiName}
          className="yokai-image-battle"
          onError={(e) => {
            console.error('Failed to load battle yokai image:', boss.imageUrl || yokaiData?.imageUrl);
            // Try fallback image
            if (e.currentTarget.src !== '/default-icon.png') {
              e.currentTarget.src = '/default-icon.png';
            } else {
              e.currentTarget.style.display = 'none';
            }
          }}
        />
        <h2>{yokaiName}</h2>
        <p className="japanese">{yokaiNameJP}</p>
      </div>

      <div className="turn-display">
        <h3>Select Action {actions.length + 1} / 3</h3>
        {actions.length > 0 && (
          <div className="selected-actions">
            {actions.map((action, i) => (
              <span key={i} className="action-badge">{action}</span>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="action attack"
          onClick={() => handleAction('attack')}
          disabled={actions.length >= 3}
        >
          <span className="icon">⚔️</span>
          <span className="label">Attack</span>
          <span className="description">Standard strike</span>
        </button>

        <button
          className="action defend"
          onClick={() => handleAction('defend')}
          disabled={actions.length >= 3}
        >
          <span className="icon">🛡️</span>
          <span className="label">Defend</span>
          <span className="description">Reduce damage</span>
        </button>

        <button
          className="action special"
          onClick={() => handleAction('special')}
          disabled={actions.length >= 3}
        >
          <span className="icon">✨</span>
          <span className="label">{classData.special.name}</span>
          <span className="description japanese">{classData.special.nameJP}</span>
        </button>
      </div>

      <button className="back-button" onClick={onBack}>← Back</button>
    </div>
  );
}

// ============================================
// RESULTS COMPONENT
// ============================================
function Results({
  result,
  boss,
  onContinue
}: {
  result: any;
  boss: Boss;
  onContinue: () => void;
}) {
  const wasKillingBlow = boss.currentHP === 0 && result.totalDamage > 0;

  return (
    <div className="app results">
      <h1>⛩️ Battle Complete! ⛩️</h1>

      <div className="result-card">
        <h2>You dealt: {result.totalDamage.toLocaleString()} damage!</h2>

        <p>+{result.xpGained} XP earned</p>

        {result.levelUp && (
          <p className="level-up">🎉 Level Up! Now Level {result.newLevel}</p>
        )}

        {result.itemDropped && (
          <p className="item-drop">🎁 Found: {result.itemDropped}</p>
        )}

        <div className="boss-status">
          <p>Boss HP: {boss.currentHP.toLocaleString()} / {boss.maxHP.toLocaleString()}</p>
          {boss.defeatedAt && (
            <div>
              <p className="defeated">⚔️ BOSS DEFEATED! ⚔️</p>
              {wasKillingBlow && (
                <p className="killing-blow">🗡️ YOU LANDED THE KILLING BLOW! 🗡️</p>
              )}
              <p className="victory-bonus-notice">+500 XP Victory Bonus awarded!</p>
            </div>
          )}
        </div>
      </div>

      <button className="continue-button" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

// ============================================
// SPLASH SCREEN COMPONENT
// ============================================
function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img
          src="https://preview.redd.it/yokai-images-v0-71bbcd98kvxf1.jpg?width=1080&crop=smart&auto=webp&s=e8a24f22f98221342d7dc78b87db2ca34b146211"
          alt="Yokai Slayers"
          className="splash-title-image"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = document.querySelector('.splash-title-fallback');
            if (fallback) fallback.classList.remove('hidden');
          }}
        />

        {/* Fallback text titles (hidden by default) */}
        <div className="splash-title-fallback hidden">
          <h1 className="splash-title">⛩️</h1>
          <h1 className="splash-title-main">Yokai Slayers</h1>
          <h2 className="splash-subtitle">妖怪討伐</h2>
        </div>

        <div className="splash-description">
          <p>Ancient yokai have awakened across Japan.....</p>
          <p>Join forces with warriors from across Reddit</p>
          <p>to defeat legendary creatures of myth!</p>
        </div>

        <button className="splash-start-button" onClick={onStart}>
          ⚔️ Begin Your Journey ⚔️
        </button>

        <div className="splash-features">
          <div className="splash-feature">🎮 Turn-Based Combat</div>
          <div className="splash-feature">👥 Community Boss Battles</div>
          <div className="splash-feature">🏆 Daily Leaderboards</div>
        </div>
      </div>
    </div>
  );
}
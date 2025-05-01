// src/game/GameEngine/GameEngine.tsx

import { useEffect, useState } from 'react';
import { getArea, Area, getMapData, setMapData } from '../map/map';
import Inventory from '../inventory/Inventory';
import { LootItem } from '../loot/index';
import StatPanel from '../ui/StatPanel';
import CharacterStats from '../ui/CharacterStats';
import { Character } from '../types/characterTypes';
import CombatScreen from '../ui/CombatScreen';
import { calculateMaxHp, calculateMaxMp, calculateNextLevelXp } from './stats';
import MiniMap from '../map/MiniMap';
import CanvasArea from './CanvasArea';

interface Props {
  character: Character;
  onSwitchCharacter: () => void;
}

type DirectionKey = 'north' | 'south' | 'east' | 'west';

const GameEngine = ({ character, onSwitchCharacter }: Props) => {
  const [area, setArea] = useState<Area>(getArea(0, 0));
  const [dialog, setDialog] = useState<string | null>(null);
  const [inventory, setInventory] = useState<LootItem[]>(() => character.inventory ?? []);
  const [currentPos, setCurrentPos] = useState(character.pos ?? { x: 0, y: 0 });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [inCombat, setInCombat] = useState(false);
  const [enemyInCombat, setEnemyInCombat] = useState<any | null>(null);

  const [player, setPlayer] = useState<Character>(() => {
    const level = character.level || 1;
    const baseCharacter = { ...character, level };
    const maxHp = calculateMaxHp(baseCharacter);
    const maxMp = calculateMaxMp(baseCharacter);

    return {
      ...baseCharacter,
      xp: character.xp ?? 0,
      currentHp: character.currentHp ?? maxHp,
      currentMp: character.currentMp ?? maxMp,
    };
  });

  // Recalculate maxHp, maxMp, and nextLevelXp whenever player stats/level change
  const maxHp = calculateMaxHp(player);
  const maxMp = calculateMaxMp(player);
  const nextLevelXp = calculateNextLevelXp(player.level);

  useEffect(() => {
    setArea(getArea(currentPos.x, currentPos.y));
    if (character.map) setMapData(character.map);
  }, [character, currentPos]);

  // Effect to handle level up when XP changes
  useEffect(() => {
    const checkLevelUp = () => {
      const requiredXp = calculateNextLevelXp(player.level);
      if (player.xp >= requiredXp) {
        // Level up!
        const newLevel = player.level + 1;
        const remainingXp = player.xp - requiredXp;

        // You might want to add stat increases here based on level up
        setPlayer(prev => ({
          ...prev,
          level: newLevel,
          xp: remainingXp, // Carry over excess XP
          // Example stat increase (adjust as needed)
          strength: prev.strength + 1,
          dexterity: prev.dexterity + 1,
          intelligence: prev.intelligence + 1,
          endurance: prev.endurance + 1, // Changed from vitality back to endurance based on original code
          luck: prev.luck + 1,
          // Heal to full on level up
          currentHp: calculateMaxHp({ ...prev, level: newLevel }),
          currentMp: calculateMaxMp({ ...prev, level: newLevel }),
        }));
        setDialog(`Congratulations! You reached Level ${newLevel}!`);
        // Recursively check for multiple level ups if enough XP was gained
        checkLevelUp();
      }
    };

    checkLevelUp();
  }, [player.xp, player.level]); // Re-run this effect when player.xp or player.level changes


  const move = (dir: DirectionKey) => {
    const { x, y } = currentPos;

    const directions = {
      north: { x, y: y - 1, exit: 'north', entry: 'south' },
      south: { x, y: y + 1, exit: 'south', entry: 'north' },
      east: { x: x + 1, y, exit: 'east', entry: 'west' },
      west: { x: x - 1, y, exit: 'west', entry: 'east' },
    };

    const current = getArea(x, y);
    const { x: newX, y: newY, exit, entry } = directions[dir];
    const destination = getArea(newX, newY);

    const isBlockedFromCurrent = current.blocked?.[exit as DirectionKey];
    const isBlockedFromDestination = destination.blocked?.[entry as DirectionKey];

    if (!isBlockedFromCurrent && !isBlockedFromDestination) {
      setCurrentPos({ x: newX, y: newY });
      setArea(destination);
      setDialog(null);
    } else {
      setDialog("You can't go that way.");
    }
  };

  const handleSave = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    const saveData = {
      pos: currentPos,
      map: getMapData(),
      inventory,
      currentHp: player.currentHp, // Save current HP
      currentMp: player.currentMp, // Save current MP
      xp: player.xp, // Save XP
      level: player.level, // Save Level
    };

    await fetch('http://localhost:3001/api/users/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        characterId: player.id,
        progress: saveData,
      }),
    });

    alert('Game saved!');
  };

  const handleLoad = async () => {
    const username = localStorage.getItem('currentUser');
    if (!username) return;

    try {
      const res = await fetch(`http://localhost:3001/api/users/load/${username}`);
      const characters = await res.json();
      const updatedChar = characters.find((c: any) => c.id === player.id);

      if (updatedChar) {
        setCurrentPos(updatedChar.pos ?? { x: 0, y: 0 });
        setInventory(updatedChar.inventory ?? []);
        setMapData(updatedChar.map ?? {});
        setArea(getArea(updatedChar.pos?.x ?? 0, updatedChar.pos?.y ?? 0));

        setPlayer(prev => ({
          ...prev,
          currentHp: updatedChar.currentHp ?? prev.currentHp,
          currentMp: updatedChar.currentMp ?? prev.currentMp,
          xp: updatedChar.xp ?? prev.xp,
          level: updatedChar.level ?? prev.level,
          // Ensure other stats are loaded if they are part of the saved data
          strength: updatedChar.strength ?? prev.strength,
          dexterity: updatedChar.dexterity ?? prev.dexterity,
          intelligence: updatedChar.intelligence ?? prev.intelligence,
          endurance: updatedChar.endurance ?? prev.endurance, // Changed from vitality back to endurance
          luck: updatedChar.luck ?? prev.luck,
        }));

        setDialog('Progress loaded!');
      } else {
        alert('No saved data for this character!');
      }
    } catch (err) {
      console.error('Failed to load character data:', err);
      alert('Error loading character data');
    }
  };

  // New function to handle player healing
  const handleHealPlayer = (npcName: string) => {
    const needsHealing = player.currentHp < maxHp || player.currentMp < maxMp;

    if (needsHealing) {
      setPlayer(prev => ({
        ...prev,
        currentHp: maxHp, // Heal to max HP
        currentMp: maxMp, // Heal to max MP
      }));
      setDialog(`${npcName} heals you completely!`);
    } else {
      setDialog(`${npcName} says you look healthy already.`);
    }
  };

  // Modify onVictory to accept xpGained and finalPlayerHp
  const handleCombatVictory = (xpGained: number, finalPlayerHp: number) => {
    setInCombat(false);
    setEnemyInCombat(null);
    setArea(prev => ({
      ...prev,
      enemies: prev.enemies?.filter(e => e !== enemyInCombat)
    }));
    setDialog(`${enemyInCombat.name} defeated! You gained ${xpGained} XP.`);

    // Add XP and update player HP state
    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
      currentHp: finalPlayerHp, // Update HP with the value from combat
      // currentMp is not currently affected by combat, so no update needed here
    }));
  };


  const renderMoveButton = (dir: DirectionKey, label: string) => {
    const directionOffsets = {
      north: { x: 0, y: -1, exit: 'north', entry: 'south' },
      south: { x: 0, y: 1, exit: 'south', entry: 'north' },
      east: { x: 1, y: 0, exit: 'east', entry: 'west' },
      west: { x: -1, y: 0, exit: 'west', entry: 'east' },
    } as const;

    const { x, y } = currentPos;
    const { x: dx, y: dy, exit, entry } = directionOffsets[dir];
    const current = getArea(x, y);
    const destination = getArea(x + dx, y + dy);

    const isBlocked =
      current.blocked?.[exit] === true || destination?.blocked?.[entry] === true;

    return (
      <button
        onClick={() => move(dir)}
        disabled={isBlocked}
        style={{
          opacity: isBlocked ? 0.3 : 1,
          cursor: isBlocked ? 'not-allowed' : 'pointer'
        }}
      >
        {label}
      </button>
    );
  };

  if (inCombat && enemyInCombat) {
    return (
      <CombatScreen
        player={player}
        enemy={enemyInCombat}
        // Pass the new handleCombatVictory function
        onVictory={handleCombatVictory}
        onDefeat={async () => {
          setInCombat(false);
          setEnemyInCombat(null);
          setDialog('You were defeated, child of time... The gears of time turns in reverse...');
          await handleLoad(); // Load last saved state on defeat
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
      {showMiniMap && <MiniMap currentX={currentPos.x} currentY={currentPos.y} />}\
      <CharacterStats character={player} />

      <div>
        <h3 style={{ color: 'white', textAlign: 'center' }}>{area.name}</h3>
        <CanvasArea
          area={area}
          player={player}
          setDialog={setDialog}
          setInCombat={setInCombat}
          setEnemyInCombat={setEnemyInCombat}
          onHealPlayer={handleHealPlayer}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
          <div />
          {renderMoveButton('north', '⬆️ North')}
          <div />
          {renderMoveButton('west', '⬅️ West')}
          <div />
          {renderMoveButton('east', '➡️ East')}
          <div />
          {renderMoveButton('south', '⬇️ South')}
          <div />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={handleSave}>💾 Save</button>
          <button onClick={handleLoad}>📂 Load Game</button>
          <button onClick={onSwitchCharacter}>🔁 Switch Character</button>
          <button onClick={() => setShowMiniMap(prev => !prev)}>
            {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
        </div>

        {dialog && (
          <div style={{
            marginTop: '1rem',
            backgroundColor: '#111',
            color: '#fff',
            padding: '1rem',
            border: '2px solid #555',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '600px',
          }}>
            <p>{dialog}</p>
            <button onClick={() => setDialog(null)}>Close</button>
          </div>
        )}
      </div>

      <div style={{
        minWidth: '240px',
        color: 'white',
        backgroundColor: '#1a1a1a',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0 }}>{player.name}</h3>
        <div style={{
          width: '100%',
          height: '120px',
          backgroundColor: '#333',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <p style={{ textAlign: 'center', paddingTop: '40px', color: '#bbb' }}>Portrait</p>
        </div>
        <StatPanel
          currentHp={player.currentHp}
          maxHp={maxHp}
          currentMp={player.currentMp}
          maxMp={maxMp}
          level={player.level}
          xp={player.xp}
          nextLevelXp={nextLevelXp}
        />
        <Inventory items={inventory} onRemove={(id) => setInventory(prev => prev.filter(i => i.id !== id))} />
      </div>
    </div>
  );
};

export default GameEngine;

import { useEffect, useState, useRef } from 'react';
import { getArea, Area, getMapData, setMapData } from '../map/map';
import Inventory from '../inventory/Inventory';
import { LootItem } from '../loot/index';
import StatPanel from '../ui/StatPanel';
import CharacterStats from '../ui/CharacterStats';
import { Character } from '../types/characterTypes';
import CombatScreen from '../ui/CombatScreen';
import {
  calculateMaxHp,
  calculateMaxMp,
  calculateNextLevelXp,
  normalizeCharacter,
} from './stats';
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
  const [inventory, setInventory] = useState<LootItem[]>([]);
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [inCombat, setInCombat] = useState(false);
  const [enemyInCombat, setEnemyInCombat] = useState<any | null>(null);

  const [player, setPlayer] = useState<Character | null>(null);

  const hasLoadedOnce = useRef(false);
  const hasSyncedPlayerData = useRef(false);
  const skipNextXpEffect = useRef(false);

  useEffect(() => {
    if (!hasLoadedOnce.current) {
      handleLoad();
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    if (player && !hasSyncedPlayerData.current) {
      setArea(getArea(player.pos?.x ?? 0, player.pos?.y ?? 0));
      if (player.map) setMapData(player.map);
      setInventory(player.inventory ?? []);
      setCurrentPos(player.pos ?? { x: 0, y: 0 });
      hasSyncedPlayerData.current = true;
    }
  }, [player]);

  useEffect(() => {
    if (!player || skipNextXpEffect.current) {
      skipNextXpEffect.current = false;
      return;
    }

    setPlayer((prev) => {
      if (!prev) return null;

      let updated = { ...prev };

      while (updated.xp >= calculateNextLevelXp(updated.level)) {
        updated.xp -= calculateNextLevelXp(updated.level);
        updated.level += 1;

        updated.strength += 1;
        updated.dexterity += 1;
        updated.intelligence += 1;
        updated.endurance += 1;
        updated.luck += 1;
      }

      updated.currentHp = calculateMaxHp(updated);
      updated.currentMp = calculateMaxMp(updated);

      return updated;
    });
  }, [player?.xp]);

  const maxHp = player ? calculateMaxHp(player) : 0;
  const maxMp = player ? calculateMaxMp(player) : 0;
  const nextLevelXp = player ? calculateNextLevelXp(player.level) : 0;

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
    if (!username || !player) return;

    const saveData = {
      pos: currentPos,
      map: getMapData(),
      inventory,
      currentHp: player.currentHp,
      currentMp: player.currentMp,
      xp: player.xp,
      level: player.level,
      strength: player.strength,
      dexterity: player.dexterity,
      intelligence: player.intelligence,
      wisdom: player.wisdom,
      endurance: player.endurance,
      charisma: player.charisma,
      luck: player.luck,
      divinity: player.divinity,
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
      const updatedChar = characters.find((c: any) => c.id === character.id);

      hasSyncedPlayerData.current = false;

      if (updatedChar) {
        let playerData = normalizeCharacter(updatedChar);

        while (playerData.xp >= calculateNextLevelXp(playerData.level)) {
          playerData.xp -= calculateNextLevelXp(playerData.level);
          playerData.level += 1;

          playerData.strength += 1;
          playerData.dexterity += 1;
          playerData.intelligence += 1;
          playerData.endurance += 1;
          playerData.luck += 1;
        }

        setPlayer(playerData);
        setDialog('Progress loaded!');
      } else {
        setPlayer(normalizeCharacter(character));
        setDialog('No previous save. Starting fresh!');
      }
    } catch (err) {
      console.error('Failed to load character data:', err);
      alert('Error loading character data');
    }
  };

  const handleHealPlayer = (npcName: string) => {
    if (!player) return;

    const needsHealing = player.currentHp < maxHp || player.currentMp < maxMp;
    if (needsHealing) {
      setPlayer((prev) =>
        prev && { ...prev, currentHp: maxHp, currentMp: maxMp }
      );
      setDialog(`${npcName} heals you completely!`);
    } else {
      setDialog(`${npcName} says you look healthy already.`);
    }
  };

  const handleCombatVictory = (xpGained: number, finalPlayerHp: number) => {
    if (!player) return;

    setInCombat(false);
    setEnemyInCombat(null);
    setArea((prev) => ({
      ...prev,
      enemies: prev.enemies?.filter((e) => e !== enemyInCombat),
    }));
    setDialog(`${enemyInCombat.name} defeated! You gained ${xpGained} XP.`);
    setPlayer((prev) =>
      prev && { ...prev, xp: prev.xp + xpGained, currentHp: finalPlayerHp }
    );
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
        style={{ opacity: isBlocked ? 0.3 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
      >
        {label}
      </button>
    );
  };

  if (!player) {
    return <p style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading character...</p>;
  }

  if (inCombat && enemyInCombat) {
    return (
      <CombatScreen
        player={player}
        enemy={enemyInCombat}
        onVictory={handleCombatVictory}
        onDefeat={async () => {
          setInCombat(false);
          setEnemyInCombat(null);
          setDialog('You were defeated, child of time... The gears of time turns in reverse...');
          await handleLoad();
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
      {showMiniMap && <MiniMap currentX={currentPos.x} currentY={currentPos.y} />}
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
          <button onClick={() => setShowMiniMap((prev) => !prev)}>
            {showMiniMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
          </button>
        </div>

        {dialog && (
          <div style={{ marginTop: '1rem', backgroundColor: '#111', color: '#fff', padding: '1rem', border: '2px solid #555', borderRadius: '8px', textAlign: 'center', maxWidth: '600px' }}>
            <p>{dialog}</p>
            <button onClick={() => setDialog(null)}>Close</button>
          </div>
        )}
      </div>

      <div style={{ minWidth: '240px', color: 'white', backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>{player.name}</h3>
        <div style={{ width: '100%', height: '120px', backgroundColor: '#333', borderRadius: '4px', marginBottom: '1rem' }}>
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
        <Inventory items={inventory} onRemove={(id) => setInventory((prev) => prev.filter((i) => i.id !== id))} />
      </div>
    </div>
  );
};

export default GameEngine;
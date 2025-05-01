// src/game/ui/SkillsMenu.tsx

import React from 'react';
import { Skill } from '../skills/skillsData'; // Import the Skill interface

interface Props {
    // List of skills available to the player
    availableSkills: Skill[];
    // Function to call when a skill is selected
    onSkillSelect: (skill: Skill) => void;
    // Function to call to close the menu
    onClose: () => void;
    // Optional: Player's current MP to show costs or disable skills
    // currentMp?: number;
}

const SkillsMenu: React.FC<Props> = ({ availableSkills, onSkillSelect, onClose /*, currentMp */ }) => {

    // Optional: Function to check if a skill is usable (e.g., enough mana)
    // const isSkillUsable = (skill: Skill): boolean => {
    //     if (currentMp === undefined) return true; // Assume usable if MP not tracked here
    //     return currentMp >= skill.manaCost;
    // };

    return (
        <div style={{
            position: 'absolute', // Position over the combat screen
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#222',
            border: '2px solid #555',
            borderRadius: '8px',
            padding: '1.5rem',
            zIndex: 10, // Ensure it's on top
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            color: 'white',
            fontFamily: 'sans-serif',
            maxWidth: '400px',
            width: '90%',
        }}>
            <h4 style={{ marginTop: 0, textAlign: 'center' }}>Choose a Skill</h4>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', // Responsive grid
                gap: '10px',
                marginBottom: '1rem',
                maxHeight: '200px', // Limit height and add scroll
                overflowY: 'auto',
                paddingRight: '5px', // Add padding for scrollbar
            }}>
                {availableSkills.map(skill => (
                    <button
                        key={skill.id}
                        onClick={() => {
                            // Optional: Add check here if skill is usable
                            // if (isSkillUsable(skill)) {
                                onSkillSelect(skill);
                            // } else {
                                // appendLog("Not enough mana!"); // This log would need to be handled in CombatScreen
                            // }
                        }}
                        // Optional: Disable button if not usable
                        // disabled={!isSkillUsable(skill)}
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #444',
                            backgroundColor: '#333',
                            color: 'white',
                            cursor: 'pointer',
                            textAlign: 'center',
                            // Optional disabled style
                            // opacity: isSkillUsable(skill) ? 1 : 0.5,
                            // cursor: isSkillUsable(skill) ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {skill.name}
                        {/* Optional: Display mana cost */}
                        {/* {skill.manaCost > 0 && <div style={{ fontSize: '0.8em', color: '#bbb' }}>({skill.manaCost} MP)</div>} */}
                    </button>
                ))}
            </div>
            <button
                onClick={onClose}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #444',
                    backgroundColor: '#555',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                }}
            >
                Close
            </button>
        </div>
    );
};

export default SkillsMenu;

import React from 'react';
import { Users } from 'lucide-react';
import { Input } from '../Input';
import styles from './TeamSettings.module.css';

export interface TeamSettingsProps {
  teamCount: number;
  onTeamCountChange: (count: number) => void;
  onMaxTeamsExceeded?: () => void;
  minTeams?: number;
  maxTeams?: number;
  disabled?: boolean;
}

export const TeamSettings = ({
  teamCount,
  onTeamCountChange,
  onMaxTeamsExceeded,
  minTeams = 2,
  maxTeams = 10,
  disabled = false,
}: TeamSettingsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value > maxTeams) {
        onMaxTeamsExceeded?.();
        onTeamCountChange(maxTeams);
      } else {
        const clampedValue = Math.max(minTeams, Math.min(maxTeams, value));
        onTeamCountChange(clampedValue);
      }
    }
  };

  const handleDecrement = () => {
    if (teamCount > minTeams) {
      onTeamCountChange(teamCount - 1);
    }
  };

  const handleIncrement = () => {
    if (teamCount < maxTeams) {
      onTeamCountChange(teamCount + 1);
    } else {
      onMaxTeamsExceeded?.();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Users size={20} aria-hidden="true" />
        <label htmlFor="team-count" className={styles.label}>
          Number of Teams
        </label>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || teamCount <= minTeams}
          className={styles.button}
          aria-label="Decrease team count"
        >
          −
        </button>
        <Input
          id="team-count"
          type="number"
          value={teamCount}
          onChange={handleChange}
          min={minTeams}
          max={maxTeams}
          disabled={disabled}
          className={styles.input}
          aria-label="Team count"
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || teamCount >= maxTeams}
          className={styles.button}
          aria-label="Increase team count"
        >
          +
        </button>
      </div>
    </div>
  );
};

import { memo } from 'react';
import { TeamCard } from '../TeamCard';
import { Alert } from '../Alert';
import type { Team } from '../../types';
import styles from './TeamList.module.css';

export interface TeamListProps {
  teams: Team[];
  showPlayerActions?: boolean;
  emptyMessage?: string;
}

export const TeamList = memo(({
  teams,
  showPlayerActions = false,
  emptyMessage = 'No teams available. Sort players to generate teams.',
}: TeamListProps) => {
  if (teams.length === 0) {
    return (
      <div className={styles.empty}>
        <Alert variant="info">{emptyMessage}</Alert>
      </div>
    );
  }

  return (
    <div className={styles.list} role="list">
      {teams.map((team) => (
        <div key={team.id} role="listitem">
          <TeamCard team={team} showPlayerActions={showPlayerActions} />
        </div>
      ))}
    </div>
  );
});

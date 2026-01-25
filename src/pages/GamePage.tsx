import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import styles from './GamePage.module.css';

const GamePage = () => {
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate('/results');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Layout>
      <h1 className={styles.title}>Player Management</h1>
      <p className={styles.placeholder}>Add players and manage your game</p>
      <div className={styles.buttonGroup}>
        <Button variant="primary" size="medium" onClick={handleViewResults}>
          View Results
        </Button>
        <Button variant="secondary" size="medium" onClick={handleBack}>
          Back
        </Button>
      </div>
    </Layout>
  );
};

export default GamePage;

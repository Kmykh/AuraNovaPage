import React from 'react';
import styles from './MaintenanceScreen.module.css';

export default function MaintenanceScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h4 className={styles.kicker}>PRÓXIMAMENTE</h4>
        <h1 className={styles.title}>Nuevas creaciones en camino</h1>
        <p className={styles.message}>
          Estamos preparando más detalles hermosos para ti. Volveremos mañana a las 12pm.
        </p>
        <p className={styles.submessage}>
          Gracias por tu paciencia. ¡Estamos emocionados por mostrarte lo que viene!
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import styles from './MaintenanceScreen.module.css';

export default function MaintenanceScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🛠️</div>
        <h1 className={styles.title}>Modo Mantenimiento</h1>
        <p className={styles.message}>
          Mejorando esta sección. Volveremos mañana a las 12pm.
        </p>
        <p className={styles.submessage}>
          Estamos trabajando para ofrecerte una mejor experiencia. ¡Gracias por tu paciencia!
        </p>
      </div>
    </div>
  );
}

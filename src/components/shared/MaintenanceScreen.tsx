import React from 'react';
import Image from 'next/image';
import styles from './MaintenanceScreen.module.css';
import flo1 from '@/app/(public)/images/flo1.png';
import flo2 from '@/app/(public)/images/flo2.png';
import angeles from '@/app/(public)/images/angeles.png';

export default function MaintenanceScreen() {
  return (
    <div className={styles.container}>
      {/* Elementos decorativos */}
      <div className={styles.decoTopRight}>
        <Image src={flo1} alt="" width={300} height={300} className={styles.floatingImage} />
      </div>
      <div className={styles.decoBottomLeft}>
        <Image src={flo2} alt="" width={250} height={250} className={styles.floatingImageAlt} />
      </div>
      <div className={styles.decoCenter}>
        <Image src={angeles} alt="" width={400} height={400} className={styles.subtleImage} />
      </div>

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

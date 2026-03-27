//src/components/HouseCard.tsx
import styles from "./HouseCard.module.css";

export default function HouseCard({ house }: any) {
  return (
    <div className="card">
      <div className={styles.cardWrapper}>
        <div>
          <div className={styles.title}>{house.name}</div>
          <div className={styles.desc}>{house.description}</div>
        </div>

        <div className={styles.points}>{house.total_points}</div>
      </div>
    </div>
  );
}

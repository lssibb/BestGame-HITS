import { Zealot } from './Zealot';
import { Enemy } from './Enemy';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Set<Enemy>;
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000; // Появляется враг каждые 2 секунды
  private totalToSpawn: number = 0;
  private spawned: number = 0;
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene, enemies: Set<Enemy>) {
    this.scene = scene;
    this.enemies = enemies;
  }

  public startWave(enemyCount: number, duration: number): void {
    this.totalToSpawn = enemyCount;
    this.spawned = 0;
    this.isActive = true;
    this.spawnTimer = 0;
    
    // Рассчитываем интервал появления врагов
    this.spawnInterval = Math.max(500, (duration / enemyCount) * 1.2);
  }

  public update(delta: number): void {
    if (!this.isActive) return;

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.spawnInterval && this.spawned < this.totalToSpawn) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }
  }

  private spawnEnemy(): void {
    const spawnPos = this.getRandomSpawnPosition();
    const enemy = new Zealot(this.scene, spawnPos.x, spawnPos.y);
    this.enemies.add(enemy);
    this.spawned++;

    if (this.spawned >= this.totalToSpawn) {
      this.isActive = false;
    }
  }

  private getRandomSpawnPosition(): { x: number; y: number } {
    const { width, height } = this.scene.scale;
    const side = Math.floor(Math.random() * 4);
    const offset = 20;

    switch (side) {
      case 0: // Сверху
        return {
          x: Math.random() * width,
          y: -offset
        };
      case 1: // Снизу
        return {
          x: Math.random() * width,
          y: height + offset
        };
      case 2: // Слева
        return {
          x: -offset,
          y: Math.random() * height
        };
      case 3: // Справа
      default:
        return {
          x: width + offset,
          y: Math.random() * height
        };
    }
  }

  public stopWave(): void {
    this.isActive = false;
  }

  public isSpawning(): boolean {
    return this.isActive;
  }

  public getSpawnedCount(): number {
    return this.spawned;
  }
}

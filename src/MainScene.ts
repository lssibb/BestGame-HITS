import Phaser from 'phaser';
import { GameState } from './core/GameState';
import { Building } from './buildings/Building';
import { ResourcePanel } from './ui/ResourcePanel';
import { BuildingSelector } from './ui/BuildingSelector';
import { createBuilding } from './buildings/BuildingFactory';
import { WaveManager } from './core/WaveManager';
import { WavePanel } from './ui/WavePanel';
import { Enemy } from './enemies/Enemy';
import { Zealot } from './enemies/Zealot';
import { EnemySpawner } from './enemies/EnemySpawner';
import { eventBus } from './core/EventBus';
import { Player } from './player/Player';
import { WeaponShop } from './ui/WeaponShop';
import { WeaponType } from './player/Weapon';

export default class MainScene extends Phaser.Scene {
  private readonly CELL_SIZE = 32;
  private readonly GHOST_COLOR_FREE = 0xffffff;
  private readonly GHOST_COLOR_BLOCKED = 0xff0000;

  private ghost!: Phaser.GameObjects.Rectangle;
  private buildings: Map<string, Building> = new Map();
  private enemies: Set<Enemy> = new Set();
  private enemySpawner!: EnemySpawner;
  private player!: Player;

  private map!: Phaser.Tilemaps.Tilemap;
  private tileset!: Phaser.Tilemaps.Tileset;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  private cols = 0;
  private rows = 0;

  private resourcePanel!: ResourcePanel;
  private wavePanel!: WavePanel;
  private weaponShop!: WeaponShop;
  public gameState: GameState = new GameState();
  private selectedType: string = 'drill';
  private waveManager!: WaveManager;
  private currentPhase: string = 'gathering';

  private readonly TILESET_KEY = 'tiles';
  private readonly TILESET_NAME = 'tiles';

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.generateTilesetTexture();
    this.generateBuildingSpritesheet();
    this.generateEnemySpritesheet();
    this.generatePlayerSpritesheet();
    this.generateWeaponSpritesheet();
  }

  private generateTilesetTexture(): void {
    const TILE = this.CELL_SIZE;
    const rt = this.add.renderTexture(0, 0, TILE * 3, TILE);
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0x1a1a2e);
    g.fillRect(0, 0, TILE, TILE);
    g.lineStyle(1, 0x16213e, 0.5);
    g.strokeRect(2, 2, TILE - 4, TILE - 4);
    g.lineStyle(2, 0x0f3460, 0.3);
    g.strokeRect(0, 0, TILE, TILE);
    rt.draw(g, 0, 0);

    g.clear();
    g.fillStyle(0x4e4e50);
    g.fillRoundedRect(6, 6, TILE - 12, TILE - 12, 4);
    g.fillStyle(0x950740);
    g.fillCircle(TILE / 2, TILE / 2, 4);
    rt.draw(g, TILE, 0);

    g.clear();
    g.fillStyle(0x1a1a2e);
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle(0x4cc9f0);
    g.fillTriangle(16, 4, 4, 28, 28, 28);
    g.lineStyle(2, 0x480ca8, 0.8);
    g.strokeTriangle(16, 4, 4, 28, 28, 28);
    rt.draw(g, TILE * 2, 0);

    rt.saveTexture(this.TILESET_KEY);
    g.destroy();
    rt.destroy();
  }

  private generateBuildingSpritesheet(): void {
    const TILE = this.CELL_SIZE;
    const rt = this.add.renderTexture(0, 0, TILE * 2, TILE);
    const g = this.add.graphics();

    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0x533483);
    g.fillRoundedRect(4, 4, TILE - 8, TILE - 8, 2);
    g.strokeRoundedRect(4, 4, TILE - 8, TILE - 8, 2);
    g.fillStyle(0xe94560);
    g.fillCircle(TILE / 2, TILE / 2, 6);
    rt.draw(g, 0, 0);

    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0x16213e);
    g.fillRect(2, 2, TILE - 4, TILE - 4);
    g.strokeRect(2, 2, TILE - 4, TILE - 4);
    g.lineStyle(1, 0x0f3460);
    g.moveTo(2, TILE / 2);
    g.lineTo(TILE - 2, TILE / 2);
    g.strokePath();
    rt.draw(g, TILE, 0);

    rt.saveTexture('buildings');
    g.destroy();
    rt.destroy();

    this.textures.get('buildings').add('drill', 0, 0, 0, TILE, TILE);
    this.textures.get('buildings').add('wall', 0, TILE, 0, TILE, TILE);
  }

  private generateEnemySpritesheet(): void {
    const TILE = this.CELL_SIZE;
    const rt = this.add.renderTexture(0, 0, TILE, TILE);
    const g = this.add.graphics();

    // Зилот - красный враг
    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0xff3333);
    g.fillCircle(TILE / 2, TILE / 2, TILE / 3);
    g.fillStyle(0xffff00);
    g.fillCircle(TILE / 2 - 4, TILE / 2 - 4, 2);
    g.fillCircle(TILE / 2 + 4, TILE / 2 - 4, 2);
    g.strokeCircle(TILE / 2, TILE / 2, TILE / 3);
    rt.draw(g, 0, 0);

    rt.saveTexture('enemies');
    g.destroy();
    rt.destroy();

    this.textures.get('enemies').add('zealot', 0, 0, 0, TILE, TILE);
  }

  private generatePlayerSpritesheet(): void {
    const TILE = this.CELL_SIZE;
    const rt = this.add.renderTexture(0, 0, TILE, TILE);
    const g = this.add.graphics();

    // Игрок - синий рыцарь
    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0x4169E1);
    g.fillCircle(TILE / 2, TILE / 2 - 2, TILE / 3);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(TILE / 2 - 3, TILE / 2 - 5, 1.5);
    g.fillCircle(TILE / 2 + 3, TILE / 2 - 5, 1.5);
    g.fillStyle(0xFF0000);
    g.fillTriangle(TILE / 2, TILE / 2 + 4, TILE / 2 - 3, TILE / 2 + 8, TILE / 2 + 3, TILE / 2 + 8);
    g.strokeCircle(TILE / 2, TILE / 2 - 2, TILE / 3);
    rt.draw(g, 0, 0);

    rt.saveTexture('player');
    g.destroy();
    rt.destroy();

    this.textures.get('player').add('body', 0, 0, 0, TILE, TILE);
  }

  private generateWeaponSpritesheet(): void {
    const TILE = this.CELL_SIZE;
    const rt = this.add.renderTexture(0, 0, TILE * 3, TILE);
    const g = this.add.graphics();

    // Рука (пусто)
    g.clear();
    g.fillStyle(0xDEB887);
    g.fillCircle(TILE / 2, TILE / 2, 8);
    rt.draw(g, 0, 0);

    // Топор
    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0x8B4513);
    g.fillRect(TILE / 2 - 1, TILE / 2, 2, 12); // Рукоятка
    g.fillStyle(0xDCDCDC);
    g.fillTriangle(TILE / 2 - 8, TILE / 2 - 6, TILE / 2 + 8, TILE / 2 - 6, TILE / 2, TILE / 2 + 2); // Лезвие
    g.strokeTriangle(TILE / 2 - 8, TILE / 2 - 6, TILE / 2 + 8, TILE / 2 - 6, TILE / 2, TILE / 2 + 2);
    rt.draw(g, TILE, 0);

    // Пистолет
    g.clear();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0x2F4F4F);
    g.fillRect(TILE / 2 - 10, TILE / 2 - 2, 16, 4); // Ствол
    g.fillRect(TILE / 2 + 6, TILE / 2 - 4, 4, 8); // Рукоять
    g.fillStyle(0xFF0000);
    g.fillCircle(TILE / 2 - 11, TILE / 2, 2); // Мушка
    rt.draw(g, TILE * 2, 0);

    rt.saveTexture('weapons');
    g.destroy();
    rt.destroy();

    this.textures.get('weapons').add('hand', 0, 0, 0, TILE, TILE);
    this.textures.get('weapons').add('axe', 0, TILE, 0, TILE, TILE);
    this.textures.get('weapons').add('pistol', 0, TILE * 2, 0, TILE, TILE);
  }

  create() {
    this.calculateGridDimensions();
    this.setupTilemap();
    this.setupGhost();
    this.setupInput();
    
    // Создаём игрока в центре
    const centerX = (this.scale.width - 100) / 2;
    const centerY = this.scale.height / 2;
    this.player = new Player(this, centerX, centerY);
    
    this.resourcePanel = new ResourcePanel(this);
    this.wavePanel = new WavePanel(this);
    this.waveManager = new WaveManager();
    this.enemySpawner = new EnemySpawner(this, this.enemies);
    
    // Создаём оружейную лавку
    this.weaponShop = new WeaponShop(this, this.gameState, (weaponType: WeaponType) => {
      this.player.switchWeapon(weaponType);
    });
    
    new BuildingSelector(this, (type) => {
      this.selectedType = type;
    });

    // Подписываемся на события волны для запуска спавнинга
    eventBus.on('wave-update', (data) => {
      if (data.phase === 'wave' && this.currentPhase !== 'wave') {
        // Волна началась
        this.enemySpawner.startWave(data.enemiesInWave, 60000);
        this.currentPhase = 'wave';
      } else if (data.phase !== 'wave' && this.currentPhase === 'wave') {
        // Волна закончилась
        this.enemySpawner.stopWave();
        this.currentPhase = data.phase;
      }
    });
  }

  private calculateGridDimensions(): void {
    const PANEL_WIDTH = 100;
    const { width, height } = this.scale;
    this.cols = Math.floor((width - PANEL_WIDTH) / this.CELL_SIZE);
    this.rows = Math.floor(height / this.CELL_SIZE);
  }

  private setupTilemap(): void {
    const data: number[][] = [];
    for (let row = 0; row < this.rows; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < this.cols; col++) {
        const r = Math.random();
        if (r < 0.05) rowData.push(2);
        else if (r < 0.15) rowData.push(1);
        else rowData.push(0);
      }
      data.push(rowData);
    }

    this.map = this.make.tilemap({
      data,
      tileWidth: this.CELL_SIZE,
      tileHeight: this.CELL_SIZE,
    });

    const tileset = this.map.addTilesetImage(
      this.TILESET_NAME,
      this.TILESET_KEY,
      this.CELL_SIZE,
      this.CELL_SIZE,
      0,
      0
    );

    if (!tileset) throw new Error('Tileset failed to load');
    this.tileset = tileset;

    const layer = this.map.createLayer(0, this.tileset, 0, 0);
    if (!layer) throw new Error('Layer failed to create');
    this.groundLayer = layer;
  }

  private setupGhost(): void {
    this.ghost = this.add.rectangle(0, 0, this.CELL_SIZE - 2, this.CELL_SIZE - 2, this.GHOST_COLOR_FREE, 0.4);
    this.ghost.setOrigin(0, 0);
    this.ghost.setVisible(false);
    this.ghost.setDepth(100);
  }

  private setupInput(): void {
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const gridX = Math.floor(pointer.x / this.CELL_SIZE);
    const gridY = Math.floor(pointer.y / this.CELL_SIZE);

    if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
      this.ghost.setVisible(false);
      return;
    }

    this.ghost.setVisible(true);
    this.ghost.setPosition(gridX * this.CELL_SIZE + 1, gridY * this.CELL_SIZE + 1);
    this.ghost.setFillStyle(this.isOccupied(gridX, gridY) ? this.GHOST_COLOR_BLOCKED : this.GHOST_COLOR_FREE, 0.4);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.button !== 0) return;

    const gridX = Math.floor(pointer.x / this.CELL_SIZE);
    const gridY = Math.floor(pointer.y / this.CELL_SIZE);

    if (gridX < 0 || gridX >= this.cols || gridY < 0 || gridY >= this.rows) {
      // Клик вне сетки - проверяем клик по врагам (для атаки)
      if (this.currentPhase === 'wave') {
        const deadEnemy = this.player.attackEnemy(this.enemies);
        if (deadEnemy) {
          this.enemies.delete(deadEnemy);
          deadEnemy.destroy();
        }
      }
      return;
    }

    this.placeBuilding(gridX, gridY);
  }

  placeBuilding(gridX: number, gridY: number): void {
  if (this.isOccupied(gridX, gridY)) return;

  const tile = this.groundLayer.getTileAt(gridX, gridY);
  let resourceToMine: 'iron' | 'stone' | undefined = undefined;

  if (tile) {
    if (tile.index === 1) resourceToMine = 'stone'; 
    else if (tile.index === 2) resourceToMine = 'iron';
  }

  if (this.selectedType === 'drill' && !resourceToMine) {
    return; 
  }

  const worldX = gridX * this.CELL_SIZE + 1;
  const worldY = gridY * this.CELL_SIZE + 1;

  const building = createBuilding(this.selectedType, this, worldX, worldY, resourceToMine);
  this.buildings.set(this.getGridKey(gridX, gridY), building);
  this.ghost.setFillStyle(this.GHOST_COLOR_BLOCKED, 0.4);
}

  private isOccupied(gridX: number, gridY: number): boolean {
    return this.buildings.has(this.getGridKey(gridX, gridY));
  }

  private getGridKey(gridX: number, gridY: number): string {
    return `${gridX},${gridY}`;
  }

  update(_time: number, delta: number): void {
    this.waveManager.update(delta);
    this.wavePanel.updateProgress(this.waveManager.getPhaseProgress());
    this.enemySpawner.update(delta);

    for (const building of this.buildings.values()) {
      building.update(delta);
    }

    this.player.update(delta);
    this.weaponShop.updateAffordability(this.gameState.resources.iron, this.gameState.resources.stone);

    // Обновляем врагов и даём им цели
    const deadEnemies: Enemy[] = [];
    for (const enemy of this.enemies) {
      // Если враг не имеет цели, ищем ближайшее здание или игрока
      if (enemy['targetX'] === null || enemy['targetY'] === null || !enemy['attackTarget']) {
        const nearestBuilding = this.findNearestBuilding(enemy);
        const nearestTarget = this.findNearestTarget(enemy, nearestBuilding);
        
        if (nearestTarget) {
          if (nearestTarget === this.player) {
            enemy.setTarget(this.player.sprite.x, this.player.sprite.y);
            enemy.setAttackTarget(this.player);
          } else {
            enemy.setTarget((nearestTarget as Building).sprite.x, (nearestTarget as Building).sprite.y);
            enemy.setAttackTarget(nearestTarget);
          }
        }
      }
      
      enemy.update(delta);
    }

    // Удаляем мертвых врагов
    for (const enemy of deadEnemies) {
      this.enemies.delete(enemy);
      enemy.destroy();
    }

    this.resourcePanel.update(this.gameState.resources);
  }

  private findNearestTarget(enemy: Enemy, nearestBuilding: Building | null): Building | Player | null {
    const playerDist = this.getDistance(enemy.sprite.x, enemy.sprite.y, this.player.sprite.x, this.player.sprite.y);
    const buildingDist = nearestBuilding ? 
      this.getDistance(enemy.sprite.x, enemy.sprite.y, nearestBuilding.sprite.x, nearestBuilding.sprite.y) : 
      Infinity;

    if (playerDist < buildingDist) {
      return this.player;
    }
    return nearestBuilding;
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findNearestBuilding(enemy: Enemy): Building | null {
    let nearest: Building | null = null;
    let minDistance = Infinity;

    for (const building of this.buildings.values()) {
      const dx = building.sprite.x - enemy.sprite.x;
      const dy = building.sprite.y - enemy.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = building;
      }
    }

    return nearest;
  }
}
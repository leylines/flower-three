/*
	Interface to the grid. Holds data about the visual representation of the cells (tiles).

	@author Corey Birnbaum https://github.com/vonWolfehaus/
 */
vg.Board = function(grid) {
	if (!grid) throw new Error('You must pass in a grid system for the board to use.');

	this.tiles = [];
	this.tileGroup = null; // only for tiles
	this.group = new THREE.Object3D(); // can hold all entities, also holds tileGroup, never trashed
	this.grid = null;

	this.setGrid(grid);
};

vg.Board.prototype = {
	removeAllTiles: function() {
		if (!this.tileGroup) return;
		var tiles = this.tileGroup.children;
		for (var i = 0; i < tiles.length; i++) {
			this.tileGroup.remove(tiles[i]);
		}
	},

	setGrid: function(newGrid) {
		this.group.remove(this.tileGroup);
		if (this.grid && newGrid !== this.grid) {
			this.removeAllTiles();
			this.tiles.forEach(function(t) {
				this.grid.remove(t.cell);
				t.dispose();
			});
			this.grid.dispose();
		}
		this.grid = newGrid;
		this.tiles = [];
		this.tileGroup = new THREE.Object3D();
		this.group.add(this.tileGroup);
	},

	generateTilemap: function(config) {
		this.reset();

		var tiles = this.grid.generateTiles(config);
		this.tiles = tiles;

		this.tileGroup = new THREE.Object3D();
		for (var i = 0; i < tiles.length; i++) {
			this.tileGroup.add(tiles[i].mesh);
		}

		this.group.add(this.tileGroup);
	},

	reset: function() {
		// removes all tiles from the scene, but leaves the grid intact
		this.removeAllTiles();
		if (this.tileGroup) this.group.remove(this.tileGroup);
	}
};

vg.Board.prototype.constructor = vg.Board;

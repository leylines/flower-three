/*
	Graph of hexagons. Handles grid cell management (placement math for eg pathfinding, range, etc) and grid conversion math.
	[Cube/axial coordinate system](http://www.redblobgames.com/grids/hexagons/), "flat top" version only. Since this is 3D, just rotate your camera for pointy top maps.
	Interface:
	type
	size - number of cells (in radius); only used if the map is generated
	cellSize
	cells - a hash so we can have sparse maps
	numCells
	cellShapeGeo

	@author Corey Birnbaum https://github.com/vonWolfehaus/
 */

vg.HexGrid = function(config) {
	config = config || {};
	/*  ______________________________________________
		GRID INTERFACE:
	*/
	this.type = vg.HEX;
	this.size = 5; // only used for generated maps
	this.cellSize = typeof config.cellSize === 'undefined' ? 10 : config.cellSize;
	this.cells = {};
	this.numCells = 0;

    this.cellShapeGeo = new THREE.TorusGeometry( 17.3, 0.5, 32, 100 );
    //this.cellShapeGeo = new THREE.SphereGeometry( 17.3, 32, 32 );

	/*  ______________________________________________
		PRIVATE
	*/

	this._cellWidth = this.cellSize * 2;
	this._cellLength = (vg.SQRT3 * 0.5) * this._cellWidth;
	this._hashDelimeter = '.';
	// pre-computed permutations
	// cached objects
	this._vec3 = new THREE.Vector3();
};

vg.HexGrid.prototype = {
	/*  ________________________________________________________________________
		High-level functions that the Board interfaces with (all grids implement)
	 */

	// grid cell (Hex in cube coordinate space) to position in pixels/world
	cellToPixel: function(cell) {
		this._vec3.x = cell.q * this._cellWidth * 0.75;
		this._vec3.y = cell.h;
		this._vec3.z = -((cell.s - cell.r) * this._cellLength * 0.5);
		return this._vec3;
	},

	cellToHash: function(cell) {
		return cell.q+this._hashDelimeter+cell.r+this._hashDelimeter+cell.s;
	},

	generateTile: function(cell, scale, material) {
		var tile = new vg.Tile({
			size: this.cellSize,
			scale: scale,
			cell: cell,
			geometry: this.cellShapeGeo,
			material: material
		});

		cell.tile = tile;

		return tile;
	},

	generateTiles: function(config) {
		config = config || {};
		var tiles = [];
		var settings = {
			tileScale: 1.00,
			cellSize: this.cellSize,
			material: null
		}
		settings = vg.Tools.merge(settings, config);

		// overwrite with any new dimensions
		this.cellSize = settings.cellSize;
		this._cellWidth = this.cellSize * 2;
		this._cellLength = (vg.SQRT3 * 0.5) * this._cellWidth;


		var i, t, c;
		for (i in this.cells) {
			c = this.cells[i];
			t = this.generateTile(c, settings.tileScale, settings.material);
			t.position.copy(this.cellToPixel(c));
			t.position.y = 0;
			tiles.push(t);
		}
		return tiles;
	},

	// create a flat, hexagon-shaped grid
	generate: function(config) {
		config = config || {};
		this.size = typeof config.size === 'undefined' ? this.size : config.size;
		var x, y, z, c;
		for (x = -this.size; x < this.size+1; x++) {
			for (y = -this.size; y < this.size+1; y++) {
				z = -x-y;
				if (Math.abs(x) <= this.size && Math.abs(y) <= this.size && Math.abs(z) <= this.size) {
					c = new vg.Cell(x, y, z);
					this.add(c);
				}
			}
		}
	},

	add: function(cell) {
		var h = this.cellToHash(cell);
		if (this.cells[h]) {
			// console.warn('A cell already exists there');
			return;
		}
		this.cells[h] = cell;
		this.numCells++;

		return cell;
	},

	remove: function(cell) {
		var h = this.cellToHash(cell);
		if (this.cells[h]) {
			delete this.cells[h];
			this.numCells--;
		}
	},

	dispose: function() {
		this.cells = null;
		this.numCells = 0;
		this.cellShape = null;
		this.cellGeo.dispose();
		this.cellGeo = null;
		this.cellShapeGeo.dispose();
		this.cellShapeGeo = null;
		this._vec3 = null;
	},

};

vg.HexGrid.prototype.constructor = vg.HexGrid;

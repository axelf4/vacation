"use strict";
var fowl = {
	components: [],
	nextEntityIndex: 0,
	availibleIndices: [],
	createEntity: function() {
		var entity = this.availibleIndices.length > 0 ? this.availibleIndices.shift() : this.nextEntityIndex++;
		this.components[entity] = {};
		return entity;
	},
	removeEntity: function(entity) {
		delete this.components[entity]; // this.components.splice(entity, 1);
		this.availibleIndices.push(entity);
	},
	addComponent: function(entity, key, value) {
		return this.components[entity][key] = value;
	},
	getComponent: function(entity, key) {
		return this.components[entity][key];
	},
	clear: function() {
		this.components = [];
		this.availibleIndices = [];
	},
	each: function(callback) {
		outer:
		for (var i = 0, length = this.components.length; i < length; ++i) {
			if (this.components[i] !== undefined) {
				for (var j = 1; j < arguments.length; ++j) {
					if (this.components[i][arguments[j]] === undefined) continue outer;
				}
				callback(i); // Call callback with the entity
			}
		}
	},
	each2: function(callback) {
		outer:
		for (var i = 0; i < this.components.length; ++i) {
			if (!this.components.hasOwnProperty(i)) {
				continue;
			}
			var c = [i];
			for (var j = 1; j < arguments.length; ++j) {
				var key = arguments[j];
				if (!this.components[i].hasOwnProperty(key)) {
					continue outer;
				}
				c.push(this.components[i][key]);
			}
			callback.apply(this, c);
		}
	}
};

"use strict";
var INITIAL_SIZE = 1024;
var fowl = {
	components: [],
	componentCount: 0,
	entityMask: new Uint32Array(INITIAL_SIZE),
	nextEntityIndex: 0,
	pool: [],
	createEntity: function() {
		var entity = this.pool.length > 0 ? this.pool.pop() : this.nextEntityIndex++;
		if (entity > this.entityMask.length) {
			var tmp = this.entityMask;
			this.entityMask = new Uint32Array(tmp.length * 1.5);
			this.entityMask.set(tmp);
		}
		return entity;
	},
	removeEntity: function(entity) {
		this.entityMask[entity] = 0;
		this.pool.push(entity);
	},
	addComponent: function(entity, component) {
		var key = component.constructor.componentId;
		this.entityMask[entity] |= 1 << key;
		return this.components[this.componentCount * entity + key] = component;
	},
	removeComponent: function(entity, component) {
		this.entityMask[entity] &= ~(1 << component.componentId);
	},
	getComponent: function(entity, key) {
		return this.components[this.componentCount * entity + key.componentId];
	},
	clear: function() {
		this.entityMask.fill(0);
	},
	each: function(callback) {
		var mask = 0;
		for (var i = 1; i < arguments.length; ++i) {
			mask |= 1 << arguments[i].componentId;
		}
		for (var i = 0, length = this.entityMask.length; i < length; ++i) {
			if ((this.entityMask[i] & mask) === mask) {
				callback(i); // Call callback with the entity
			}
		}
	},
	registerComponents: function(components) {
		if (components.length > 32) throw new RangeError("Too many components");
		for (var i = 0, length = components.length; i < length; ++i) {
			components[i].componentId = i;
		}
		this.componentCount = components.length;
	}
};

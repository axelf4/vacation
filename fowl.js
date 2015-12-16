"use strict";
var fowl = {
	components: [],
	entityMask: new Uint32Array(1024),
	nextEntityIndex: 0,
	availibleIndices: [],
	createEntity: function() {
		var entity = this.availibleIndices.length > 0 ? this.availibleIndices.shift() : this.nextEntityIndex++;
		this.components[entity] = [];
		if (entity > this.entityMask.length) {
			var tmp = this.entityMask;
			this.entityMask = new Uint32Array(tmp.length * 2);
			this.entityMask.set(tmp);
		}
		return entity;
	},
	removeEntity: function(entity) {
		this.entityMask[entity] = 0;
		delete this.components[entity]; // this.components.splice(entity, 1);
		this.availibleIndices.push(entity);
	},
	addComponent: function(entity, component) {
		var key = component.constructor.componentId;
		this.entityMask[entity] |= 1 << key;
		return this.components[entity][key] = component;
	},
	getComponent: function(entity, key) {
		return this.components[entity][key.componentId];
	},
	clear: function() {
		this.components = [];
	},
	each: function(callback) {
		var mask = 0;
		for (var i = 1; i < arguments.length; ++i) {
			mask |= 1 << arguments[i].componentId;
		}
		for (var i = 0, length = this.components.length; i < length; ++i) {
			if ((this.entityMask[i] & mask) === mask && this.components[i] !== undefined) {
				callback(i); // Call callback with the entity
			}
		}
	},
	registerComponents: function(components) {
		if (components.length > 32) throw new RangeError("Too many components");
		for (var i = 0, length = components.length; i < length; ++i) {
			components[i].componentId = i;
		}
	}
};

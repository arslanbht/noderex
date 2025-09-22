"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const typeorm_1 = require("typeorm");
require("reflect-metadata");
/**
 * Base Model class for NodeRex framework
 * Provides common functionality for all models including timestamps
 */
let Model = class Model extends typeorm_1.BaseEntity {
    /**
     * Fill the model with an array of attributes
     */
    fill(attributes) {
        Object.keys(attributes).forEach(key => {
            if (key in this) {
                this[key] = attributes[key];
            }
        });
        return this;
    }
    /**
     * Convert the model instance to JSON
     */
    toJSON() {
        const json = {};
        Object.keys(this).forEach(key => {
            if (this[key] !== undefined) {
                json[key] = this[key];
            }
        });
        return json;
    }
    /**
     * Get only specified attributes from the model
     */
    only(attributes) {
        const result = {};
        attributes.forEach(attr => {
            if (attr in this) {
                result[attr] = this[attr];
            }
        });
        return result;
    }
    /**
     * Hide specified attributes from JSON output
     */
    hidden(attributes) {
        const json = this.toJSON();
        attributes.forEach(attr => {
            delete json[attr];
        });
        return json;
    }
};
exports.Model = Model;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Model.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Model.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Model.prototype, "updated_at", void 0);
exports.Model = Model = __decorate([
    (0, typeorm_1.Entity)()
], Model);
//# sourceMappingURL=Model.js.map
/**
 * NodeRex Type Definitions
 * Provides TypeScript type definitions for better IDE support
 */

import { Request, Response, NextFunction } from 'express';
import { BaseEntity, SelectQueryBuilder } from 'typeorm';

/**
 * Model base type
 */
export interface IModel extends BaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
  fill(attributes: Record<string, any>): this;
  toJSON(): Record<string, any>;
  only(attributes: string[]): Record<string, any>;
  hidden(attributes: string[]): Record<string, any>;
}

/**
 * Controller base type
 */
export interface IController {
  setContext(req: Request, res: Response, next: NextFunction): void;
  all(): Record<string, any>;
  input(key: string, defaultValue?: any): any;
  only(keys: string[]): Record<string, any>;
  except(keys: string[]): Record<string, any>;
  has(key: string): boolean;
  filled(key: string): boolean;
  success(data: any, message?: string, status?: number): Response;
  error(message?: string, status?: number, errors?: Record<string, string[]>): Response;
  validationError(errors: Record<string, string[]>): Response;
  notFound(message?: string): Response;
  unauthorized(message?: string): Response;
  forbidden(message?: string): Response;
  created(data: any, message?: string): Response;
  noContent(): Response;
}

/**
 * Request base type
 */
export interface IRequest {
  rules(): Record<string, any>;
  messages(): Record<string, string>;
  attributes(): Record<string, string>;
  validate(): Promise<Record<string, any>>;
  validated(): Record<string, any>;
  all(): Record<string, any>;
  get(key: string, defaultValue?: any): any;
  setData(data: Record<string, any>): void;
}

/**
 * Resource base type
 */
export interface IResource {
  transform(): Record<string, any>;
  toArray(): Record<string, any>;
  toJSON(): string;
  hide(attributes: string[]): Record<string, any>;
  only(attributes: string[]): Record<string, any>;
  append(data: Record<string, any>): Record<string, any>;
  when(condition: boolean, value: any, defaultValue?: any): any;
  whenCallback(condition: boolean, callback: () => any, defaultValue?: any): any;
}

/**
 * Validation rule type
 */
export interface IValidationRule {
  required?: boolean;
  nullable?: boolean;
  sometimes?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  numeric?: boolean;
  integer?: boolean;
  alpha?: boolean;
  alphaNumeric?: boolean;
  alphaDash?: boolean;
  url?: boolean;
  uuid?: boolean;
  date?: boolean;
  dateFormat?: string;
  before?: string | Date;
  after?: string | Date;
  beforeOrEqual?: string | Date;
  afterOrEqual?: string | Date;
  boolean?: boolean;
  array?: boolean;
  object?: boolean;
  confirmed?: boolean;
  different?: string;
  same?: string;
  in?: any[];
  notIn?: any[];
  regex?: RegExp;
  size?: number;
  between?: { min: number; max: number };
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  ip?: boolean;
  ipv4?: boolean;
  ipv6?: boolean;
  json?: boolean;
  timezone?: boolean;
  accepted?: boolean;
  present?: boolean;
  filled?: boolean;
  requiredIf?: { field: string; value: any };
  requiredUnless?: { field: string; value: any };
  requiredWith?: string[];
  requiredWithAll?: string[];
  requiredWithout?: string[];
  requiredWithoutAll?: string[];
  unique?: string;
  exists?: string;
  message?: string;
}

/**
 * Relationship types
 */
export interface IHasMany<T extends IModel> {
  get(): Promise<T[]>;
  count(): Promise<number>;
  create(attributes: Partial<T>): Promise<T>;
  attach(models: T[]): Promise<void>;
  detach(models?: T[]): Promise<void>;
  getQuery(): SelectQueryBuilder<T>;
}

export interface IBelongsTo<T extends IModel> {
  get(): Promise<T | null>;
  associate(model: T): Promise<void>;
  dissociate(): Promise<void>;
}

export interface IHasOne<T extends IModel> {
  get(): Promise<T | null>;
  create(attributes: Partial<T>): Promise<T>;
  updateOrCreate(attributes: Partial<T>, values?: Partial<T>): Promise<T>;
}

export interface IBelongsToMany<T extends IModel> {
  get(): Promise<T[]>;
  count(): Promise<number>;
  attach(models: T[] | number[], pivotAttributes?: Record<string, any>): Promise<void>;
  detach(models?: T[] | number[]): Promise<void>;
  sync(models: T[] | number[], detaching?: boolean): Promise<void>;
  toggle(models: T[] | number[]): Promise<void>;
}

/**
 * Router types
 */
export interface IRouteDefinition {
  method: string;
  path: string;
  handler: string | ((req: Request, res: Response) => any);
  middleware?: string[];
  name?: string;
}

export interface IRouter {
  middleware(name: string, handler: (req: Request, res: Response, next: NextFunction) => void): void;
  get(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  post(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  put(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  patch(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  delete(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  any(path: string, handler: string | ((req: Request, res: Response) => any), middleware?: string[]): IRouteDefinition;
  group(prefix: string, callback: (router: IRouter) => void, middleware?: string[]): void;
  resource(name: string, controller: string, middleware?: string[]): void;
  apiResource(name: string, controller: string, middleware?: string[]): void;
  registerRoutes(): void;
  getRoutes(): IRouteDefinition[];
  getRoutesByMethod(method: string): IRouteDefinition[];
  findRouteByName(name: string): IRouteDefinition | undefined;
  url(name: string, params?: Record<string, any>): string;
}

/**
 * Migration types
 */
export interface IMigration {
  up(queryRunner: any): Promise<void>;
  down(queryRunner: any): Promise<void>;
  createTable(queryRunner: any, table: any): Promise<void>;
  dropTable(queryRunner: any, tableName: string): Promise<void>;
  addColumn(queryRunner: any, tableName: string, column: any): Promise<void>;
  dropColumn(queryRunner: any, tableName: string, columnName: string): Promise<void>;
  addIndex(queryRunner: any, tableName: string, index: any): Promise<void>;
  dropIndex(queryRunner: any, indexName: string): Promise<void>;
  tableExists(queryRunner: any, tableName: string): Promise<boolean>;
  columnExists(queryRunner: any, tableName: string, columnName: string): Promise<boolean>;
  indexExists(queryRunner: any, tableName: string, indexName: string): Promise<boolean>;
}

/**
 * Seeder types
 */
export interface ISeeder {
  run(): Promise<void>;
  create<T>(entityClass: new () => T, records: Partial<T>[]): Promise<void>;
  createRaw(tableName: string, records: Record<string, any>[]): Promise<void>;
  query(sql: string, parameters?: any[]): Promise<any>;
}

/**
 * Logger types
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error | any, context?: Record<string, any>): void;
  request(req: Request, res: Response, responseTime?: number): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

/**
 * Express Request extension
 */
declare global {
  namespace Express {
    interface Request {
      validated?: Record<string, any>;
      request?: IRequest;
    }
  }
}

/**
 * Validation helper type
 */
export interface IValidation {
  required(message?: string): IValidationRule;
  nullable(): IValidationRule;
  sometimes(): IValidationRule;
  email(message?: string): IValidationRule;
  min(length: number, message?: string): IValidationRule;
  max(length: number, message?: string): IValidationRule;
  minValue(value: number, message?: string): IValidationRule;
  maxValue(value: number, message?: string): IValidationRule;
  numeric(message?: string): IValidationRule;
  integer(message?: string): IValidationRule;
  alpha(message?: string): IValidationRule;
  alphaNumeric(message?: string): IValidationRule;
  alphaDash(message?: string): IValidationRule;
  url(message?: string): IValidationRule;
  uuid(message?: string): IValidationRule;
  date(message?: string): IValidationRule;
  dateFormat(format: string, message?: string): IValidationRule;
  before(date: string | Date, message?: string): IValidationRule;
  after(date: string | Date, message?: string): IValidationRule;
  beforeOrEqual(date: string | Date, message?: string): IValidationRule;
  afterOrEqual(date: string | Date, message?: string): IValidationRule;
  boolean(message?: string): IValidationRule;
  array(message?: string): IValidationRule;
  object(message?: string): IValidationRule;
  confirmed(message?: string): IValidationRule;
  different(field: string, message?: string): IValidationRule;
  same(field: string, message?: string): IValidationRule;
  unique(table: string, column: string, message?: string): IValidationRule;
  exists(table: string, column: string, message?: string): IValidationRule;
  in(values: any[], message?: string): IValidationRule;
  notIn(values: any[], message?: string): IValidationRule;
  regex(pattern: RegExp, message?: string): IValidationRule;
  size(size: number, message?: string): IValidationRule;
  between(min: number, max: number, message?: string): IValidationRule;
  startsWith(prefix: string, message?: string): IValidationRule;
  endsWith(suffix: string, message?: string): IValidationRule;
  contains(value: string, message?: string): IValidationRule;
  ip(message?: string): IValidationRule;
  ipv4(message?: string): IValidationRule;
  ipv6(message?: string): IValidationRule;
  json(message?: string): IValidationRule;
  timezone(message?: string): IValidationRule;
  accepted(message?: string): IValidationRule;
  present(message?: string): IValidationRule;
  filled(message?: string): IValidationRule;
  requiredIf(field: string, value: any, message?: string): IValidationRule;
  requiredUnless(field: string, value: any, message?: string): IValidationRule;
  requiredWith(fields: string[], message?: string): IValidationRule;
  requiredWithAll(fields: string[], message?: string): IValidationRule;
  requiredWithout(fields: string[], message?: string): IValidationRule;
  requiredWithoutAll(fields: string[], message?: string): IValidationRule;
}

/**
 * Schema helper types
 */
export interface ISchema {
  id(): any;
  string(name: string, length?: number, nullable?: boolean): any;
  text(name: string, nullable?: boolean): any;
  integer(name: string, nullable?: boolean): any;
  boolean(name: string, nullable?: boolean): any;
  timestamp(name: string, nullable?: boolean): any;
  date(name: string, nullable?: boolean): any;
  json(name: string, nullable?: boolean): any;
  timestamps(): any[];
  softDeletes(): any;
  foreignId(name: string, nullable?: boolean): any;
}

/**
 * Index helper types
 */
export interface IIndex {
  primary(columnNames: string[]): any;
  unique(name: string, columnNames: string[]): any;
  index(name: string, columnNames: string[]): any;
  foreign(name: string, columnNames: string[]): any;
}

export {};

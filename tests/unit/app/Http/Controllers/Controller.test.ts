import { Request, Response, NextFunction } from 'express';
import { Controller } from '../../../../src/app/Http/Controllers/Controller';

/**
 * Test Controller
 */
class TestController extends Controller {
  public async index(): Promise<void> {
    this.success({ message: 'Hello' });
  }

  public async show(): Promise<void> {
    this.notFound('Not found');
  }
}

describe('Controller', () => {
  let controller: TestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: any;
  let responseStatus: number;

  beforeEach(() => {
    responseJson = null;
    responseStatus = 200;

    mockRequest = {
      body: { name: 'John' },
      query: { page: '1' },
      params: { id: '123' },
    };

    mockResponse = {
      status: jest.fn().mockImplementation((code: number) => {
        responseStatus = code;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation((data: any) => {
        responseJson = data;
        return mockResponse;
      }),
      send: jest.fn(),
    } as any;

    mockNext = jest.fn();

    controller = new TestController();
    controller.setContext(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );
  });

  describe('all() method', () => {
    it('should merge body, query, and params', () => {
      const all = controller['all']();
      expect(all).toHaveProperty('name', 'John');
      expect(all).toHaveProperty('page', '1');
      expect(all).toHaveProperty('id', '123');
    });
  });

  describe('input() method', () => {
    it('should return value from body', () => {
      const value = controller['input']('name');
      expect(value).toBe('John');
    });

    it('should return value from query', () => {
      const value = controller['input']('page');
      expect(value).toBe('1');
    });

    it('should return value from params', () => {
      const value = controller['input']('id');
      expect(value).toBe('123');
    });

    it('should return default value when field is missing', () => {
      const value = controller['input']('missing', 'default');
      expect(value).toBe('default');
    });

    it('should handle falsy values correctly', () => {
      mockRequest.body = { count: 0, active: false, name: '' };
      controller.setContext(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(controller['input']('count')).toBe(0);
      expect(controller['input']('active')).toBe(false);
      expect(controller['input']('name')).toBe('');
    });
  });

  describe('only() method', () => {
    it('should return only specified fields', () => {
      const only = controller['only'](['name', 'page']);
      expect(only).toEqual({ name: 'John', page: '1' });
      expect(only).not.toHaveProperty('id');
    });
  });

  describe('except() method', () => {
    it('should return all fields except specified ones', () => {
      const except = controller['except'](['name']);
      expect(except).not.toHaveProperty('name');
      expect(except).toHaveProperty('page');
      expect(except).toHaveProperty('id');
    });
  });

  describe('has() method', () => {
    it('should return true when field exists', () => {
      expect(controller['has']('name')).toBe(true);
    });

    it('should return false when field is missing', () => {
      expect(controller['has']('missing')).toBe(false);
    });

    it('should return false when field is null', () => {
      mockRequest.body = { name: null };
      controller.setContext(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(controller['has']('name')).toBe(false);
    });
  });

  describe('filled() method', () => {
    it('should return true when field has value', () => {
      expect(controller['filled']('name')).toBe(true);
    });

    it('should return false when field is empty string', () => {
      mockRequest.body = { name: '' };
      controller.setContext(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      expect(controller['filled']('name')).toBe(false);
    });
  });

  describe('success() method', () => {
    it('should send success response', () => {
      controller['success']({ data: 'test' }, 'Success message', 200);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseJson).toEqual({
        success: true,
        message: 'Success message',
        data: { data: 'test' },
      });
    });
  });

  describe('error() method', () => {
    it('should send error response', () => {
      controller['error']('Error message', 400);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseJson).toEqual({
        success: false,
        message: 'Error message',
      });
    });

    it('should include errors object when provided', () => {
      const errors = { email: ['Invalid email'] };
      controller['error']('Validation failed', 422, errors);
      expect(responseJson.errors).toEqual(errors);
    });
  });

  describe('notFound() method', () => {
    it('should send 404 response', () => {
      controller['notFound']('Not found');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseJson.message).toBe('Not found');
    });
  });

  describe('created() method', () => {
    it('should send 201 response', () => {
      controller['created']({ id: 1 }, 'Created');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseJson.success).toBe(true);
    });
  });
});

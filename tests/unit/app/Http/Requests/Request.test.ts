import { Request, Validation, ValidationException } from '../../../../../src/app/Http/Requests/Request';

/**
 * Test Request class
 */
class TestRequest extends Request {
  public rules(): Record<string, any> {
    return {
      name: [Validation.required('Name is required')],
      email: [Validation.required(), Validation.email()],
    };
  }
}

describe('Request Validation', () => {
  let request: TestRequest;

  beforeEach(() => {
    request = new TestRequest();
  });

  describe('required validation', () => {
    it('should pass when required field is provided', async () => {
      request.setData({ name: 'John', email: 'john@example.com' });
      const validated = await request.validate();
      expect(validated).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should fail when required field is missing', async () => {
      request.setData({ email: 'john@example.com' });
      await expect(request.validate()).rejects.toThrow(ValidationException);
    });

    it('should fail when required field is empty string', async () => {
      request.setData({ name: '', email: 'john@example.com' });
      await expect(request.validate()).rejects.toThrow(ValidationException);
    });

    it('should fail when required field is null', async () => {
      request.setData({ name: null, email: 'john@example.com' });
      await expect(request.validate()).rejects.toThrow(ValidationException);
    });
  });

  describe('email validation', () => {
    it('should pass with valid email', async () => {
      request.setData({ name: 'John', email: 'john@example.com' });
      const validated = await request.validate();
      expect(validated.email).toBe('john@example.com');
    });

    it('should fail with invalid email', async () => {
      request.setData({ name: 'John', email: 'invalid-email' });
      await expect(request.validate()).rejects.toThrow(ValidationException);
    });
  });

  describe('validated() method', () => {
    it('should return only fields with validation rules', () => {
      request.setData({ 
        name: 'John', 
        email: 'john@example.com',
        extraField: 'should be filtered out'
      });
      const validated = request.validated();
      expect(validated).toEqual({ name: 'John', email: 'john@example.com' });
      expect(validated).not.toHaveProperty('extraField');
    });
  });

  describe('all() method', () => {
    it('should return all request data', () => {
      request.setData({ name: 'John', email: 'john@example.com', extra: 'data' });
      const all = request.all();
      expect(all).toEqual({ name: 'John', email: 'john@example.com', extra: 'data' });
    });
  });

  describe('get() method', () => {
    it('should return field value', () => {
      request.setData({ name: 'John' });
      expect(request.get('name')).toBe('John');
    });

    it('should return default value when field is missing', () => {
      request.setData({});
      expect(request.get('name', 'Default')).toBe('Default');
    });
  });

  describe('error messages', () => {
    it('should include field errors in exception', async () => {
      request.setData({});
      try {
        await request.validate();
        fail('Should have thrown ValidationException');
      } catch (error) {
        if (error instanceof ValidationException) {
          expect(error.errors).toHaveProperty('name');
          expect(error.errors).toHaveProperty('email');
          expect(Array.isArray(error.errors.name)).toBe(true);
          expect(Array.isArray(error.errors.email)).toBe(true);
        }
      }
    });
  });
});

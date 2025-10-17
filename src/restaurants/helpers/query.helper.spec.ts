import { buildWhereConditions, buildOrderBy } from './query.helper';

describe('QueryHelper', () => {
  describe('buildWhereConditions', () => {
    it('should build empty where conditions when no filters', () => {
      const where = buildWhereConditions({});
      expect(where).toEqual({});
    });

    it('should build where conditions with cuisine filter', () => {
      const where = buildWhereConditions({ cuisine: 'Italian' });
      expect(where).toEqual({ cuisine_type: 'Italian' });
    });

    it('should build where conditions with neighborhood filter', () => {
      const where = buildWhereConditions({ neighborhood: 'Manhattan' });
      expect(where).toEqual({ neighborhood: 'Manhattan' });
    });

    it('should build where conditions with both filters', () => {
      const where = buildWhereConditions({
        cuisine: 'Mexican',
        neighborhood: 'Brooklyn',
      });
      expect(where).toEqual({
        cuisine_type: 'Mexican',
        neighborhood: 'Brooklyn',
      });
    });

    it('should ignore undefined filters', () => {
      const where = buildWhereConditions({
        cuisine: 'Asian',
        neighborhood: undefined,
      });
      expect(where).toEqual({ cuisine_type: 'Asian' });
    });
  });

  describe('buildOrderBy', () => {
    it('should return default order when no sort specified', () => {
      const orderBy = buildOrderBy('', 'asc');
      expect(orderBy).toEqual({ id: 'DESC' });
    });

    it('should return default order for invalid sort field', () => {
      const orderBy = buildOrderBy('invalid_field', 'asc');
      expect(orderBy).toEqual({ id: 'DESC' });
    });

    it('should build order by cuisine_type ascending', () => {
      const orderBy = buildOrderBy('cuisine_type', 'asc');
      expect(orderBy).toEqual({ cuisine_type: 'ASC' });
    });

    it('should build order by cuisine_type descending', () => {
      const orderBy = buildOrderBy('cuisine_type', 'desc');
      expect(orderBy).toEqual({ cuisine_type: 'DESC' });
    });

    it('should build order by neighborhood ascending', () => {
      const orderBy = buildOrderBy('neighborhood', 'asc');
      expect(orderBy).toEqual({ neighborhood: 'ASC' });
    });

    it('should build order by neighborhood descending', () => {
      const orderBy = buildOrderBy('neighborhood', 'desc');
      expect(orderBy).toEqual({ neighborhood: 'DESC' });
    });

    it('should handle case insensitive order', () => {
      const orderBy = buildOrderBy('cuisine_type', 'DESC');
      expect(orderBy).toEqual({ cuisine_type: 'DESC' });
    });

    it('should default to ASC for invalid order', () => {
      const orderBy = buildOrderBy('cuisine_type', 'invalid');
      expect(orderBy).toEqual({ cuisine_type: 'ASC' });
    });

    it('should not handle rating sort (client-side only)', () => {
      const orderBy = buildOrderBy('rating', 'desc');
      expect(orderBy).toEqual({ id: 'DESC' });
    });
  });

  describe('valid sort fields', () => {
    const validFields = ['cuisine_type', 'neighborhood'];

    validFields.forEach((field) => {
      it(`should handle ${field} sort field`, () => {
        const orderBy = buildOrderBy(field, 'asc');
        expect(orderBy).toEqual({ [field]: 'ASC' });
      });
    });
  });
});

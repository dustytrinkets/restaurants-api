import { FindOptionsWhere } from 'typeorm';
import { Restaurant } from '../../entities/restaurant.entity';

export function buildWhereConditions(filters: {
  cuisine?: string;
  neighborhood?: string;
}): FindOptionsWhere<Restaurant> {
  const where: FindOptionsWhere<Restaurant> = {};

  if (filters.cuisine) {
    where.cuisine_type = filters.cuisine;
  }

  if (filters.neighborhood) {
    where.neighborhood = filters.neighborhood;
  }

  return where;
}

export function buildOrderBy(
  sort: string,
  order: string,
): Record<string, 'ASC' | 'DESC'> {
  const validDatabaseFields = ['cuisine_type', 'neighborhood'];

  if (sort && validDatabaseFields.includes(sort)) {
    return { [sort]: order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' };
  }

  return { id: 'DESC' };
}

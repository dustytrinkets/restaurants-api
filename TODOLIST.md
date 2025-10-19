# Restaurants API

### Public endpoints:
- [x] `GET /restaurants`:
    - [x] Pagination: page, limit.
	- [x] Filters: cuisine, rating, neighborhood.
	- [x] Sorting: sort (ascendente/descendente por campo)
- [x] `GET /restaurants/:id`
- [x] `GET /restaurants/:id/reviews`
- [x] `POST /auth/login`
- [x] `POST /auth/register`

### Authenticated endpoints (roles: USER or ADMIN):
- [x] `GET /me`: Information about the authenticated user.
- [X] `GET /me/reviews`: Reviews created by the authenticated user.
- [X] `POST /restaurants/:id/reviews`: Create a review.
- [X] `PUT /me/reviews/:id`: Edit a review.
- [X] `DELETE /me/reviews/:id`: Delete a review.
- [X] `POST /me/favorites/:restaurantId`: Add a restaurant to favorites.
- [X] `DELETE /me/favorites/:restaurantId`: Delete a restaurant from favorites.
- [X] `GET /me/favorites`: See the list of favorites.

### Admin endpoints:
- [X] `POST /restaurants`: Create a restaurant.
- [X] `PUT /restaurants/:id`: Edit a restaurant.
- [X] `DELETE /restaurants/:id`: Delete a restaurant.
- [X] `GET /admin/stats`: See statistics of: number of users, reviews, restaurants.

### Middlewares    

- [x] Middleware for authentication
- [x] Middleware for roles

### Scalability

As a second step, imagine that your application is growing over time. Scalability is key.
You will need to think of some strategies to make your application scalable. 

Some pointers or ideas:

- [X] Rate Limiting
- [X] Caching
  - [X] GET /restaurants results
  - [X] GET /restaurants/:id
  - [X] GET /restaurants/:id/reviews
  - [X] GET /admin/stats (check)
- [X] Docker
- [X] Database indexing: ensure indexes on cuisine, rating, neighborhood.
- [X] Custom Migration System: Database schema management


### Architecture diagram

Please use [draw.io](https://draw.io), [excalidraw](https://excalidraw.com) or any similar schema tools to create a diagram of the overall architecture of your application.

- [ ] Diagram 1: expose to us how you have designed your current application.

Imagine that after some time our application has *100.000 users per week* and some peak timings during the day with a lot of requests & traffic. 

- [ ] Diagram 2: expose to us how you would scale your application with these new conditions and what you would do to improve the performance of your application.

## Bonus points

- [X] Deploy the app.
- [X] Write realistic unit & end-to-end tests.
- [X] Good documentation is appreciated (with tools like Swagger, Postman, etc or just explicit guidance in the README.md)
- [ ] For statistics: if you have time, create a query that returns the top 3 rated restaurants, the top 3 most reviewed restaurants.

## TODO:

- [X] Logs
- [ ] Connection pooling for DB
- [ ] Review README after finishing

## Future steps

- [ ] Health checks and monitoring (Prometheus, Grafana, etc).
- [ ] Async queue for heavy tasks (reviews analytics, stats aggregation).
- [ ] Implement redis
- [ ] Add step to run migrations on CI on production

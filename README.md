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
- [ ] `GET /me`: Information about the authenticated user.
- [ ] `GET /me/reviews`: Reviews created by the authenticated user.
- [ ] `POST /restaurants/:id/reviews`: Create a review.
- [ ] `PUT /me/reviews/:id`: Edit a review.
- [ ] `DELETE /me/reviews/:id`: Delete a review.
- [ ] `POST /me/favorites/:restaurantId`: Add a restaurant to favorites.
- [ ] `DELETE /me/favorites/:restaurantId`: Delete a restaurant from favorites.
- [ ] `GET /me/favorites`: See the list of favorites.

### Admin endpoints:
- [ ] `POST /restaurants`: Create a restaurant.
- [ ] `PUT /restaurants/:id`: Edit a restaurant.
- [ ] `DELETE /restaurants/:id`: Delete a restaurant.
- [ ] `GET /admin/stats`: See statistics of: number of users, reviews, restaurants.

### Middlewares    

- [x] Middleware for authentication
- [x] Middleware for roles

### Scalability

As a second step, imagine that your application is growing over time. Scalability is key.
You will need to think of some strategies to make your application scalable. 

Some pointers or ideas:

- [ ] Rate Limiting
- [ ] Caching
- [ ] Docker

### Architecture diagram

Please use [draw.io](https://draw.io), [excalidraw](https://excalidraw.com) or any similar schema tools to create a diagram of the overall architecture of your application.

- [ ] Diagram 1: expose to us how you have designed your current application.

Imagine that after some time our application has *100.000 users per week* and some peak timings during the day with a lot of requests & traffic. 

- [ ] Diagram 2: expose to us how you would scale your application with these new conditions and what you would do to improve the performance of your application.

## Bonus points

- [ ] Deploy the app.
- [ ] Write realistic unit & end-to-end tests.
- [ ] Good documentation is appreciated (with tools like Swagger, Postman, etc or just explicit guidance in the README.md)
- [ ] For statistics: if you have time, create a query that returns the top 3 rated restaurants, the top 3 most reviewed restaurants.
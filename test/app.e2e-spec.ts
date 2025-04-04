import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Product Module (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); 
    await app.init();
    server = app.getHttpServer();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  let productId: number;

  it('should create a product (POST /product)', async () => {
    const response = await request(server)
      .post('/product')
      .send({ name: 'MacBook Pro', price: 1299.99 })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('MacBook Pro');
    expect(response.body.price).toBe(1299.99);
    
    productId = response.body.id;
  });

  it('should get all products (GET /product)', async () => {
    const response = await request(server)
      .get('/product')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a single product by ID (GET /product/:id)', async () => {
    const response = await request(server)
      .get(`/product/${productId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', productId);
    expect(response.body.name).toBe('MacBook Pro');
    expect(response.body.price).toBe(1299.99);
  });

  it('should update a product (PATCH /product/:id)', async () => {
    const response = await request(server)
      .patch(`/product/${productId}`)
      .send({ name: 'MacBook Air' })
      .expect(200);

    expect(response.body).toHaveProperty('id', productId);
    expect(response.body.name).toBe('MacBook Air');
    expect(response.body.price).toBe(1299.99);
  });

  it('should delete a product (DELETE /product/:id)', async () => {
    await request(server)
      .delete(`/product/${productId}`)
      .expect(200);

    await request(server)
      .get(`/product/${productId}`)
      .expect(404);
  });

  it('should return 404 when getting a non-existent product', async () => {
    await request(server)
      .get('/product/9999')
      .expect(404);
  });

  it('should return 400 when creating a product with invalid data', async () => {
    await request(server)
      .post('/product')
      .send({ name: '', price: 'invalid_price' })
      .expect(400);
  });
});

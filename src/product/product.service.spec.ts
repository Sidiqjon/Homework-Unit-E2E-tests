// import { Test, TestingModule } from '@nestjs/testing';
// import { ProductService } from './product.service';

// describe('ProductService', () => {
//   let service: ProductService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [ProductService],
//     }).compile();

//     service = module.get<ProductService>(ProductService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockProduct = { id: 1, name: 'MacBook Pro', price: 1299.99 };

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn().mockResolvedValue(mockProduct),
              findMany: jest.fn().mockResolvedValue([mockProduct]),
              findUnique: jest.fn().mockImplementation(({ where }) =>
                where.id === 1 ? mockProduct : null
              ),
              update: jest.fn().mockImplementation(({ where, data }) =>
                where.id === 1 ? { ...mockProduct, ...data } : null
              ),
              delete: jest.fn().mockImplementation(({ where }) =>
                where.id === 1 ? mockProduct : null
              ),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const result = await service.create({ name: 'MacBook Pro', price: 1299.99 });
    expect(result).toEqual(mockProduct);
    expect(prisma.product.create).toHaveBeenCalledWith({ data: { name: 'MacBook Pro', price: 1299.99 } });
  });

  it('should return all products', async () => {
    const result = await service.findAll();
    expect(result).toEqual([mockProduct]);
    expect(prisma.product.findMany).toHaveBeenCalled();
  });

  it('should return a product by ID', async () => {
    const result = await service.findOne(1);
    expect(result).toEqual(mockProduct);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw NotFoundException when product is not found', async () => {
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a product', async () => {
    const result = await service.update(1, { name: 'MacBook Air' });
    expect(result).toEqual({ id: 1, name: 'MacBook Air', price: 1299.99 });
    expect(prisma.product.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'MacBook Air' } });
  });

  it('should throw NotFoundException when updating a non-existent product', async () => {
    await expect(service.update(999, { name: 'MacBook Air' })).rejects.toThrow(NotFoundException);
  });

  it('should delete a product', async () => {
    const result = await service.remove(1);
    expect(result).toEqual(mockProduct);
    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw NotFoundException when deleting a non-existent product', async () => {
    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});

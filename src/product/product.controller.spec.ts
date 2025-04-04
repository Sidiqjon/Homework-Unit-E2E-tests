// import { Test, TestingModule } from '@nestjs/testing';
// import { ProductController } from './product.controller';
// import { ProductService } from './product.service';

// describe('ProductController', () => {
//   let controller: ProductController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [ProductController],
//       providers: [ProductService],
//     }).compile();

//     controller = module.get<ProductController>(ProductController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const mockProduct = { id: 1, name: 'MacBook Pro', price: 1299.99 };

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockProduct),
            findAll: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue({ ...mockProduct, name: 'MacBook Air' }),
            remove: jest.fn().mockResolvedValue(mockProduct),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = { name: 'MacBook Pro', price: 1299.99 };
    const result = await controller.create(dto);
    expect(result).toEqual(mockProduct);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all products', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockProduct]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a product by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockProduct);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a product', async () => {
    const dto: UpdateProductDto = { name: 'MacBook Air' };
    const result = await controller.update('1', dto);
    expect(result).toEqual({ id: 1, name: 'MacBook Air', price: 1299.99 });
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete a product', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual(mockProduct);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});

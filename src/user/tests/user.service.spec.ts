import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import { UserInfo, UserInfoDocument } from '../../schema/user/userInfo.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDesignation } from '../enums/user-designation.enum';

describe('UserService', () => {
  let service: UserService;
  let model: Model<UserInfoDocument>;
  let authService: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserInfo.name),
          useValue: mockUserModel,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<UserInfoDocument>>(getModelToken(UserInfo.name));
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      useremail: 'test@example.com',
      password: 'password123',
      userName: 'Test User',
      location: 'Test Location',
    };

    const hashedPassword = 'hashedPassword123';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserModel.create.mockImplementation((dto) => ({
        ...dto,
        toObject: () => dto,
      }));

      const result = await service.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(result.useremail).toBe(createUserDto.useremail);
      expect(result.password).toBeUndefined(); // Password should be removed from response
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue({ useremail: createUserDto.useremail });

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException on validation error', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      mockUserModel.create.mockRejectedValue({ name: 'ValidationError' });

      await expect(service.createUser(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should set correct default values for new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockAuthService.hashPassword.mockResolvedValue(hashedPassword);
      
      let createdUser;
      mockUserModel.create.mockImplementation((dto) => {
        createdUser = {
          ...dto,
          toObject: () => dto,
        };
        return createdUser;
      });

      await service.createUser(createUserDto);

      expect(createdUser.verification).toBe('incomplete');
      expect(createdUser.active).toBe(true);
      expect(createdUser.cart).toEqual([]);
      expect(createdUser.order).toEqual([]);
      expect(createdUser.permission).toBe('Not Granted');
    });
  });
}); 
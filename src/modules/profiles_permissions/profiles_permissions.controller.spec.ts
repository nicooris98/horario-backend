import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesPermissionsController } from './profiles_permissions.controller';
import { ProfilesPermissionsService } from './profiles_permissions.service';

describe('ProfilesPermissionsController', () => {
  let controller: ProfilesPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesPermissionsController],
      providers: [ProfilesPermissionsService],
    }).compile();

    controller = module.get<ProfilesPermissionsController>(ProfilesPermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesPermissionsService } from './profiles_permissions.service';

describe('ProfilesPermissionsService', () => {
  let service: ProfilesPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilesPermissionsService],
    }).compile();

    service = module.get<ProfilesPermissionsService>(ProfilesPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

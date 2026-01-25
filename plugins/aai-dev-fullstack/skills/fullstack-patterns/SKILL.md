---
name: fullstack-patterns
description: Patterns for implementing end-to-end features across frontend, backend, and database
user-invocable: false
---

# Fullstack Patterns Skill

Patterns for building complete features across all application layers.

## End-to-End Feature Implementation

### Feature: User Profile Management

**Step 1: Database Schema**

```prisma
model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  bio       String?  @db.Text
  website   String?
  location  String?
  avatarUrl String?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Step 2: Shared Types**

```typescript
// shared/types/profile.ts
export interface Profile {
  id: string;
  userId: string;
  bio: string | null;
  website: string | null;
  location: string | null;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  bio?: string;
  website?: string;
  location?: string;
}
```

**Step 3: Validation Schema**

```typescript
// shared/schemas/profile.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

**Step 4: Backend Service**

```typescript
// backend/services/profile.ts
export const profileService = {
  async getByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { userId },
    });
  },

  async upsert(userId: string, data: UpdateProfileInput): Promise<Profile> {
    return prisma.profile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },
};
```

**Step 5: Backend Controller**

```typescript
// backend/controllers/profile.ts
export const profileController = {
  async get(req: Request, res: Response) {
    const profile = await profileService.getByUserId(req.user.id);
    res.json({ data: profile });
  },

  async update(req: Request, res: Response) {
    const profile = await profileService.upsert(req.user.id, req.body);
    res.json({ data: profile });
  },
};
```

**Step 6: Backend Routes**

```typescript
// backend/routes/profile.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { profileController } from '../controllers/profile';
import { updateProfileSchema } from '../../shared/schemas/profile';

const router = Router();

router.get('/', authenticate, profileController.get);
router.put('/', authenticate, validate(updateProfileSchema), profileController.update);

export default router;
```

**Step 7: Frontend API Client**

```typescript
// frontend/api/profile.ts
import { api } from './client';
import { Profile, UpdateProfileInput } from '@/shared/types/profile';

export const profileApi = {
  get: () => api.get<Profile>('/profile'),
  update: (data: UpdateProfileInput) => api.put<Profile>('/profile', data),
};
```

**Step 8: Frontend Hooks**

```typescript
// frontend/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
```

**Step 9: Frontend Component**

```typescript
// frontend/components/ProfileForm.tsx
'use client';

import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { updateProfileSchema } from '@/shared/schemas/profile';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const mutation = useUpdateProfile();

  const form = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: profile,
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data, {
      onSuccess: () => toast.success('Profile updated'),
      onError: (error) => toast.error(error.message),
    });
  });

  if (isLoading) return <Skeleton />;

  return (
    <form onSubmit={onSubmit}>
      <TextField label="Bio" {...form.register('bio')} />
      <TextField label="Website" {...form.register('website')} />
      <TextField label="Location" {...form.register('location')} />
      <Button type="submit" isLoading={mutation.isPending}>
        Save
      </Button>
    </form>
  );
}
```

## Cross-Layer Data Flow

### Optimistic Updates

```typescript
// Frontend: Optimistic update with rollback
const mutation = useMutation({
  mutationFn: updateProfile,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['profile'] });
    const previousData = queryClient.getQueryData(['profile']);
    queryClient.setQueryData(['profile'], (old) => ({ ...old, ...newData }));
    return { previousData };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['profile'], context.previousData);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  },
});
```

### File Upload Flow

```typescript
// Frontend: Upload with progress
async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await api.post('/profile/avatar', formData, {
    onUploadProgress: (progress) => {
      setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
    },
  });

  return data.url;
}

// Backend: Handle upload
router.post('/avatar',
  authenticate,
  upload.single('avatar'),
  async (req, res) => {
    const url = await storageService.upload(req.file);
    await profileService.updateAvatar(req.user.id, url);
    res.json({ data: { url } });
  }
);
```

### Real-Time Sync

```typescript
// Backend: Emit on change
async function updateProfile(userId: string, data: UpdateProfileInput) {
  const profile = await prisma.profile.update({
    where: { userId },
    data,
  });

  // Notify connected clients
  io.to(`user:${userId}`).emit('profile:updated', profile);

  return profile;
}

// Frontend: Subscribe to updates
useEffect(() => {
  socket.on('profile:updated', (profile) => {
    queryClient.setQueryData(['profile'], profile);
  });

  return () => {
    socket.off('profile:updated');
  };
}, []);
```

## Testing Across Layers

### Unit Tests (Service)

```typescript
describe('profileService', () => {
  it('should create profile if not exists', async () => {
    const result = await profileService.upsert('user-1', { bio: 'Hello' });
    expect(result.bio).toBe('Hello');
  });
});
```

### Integration Tests (API)

```typescript
describe('GET /profile', () => {
  it('should return user profile', async () => {
    const res = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('bio');
  });
});
```

### Component Tests (UI)

```typescript
describe('ProfileForm', () => {
  it('should submit updated profile', async () => {
    render(<ProfileForm />);

    await userEvent.type(screen.getByLabelText('Bio'), 'New bio');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Profile updated')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
test('user can update profile', async ({ page }) => {
  await page.goto('/settings/profile');

  await page.fill('[name="bio"]', 'Updated bio');
  await page.click('button:text("Save")');

  await expect(page.locator('text=Profile updated')).toBeVisible();
});
```

## Common Patterns

### Pagination

```typescript
// Backend
async function getUsers(page: number, limit: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Frontend
function useUsers(page: number) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => api.get(`/users?page=${page}`),
    keepPreviousData: true,
  });
}
```

### Search with Debounce

```typescript
// Frontend
function useUserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const results = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => api.get(`/users/search?q=${debouncedQuery}`),
    enabled: debouncedQuery.length >= 2,
  });

  return { query, setQuery, results };
}
```

## Integration

Used by:
- `fullstack-developer` agent
- All feature implementation workflows

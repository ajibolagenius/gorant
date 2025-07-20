# Design Document: Community Groups

## Overview

The Community Groups feature will enable users to create, join, and participate in interest-based communities while maintaining the core anonymity principles of the Rant platform. This design document outlines the architecture, components, data models, and implementation strategies for the Groups feature.

## Architecture

The Groups feature will follow the existing application architecture patterns, with a few additions:

1. **Server Components**:
   - Group listing pages
   - Group detail pages
   - Group discovery components

2. **Client Components**:
   - Group creation modal
   - Group management interfaces
   - Group content feed

3. **Data Flow**:
   - Groups data will be stored in Supabase
   - Real-time updates for group activities using Supabase subscriptions
   - Client-side state management using Zustand for group interactions

4. **Integration Points**:
   - Extends the existing notification system
   - Integrates with the existing rant creation flow
   - Connects with the moderation system
   - Leverages the analytics system for group metrics

## Components and Interfaces

### Group Navigation

```tsx
// components/groups/group-navigation.tsx
export const GroupNavigation = () => {
  // Navigation component for switching between My Groups, Discover, etc.
}
```

### Group Creation Modal

```tsx
// components/groups/create-group-modal.tsx
export const CreateGroupModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  // Form for creating a new group with validation
}
```

### Group Card

```tsx
// components/groups/group-card.tsx
export const GroupCard = ({ group }: { group: Group }) => {
  // Card displaying group info in listings
}
```

### Group Detail View

```tsx
// components/groups/group-detail.tsx
export const GroupDetail = ({ groupId }: { groupId: string }) => {
  // Detailed view of a group with tabs for content, members, etc.
}
```

### Group Feed

```tsx
// components/groups/group-feed.tsx
export const GroupFeed = ({ groupId }: { groupId: string }) => {
  // Masonry grid of rants specific to a group
}
```

### Group Management

```tsx
// components/groups/group-management.tsx
export const GroupManagement = ({ groupId }: { groupId: string }) => {
  // Admin interface for managing group settings and members
}
```

### Group Join Request

```tsx
// components/groups/join-request.tsx
export const JoinRequest = ({ groupId }: { groupId: string }) => {
  // Component for requesting to join a private group
}
```

### Group Member List

```tsx
// components/groups/member-list.tsx
export const MemberList = ({ groupId }: { groupId: string }) => {
  // List of group members with admin actions
}
```

## Data Models

### Group

```typescript
// types/group.ts
export interface Group {
  id: string;
  name: string;
  description: string;
  category: GroupCategory;
  privacy: 'public' | 'private';
  created_at: string;
  updated_at: string;
  member_count: number;
  rant_count: number;
  last_activity_at: string;
  posting_permissions: 'all_members' | 'admins_only';
}

export type GroupCategory =
  | 'technology'
  | 'work'
  | 'relationships'
  | 'mental_health'
  | 'hobbies'
  | 'education'
  | 'entertainment'
  | 'politics'
  | 'other';
```

### GroupMember

```typescript
// types/group-member.ts
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'admin';
  joined_at: string;
  last_active_at: string;
}
```

### GroupJoinRequest

```typescript
// types/group-join-request.ts
export interface GroupJoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}
```

roupRant

```typescript
// types/group-rant.ts
export interface GroupRant extends Rant {
  group_id: string;
}
```

## Database Schema

### groups Table

```sql
create table public.groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text not null,
  privacy text not null default 'public',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  posting_permissions text not null default 'all_members',

  constraint unique_group_name unique (name)
);

-- Enable RLS
alter table public.groups enable row level security;

-- Policies
create policy "Groups are viewable by everyone"
on public.groups for select using (true);

create policy "Groups can be created by authenticated users"
on public.groups for insert with check (auth.role() = 'authenticated');

create policy "Groups can be updated by admins"
on public.groups for update using (
  exists (
    select 1 from public.group_members
    where group_id = id
    and user_id = auth.uid()
    and role = 'admin'
  )
);
```

### group_members Table

```sql
create table public.group_members (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamp with time zone default now(),
  last_active_at timestamp with time zone default now(),

  constraint unique_group_member unique (group_id, user_id)
);

-- Enable RLS
alter table public.group_members enable row level security;

-- Policies
create policy "Group members are viewable by group members"
on public.group_members for select using (
  exists (
    select 1 from public.group_members
    where group_id = group_members.group_id
    and user_id = auth.uid()
  )
);

create policy "Users can join public groups"
on public.group_members for insert with check (
  auth.role() = 'authenticated'
  and user_id = auth.uid()
  and exists (
    select 1 from public.groups
    where id = group_id
    and privacy = 'public'
  )
);

create policy "Group admins can manage members"
on public.group_members for delete using (
  exists (
    select 1 from public.group_members
    where group_id = group_members.group_id
    and user_id = auth.uid()
    and role = 'admin'
  )
);
```

### group_join_requests Table

```sql
create table public.group_join_requests (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  resolved_by uuid references auth.users(id),

  constraint unique_join_request unique (group_id, user_id, status)
);

-- Enable RLS
alter table public.group_join_requests enable row level security;

-- Policies
create policy "Users can view their own join requests"
on public.group_join_requests for select using (
  user_id = auth.uid()
);

create policy "Group admins can view join requests"
on public.group_join_requests for select using (
  exists (
    select 1 from public.group_members
    where group_id = group_join_requests.group_id
    and user_id = auth.uid()
    and role = 'admin'
  )
);

create policy "Users can create join requests"
on public.group_join_requests for insert with check (
  auth.role() = 'authenticated'
  and user_id = auth.uid()
  and exists (
    select 1 from public.groups
    where id = group_id
    and privacy = 'private'
  )
);

create policy "Group admins can update join requests"
on public.group_join_requests for update using (
  exists (
    select 1 from public.group_members
    where group_id = group_join_requests.group_id
    and user_id = auth.uid()
    and role = 'admin'
  )
);
```

### group_rants Table

```sql
create table public.group_rants (
  id uuid primary key default uuid_generate_v4(),
  rant_id uuid references public.rants(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,

  constraint unique_group_rant unique (rant_id, group_id)
);

-- Enable RLS
alter table public.group_rants enable row level security;

-- Policies
create policy "Group rants are viewable by group members"
on public.group_rants for select using (
  exists (
    select 1 from public.group_members
    where group_id = group_rants.group_id
    and user_id = auth.uid()
  )
);

create policy "Group members can post rants"
on public.group_rants for insert with check (
  exists (
    select 1 from public.group_members
    where group_id = group_rants.group_id
    and user_id = auth.uid()
    and (
      (select posting_permissions from public.groups where id = group_id) = 'all_members'
      or role = 'admin'
    )
  )
);
```

## Custom Hooks

### useGroups

```typescript
// hooks/use-groups.ts
export const useGroups = () => {
  // Hook for fetching and managing groups the user is a member of
};
```

### useGroupDiscovery

```typescript
// hooks/use-group-discovery.ts
export const useGroupDiscovery = () => {
  // Hook for discovering and recommending groups
};
```

### useGroupManagement

```typescript
// hooks/use-group-management.ts
export const useGroupManagement = (groupId: string) => {
  // Hook for group admin functions
};
```

### useGroupContent

```typescript
// hooks/use-group-content.ts
export const useGroupContent = (groupId: string) => {
  // Hook for managing group rants and content
};
```

## Page Structure

### Groups Main Page

```tsx
// app/groups/page.tsx
export default function GroupsPage() {
  return (
    <div>
      <GroupNavigation />
      <GroupsClient />
    </div>
  );
}
```

### Group Detail Page

```tsx
// app/groups/[groupId]/page.tsx
export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  return <GroupDetailClient groupId={params.groupId} />;
}
```

### Group Management Page

```tsx
// app/groups/[groupId]/manage/page.tsx
export default function GroupManagementPage({ params }: { params: { groupId: string } }) {
  return <GroupManagementClient groupId={params.groupId} />;
}
```

## Error Handling

1. **Group Creation Errors**:
   - Duplicate group names
   - Invalid input validation
   - Permission errors

2. **Group Joining Errors**:
   - Already a member
   - Pending request exists
   - Group no longer exists

3. **Content Posting Errors**:
   - Insufficient permissions
   - Content moderation failures
   - Rate limiting

4. **Admin Action Errors**:
   - Cannot remove last admin
   - Cannot modify higher-privilege users
   - Concurrent modification conflicts

## Testing Strategy

### Unit Tests

1. **Group Creation**:
   - Test validation rules
   - Test duplicate name handling
   - Test privacy settings

2. **Group Membership**:
   - Test joining public groups
   - Test requesting to join private groups
   - Test admin approval flow

3. **Group Content**:
   - Test posting to groups
   - Test content visibility rules
   - Test engagement metrics

### Integration Tests

1. **Group Flow**:
   - Create group → post content → engage with content
   - Join group → interact with existing content
   - Request to join → approval → access content

2. **Admin Flow**:
   - Create group → manage settings → manage members
   - Approve/reject join requests
   - Moderate group content

### End-to-End Tests

1. **Group Discovery**:
   - Search and filter groups
   - Group recommendations
   - Group activity metrics

2. **Group Interactions**:
   - Full group lifecycle from creation to active engagement
   - Member management workflow
   - Content moderation workflow

## Performance Considerations

1. **Group Listings**:
   - Implement pagination for group listings
   - Cache popular and recommended groups
   - Optimize group card rendering for large lists

2. **Group Content**:
   - Virtualize group content feed for performance
   - Implement lazy loading for group content
   - Optimize images and media in group posts

3. **Real-time Updates**:
   - Use efficient subscription patterns
   - Batch updates for high-activity groups
   - Implement debouncing for frequent updates

## Security Considerations

1. **Privacy Protection**:
   - Ensure private group content remains private
   - Protect member identities within groups
   - Prevent information leakage between groups

2. **Access Control**:
   - Strict enforcement of group membership rules
   - Proper permission checks for admin actions
   - Validation of group join requests

3. **Content Security**:
   - Apply content moderation to group posts
   - Prevent cross-group content sharing without permission
   - Rate limiting to prevent spam

## Accessibility Considerations

1. **Navigation**:
   - Keyboard navigation for group interfaces
   - Screen reader support for group actions
   - Focus management for modals and forms

2. **Content Consumption**:
   - Alternative text for group images
   - Readable typography and contrast
   - Responsive design for all device sizes

3. **Interaction**:
   - Clear error messages and validation feedback
   - Consistent interaction patterns
   - Loading states and progress indicators

## Implementation Phases

1. **Phase 1: Core Group Functionality**
   - Group creation and basic management
   - Public group joining
   - Group content posting

2. **Phase 2: Enhanced Group Features**
   - Private groups and join requests
   - Advanced group management
   - Group recommendations

3. **Phase 3: Group Engagement**
   - Group notifications
   - Group activity metrics
   - Group content moderation

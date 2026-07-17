import { Rant } from '@/components/enhanced-rant-card';
import { normalizeRant } from '@/lib/utils';

/**
 * Browser-side client for the groups API (/app/api/groups/*).
 */

export interface Group {
    id: string;
    name: string;
    description: string;
    mood: string;
    created_by: string;
    created_at: string;
    members_count: number;
    rants_count: number;
    is_member: boolean;
}

async function parseError(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        return data?.error || fallback;
    } catch {
        return fallback;
    }
}

export async function fetchGroupsApi(viewerId?: string): Promise<Group[]> {
    const qs = viewerId ? `?viewer=${encodeURIComponent(viewerId)}` : '';
    const res = await fetch(`/api/groups${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load groups.'));
    const { groups } = await res.json();
    return groups || [];
}

export async function fetchGroupApi(
    id: string,
    viewerId?: string
): Promise<{ group: Group; rants: Rant[] }> {
    const qs = viewerId ? `?viewer=${encodeURIComponent(viewerId)}` : '';
    const res = await fetch(`/api/groups/${encodeURIComponent(id)}${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load group.'));
    const data = await res.json();
    return {
        group: data.group as Group,
        rants: (data.rants || []).map(normalizeRant),
    };
}

export async function createGroupApi(input: {
    name: string;
    description: string;
    mood: string;
    anonymousId: string;
}): Promise<Group> {
    const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to create group.'));
    const { group } = await res.json();
    return group as Group;
}

/** Join or leave a group. Returns the group's updated state for the viewer. */
export async function setGroupMembershipApi(
    groupId: string,
    anonymousId: string,
    join: boolean
): Promise<Group> {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/join`, {
        method: join ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to update membership.'));
    const { group } = await res.json();
    return group as Group;
}

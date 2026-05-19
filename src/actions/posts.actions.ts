'use server';

import { requireEditor } from '@/lib/auth';
import { postsService } from '@/lib/services/posts.service';
import { createPostSchema, updatePostSchema } from '@/lib/validations/posts.schema';
import { revalidatePath } from 'next/cache';

export async function createPostAction(data: any) {
  try {
    const session = await requireEditor();

    const parsed = createPostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const postData = { ...parsed.data, author_id: session.user.id };
    const post = await postsService.createPost(postData);
    
    revalidatePath('/dashboard/posts');
    revalidatePath('/dashboard/posts/new');
    revalidatePath('/news');
    
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create post' };
  }
}

export async function updatePostAction(id: string, data: any) {
  try {
    const session = await requireEditor();

    const parsed = updatePostSchema.safeParse({ id, ...data });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id: postId, ...updateData } = parsed.data;
    const post = await postsService.updatePost(postId, updateData);
    
    revalidatePath('/dashboard/posts');
    revalidatePath(`/dashboard/posts/${postId}/edit`);
    revalidatePath('/news');
    
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update post' };
  }
}

export async function deletePostAction(id: string) {
  try {
    await requireEditor();

    await postsService.deletePost(id);
    revalidatePath('/dashboard/posts');
    revalidatePath('/news');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete post' };
  }
}

export async function togglePostPublishAction(id: string, published: boolean) {
  try {
    await requireEditor();

    const post = await postsService.updatePost(id, { 
      published, 
      published_at: published ? new Date().toISOString() : null 
    });
    
    revalidatePath('/dashboard/posts');
    revalidatePath('/news');
    
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update publish status' };
  }
}

export async function getSearchPostsAction() {
  try {
    const posts = await postsService.getPosts(undefined, true);
    // Filter to only include public news and activities
    const filtered = posts.filter((p) => p.type === 'news' || p.type === 'activity');
    return {
      success: true,
      data: filtered.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        publishedAt: p.publishedAt,
        type: p.type,
        coverImage: p.coverImage,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch search posts' };
  }
}


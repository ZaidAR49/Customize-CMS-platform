'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { postsService } from '@/lib/services/posts.service';
import { createPostSchema, updatePostSchema } from '@/lib/validations/posts.schema';
import { revalidatePath } from 'next/cache';

export async function createPostAction(data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return { success: false, error: 'Unauthorized access.' };
    }

    const parsed = createPostSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const postData = { ...parsed.data, author_id: session.user.id };
    const post = await postsService.createPost(postData);
    
    revalidatePath('/dashboard/posts');
    revalidatePath('/news');
    
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create post' };
  }
}

export async function updatePostAction(id: string, data: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return { success: false, error: 'Unauthorized access.' };
    }

    const parsed = updatePostSchema.safeParse({ id, ...data });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { id: postId, ...updateData } = parsed.data;
    const post = await postsService.updatePost(postId, updateData);
    
    revalidatePath('/dashboard/posts');
    revalidatePath('/news');
    
    return { success: true, data: post };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update post' };
  }
}

export async function deletePostAction(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return { success: false, error: 'Unauthorized access.' };
    }

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
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
      return { success: false, error: 'Unauthorized access.' };
    }

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

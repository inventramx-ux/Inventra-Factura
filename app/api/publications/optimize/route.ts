import { NextResponse } from 'next/server';
import { optimizePublication } from '@/lib/ai';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { publicationOperations } from '@/lib/publications';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, platform, product_data, enabled_fields, style, length } = await request.json();

    if (!name || !platform) {
      return NextResponse.json(
        { error: 'El nombre y la plataforma son obligatorios.' },
        { status: 400 }
      );
    }

    let isPro = false;
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (subData) {
      isPro = subData.status === "pro";
    } else {
      const client = await clerkClient();
      const userObj = await client.users.getUser(userId);
      isPro = userObj.publicMetadata?.subscriptionStatus === "pro";
    }

    // Remove old limitation logic, limits are now on creation
    // If the user is on free tier we just let them optimize the publications they managed to create
    const optimized = await optimizePublication(name, platform, product_data, enabled_fields, style, isPro, length);

    return NextResponse.json(optimized);
  } catch (error: any) {
    console.error('Error in optimization API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la optimización.' },
      { status: 500 }
    );
  }
}

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

    if (!isPro) {
      const stats = await publicationOperations.getUsageStats(userId);
      if (stats.count >= 3) {
        return NextResponse.json(
          { error: 'Has alcanzado el límite de 3 optimizaciones gratuitas cada 30 días. Mejora a PRO para continuar.', limitReached: true },
          { status: 403 }
        );
      }
    }

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

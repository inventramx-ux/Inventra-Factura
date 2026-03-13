import { NextResponse } from 'next/server';
import { optimizePublication } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { name, platform, product_data, enabled_fields, style } = await request.json();

    if (!name || !platform) {
      return NextResponse.json(
        { error: 'El nombre y la plataforma son obligatorios.' },
        { status: 400 }
      );
    }

    const optimized = await optimizePublication(name, platform, product_data, enabled_fields, style);

    return NextResponse.json(optimized);
  } catch (error: any) {
    console.error('Error in optimization API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la optimización.' },
      { status: 500 }
    );
  }
}

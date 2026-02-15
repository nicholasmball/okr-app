import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const krId = request.nextUrl.searchParams.get('krId');
  if (!krId) {
    return NextResponse.json([], { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  const { data, error } = await supabase
    .from('check_ins')
    .select('id, value, status, comment, created_at, author:profiles!check_ins_author_id_fkey(full_name)')
    .eq('key_result_id', krId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

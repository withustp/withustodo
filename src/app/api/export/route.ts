import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Export API Route
 * GET /api/export?format=csv|json
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // In a real app, fetch actual tasks
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return new NextResponse('Error fetching tasks', { status: 500 });
  }

  const exportData = tasks || [];

  if (format === 'csv') {
    if (exportData.length === 0) {
      return new NextResponse('id,title,status\n', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tasks.csv"',
        },
      });
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="tasks.csv"',
      },
    });
  }

  // Default JSON
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="tasks.json"',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getServices } from '@/lib/db-queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ results: { projects: [], services: [] } });
    }

    const [projectsList, servicesList] = await Promise.all([
      getProjects({ search: query, publishedOnly: true }),
      getServices({ publishedOnly: true }),
    ]);

    const q = query.toLowerCase();
    const matchingServices = servicesList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.categoryName?.toLowerCase().includes(q)
    );

    return NextResponse.json({
      results: {
        projects: projectsList.slice(0, 8),
        services: matchingServices.slice(0, 8),
      },
    });
  } catch (error) {
    console.error('API /api/search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

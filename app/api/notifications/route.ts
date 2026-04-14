import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    notifications: [
      { id: 'n1', title: 'Νέο επεισόδιο', message: 'Προστέθηκε νέο επεισόδιο του Solo Leveling.', read: false }
    ]
  });
}

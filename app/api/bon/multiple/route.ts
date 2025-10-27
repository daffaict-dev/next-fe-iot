import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const bonData = await request.json();
    
    console.log('Received bon data:', bonData); // Debug log

    // Validasi data
    if (!bonData.nama_pengebon || !bonData.purpose || !bonData.items || bonData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Untuk sementara, kita simpan response success
    const mockResponse = {
      success: true,
      data: {
        id: Date.now(),
        ...bonData,
        created_at: new Date().toISOString()
      },
      message: 'Bon multiple komponen berhasil disimpan'
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Error creating multiple bon:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
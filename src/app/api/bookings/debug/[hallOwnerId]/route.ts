import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

// GET /api/bookings/debug/[hallOwnerId] - View all bookings for debugging
export async function GET(
  request: NextRequest,
  { params }: { params: { hallOwnerId: string } }
) {
  try {
    const { hallOwnerId } = params;
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    // Get all bookings for this hall owner
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('hallOwnerId', '==', hallOwnerId)
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);

    const bookings = bookingsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        eventType: data.eventType,
        selectedHall: data.selectedHall,
        hallName: data.hallName,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        calculatedPrice: data.calculatedPrice,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Filter active bookings if not including all
    const filteredBookings = includeAll
      ? bookings
      : bookings.filter((b) => ['pending', 'confirmed'].includes(b.status));

    // Group by date and resource
    const groupedByDate: Record<string, any[]> = {};
    filteredBookings.forEach((booking) => {
      const key = `${booking.bookingDate} - ${booking.hallName}`;
      if (!groupedByDate[key]) {
        groupedByDate[key] = [];
      }
      groupedByDate[key].push(booking);
    });

    return NextResponse.json({
      totalBookings: bookingsSnapshot.docs.length,
      activeBookings: filteredBookings.length,
      bookings: filteredBookings,
      groupedByDate,
      hallOwnerId,
    });
  } catch (error: any) {
    console.error('Error fetching debug bookings:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/debug/[hallOwnerId]?bookingId=xxx - Delete a specific booking for debugging
export async function DELETE(
  request: NextRequest,
  { params }: { params: { hallOwnerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { message: 'bookingId query parameter is required' },
        { status: 400 }
      );
    }

    // Delete the booking
    await deleteDoc(doc(db, 'bookings', bookingId));

    return NextResponse.json({
      message: 'Booking deleted successfully',
      bookingId,
    });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


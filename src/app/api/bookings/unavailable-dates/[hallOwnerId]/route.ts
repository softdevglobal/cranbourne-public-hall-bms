import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

type UnavailableEntry = {
  bookingId: string;
  startTime: string;
  endTime: string;
  customerName: string;
  eventType: string;
  status: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hallOwnerId: string }> }
) {
  try {
    const { hallOwnerId } = await context.params;
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get('resourceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Fetching unavailable dates for hallOwnerId:', hallOwnerId);
    console.log('Query params:', { resourceId, startDate, endDate });

    // Validate hall owner exists
    const userDocRef = doc(db, 'users', hallOwnerId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('Hall owner not found:', hallOwnerId);
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData.role !== 'hall_owner') {
      console.log('User is not a hall owner:', userData.role);
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    console.log('Hall owner validated:', userData.name || userData.businessName);

    // Get all bookings for this hall owner
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('hallOwnerId', '==', hallOwnerId)
    );

    console.log('Executing Firestore query...');
    const bookingsSnapshot = await getDocs(bookingsQuery);
    console.log('Found', bookingsSnapshot.docs.length, 'total bookings');

    // Filter bookings in memory
    const filteredBookings = bookingsSnapshot.docs.filter((doc) => {
      const booking = doc.data();

      // Filter by status
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return false;
      }

      // Filter by resource if specified
      if (resourceId && booking.selectedHall !== resourceId) {
        return false;
      }

      // Filter by date range if specified
      if (startDate && booking.bookingDate < startDate) {
        return false;
      }
      if (endDate && booking.bookingDate > endDate) {
        return false;
      }

      return true;
    });

    console.log('Filtered to', filteredBookings.length, 'active bookings');

    // Group bookings by date and resource
    const unavailableDates: Record<string, Record<string, UnavailableEntry[]>> = {};

    filteredBookings.forEach((doc) => {
      const booking = doc.data();
      const bookingDate = booking.bookingDate;
      const selectedHall = booking.selectedHall;

      if (!bookingDate || !selectedHall) {
        console.log('Skipping booking with missing data:', booking);
        return;
      }

      if (!unavailableDates[bookingDate]) {
        unavailableDates[bookingDate] = {};
      }

      if (!unavailableDates[bookingDate][selectedHall]) {
        unavailableDates[bookingDate][selectedHall] = [];
      }

      unavailableDates[bookingDate][selectedHall].push({
        bookingId: doc.id,
        startTime: booking.startTime || 'N/A',
        endTime: booking.endTime || 'N/A',
        customerName: booking.customerName || 'Unknown',
        eventType: booking.eventType || 'Unknown',
        status: booking.status || 'Unknown',
      });
    });

    console.log('Processed unavailable dates:', Object.keys(unavailableDates));

    return NextResponse.json({
      unavailableDates,
      totalBookings: filteredBookings.length,
      message: 'Successfully fetched unavailable dates',
    });
  } catch (error: unknown) {
    console.error('Error fetching unavailable dates:', error);
    const message = error instanceof Error ? error.message : 'Internal server error while fetching unavailable dates';
    return NextResponse.json(
      {
        message,
      },
      { status: 500 }
    );
  }
}


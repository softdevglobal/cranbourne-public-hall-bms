import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp, runTransaction, updateDoc, setDoc } from 'firebase/firestore';
import { emailService } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      eventType,
      selectedHall,
      bookingDate,
      startTime,
      endTime,
      additionalDescription,
      hallOwnerId,
      estimatedPrice,
      customerAvatar,
      guestCount,
      bookingSource = 'website',
    } = body;

    console.log('Creating booking with data:', {
      customerName,
      customerEmail,
      selectedHall,
      bookingDate,
      startTime,
      endTime,
    });

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !eventType ||
      !selectedHall ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      !hallOwnerId
    ) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: customerName, customerEmail, customerPhone, eventType, selectedHall, bookingDate, startTime, endTime, hallOwnerId',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = customerPhone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's not in the past
    const bookingDateObj = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDateObj.getTime())) {
      return NextResponse.json(
        { message: 'Invalid booking date format' },
        { status: 400 }
      );
    }

    if (bookingDateObj < today) {
      return NextResponse.json(
        { message: 'Booking date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { message: 'Invalid time format. Use HH:MM format (e.g., 09:00)' },
        { status: 400 }
      );
    }

    // Validate start time is before end time
    const startTimeObj = new Date(`2000-01-01T${startTime}:00`);
    const endTimeObj = new Date(`2000-01-01T${endTime}:00`);
    if (startTimeObj >= endTimeObj) {
      return NextResponse.json(
        { message: 'Start time must be before end time' },
        { status: 400 }
      );
    }

    // Verify hall owner exists
    const hallOwnerDocRef = doc(db, 'users', hallOwnerId);
    const hallOwnerDoc = await getDoc(hallOwnerDocRef);

    if (!hallOwnerDoc.exists()) {
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    const hallOwnerData = hallOwnerDoc.data();
    if (hallOwnerData.role !== 'hall_owner') {
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    // Verify selected hall exists and belongs to the hall owner
    const hallDocRef = doc(db, 'resources', selectedHall);
    const hallDoc = await getDoc(hallDocRef);
    
    if (!hallDoc.exists()) {
      return NextResponse.json(
        { message: 'Selected hall not found' },
        { status: 404 }
      );
    }

    const hallData = hallDoc.data();
    if (hallData.hallOwnerId !== hallOwnerId) {
      return NextResponse.json(
        { message: 'Selected hall does not belong to the specified hall owner' },
        { status: 400 }
      );
    }

    // Check for conflicting bookings
    const conflictingBookingsQuery = query(
      collection(db, 'bookings'),
      where('hallOwnerId', '==', hallOwnerId),
      where('selectedHall', '==', selectedHall),
      where('bookingDate', '==', bookingDate)
    );

    const conflictingBookingsSnapshot = await getDocs(conflictingBookingsQuery);
    
    console.log(`Found ${conflictingBookingsSnapshot.docs.length} bookings for the same date and resource`);

    // Check for time conflicts
    for (const bookingDoc of conflictingBookingsSnapshot.docs) {
      const booking = bookingDoc.data();
      
      console.log('Checking booking:', {
        id: bookingDoc.id,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        customerName: booking.customerName,
      });
      
      // Only check active bookings (pending or confirmed)
      if (!['pending', 'confirmed'].includes(booking.status)) {
        console.log('Skipping booking - status is:', booking.status);
        continue;
      }

      const existingStart = new Date(`2000-01-01T${booking.startTime}:00`);
      const existingEnd = new Date(`2000-01-01T${booking.endTime}:00`);

      console.log('Time comparison:', {
        newBooking: { start: startTimeObj, end: endTimeObj },
        existingBooking: { start: existingStart, end: existingEnd },
        overlaps: startTimeObj < existingEnd && endTimeObj > existingStart,
      });

      // Check if times overlap
      if (startTimeObj < existingEnd && endTimeObj > existingStart) {
        console.log('CONFLICT DETECTED:', {
          newBooking: `${startTime} - ${endTime}`,
          existingBooking: `${booking.startTime} - ${booking.endTime}`,
        });
        
        return NextResponse.json(
          {
            message: 'Time slot is already booked. Please choose a different time.',
            conflictingBooking: {
              bookingId: bookingDoc.id,
              startTime: booking.startTime,
              endTime: booking.endTime,
              customerName: booking.customerName,
              status: booking.status,
            },
            debug: {
              requestedTime: `${startTime} - ${endTime}`,
              bookedTime: `${booking.startTime} - ${booking.endTime}`,
              date: bookingDate,
              resource: hallData.name,
            },
          },
          { status: 409 }
        );
      }
    }
    
    console.log('No conflicts found, proceeding with booking creation');

    // Calculate booking price
    let calculatedPrice = 0;
    let priceDetails: {
      rateType: string;
      weekdayRate: number;
      weekendRate: number;
      appliedRate: number;
      durationHours: number;
      isWeekend: boolean;
      calculationMethod: 'hourly' | 'daily';
      frontendEstimatedPrice: number | null;
    } | null = null;

    try {
      // Get pricing for the selected hall
      const pricingQuery = query(
        collection(db, 'pricing'),
        where('hallOwnerId', '==', hallOwnerId),
        where('resourceId', '==', selectedHall)
      );
      
      const pricingSnapshot = await getDocs(pricingQuery);

      if (!pricingSnapshot.empty) {
        const pricingData = pricingSnapshot.docs[0].data();

        // Calculate duration in hours
        const durationHours = (endTimeObj.getTime() - startTimeObj.getTime()) / (1000 * 60 * 60);

        // Check if it's weekend (Saturday = 6, Sunday = 0)
        const isWeekend = bookingDateObj.getDay() === 0 || bookingDateObj.getDay() === 6;

        const rate = isWeekend ? pricingData.weekendRate : pricingData.weekdayRate;

        if (pricingData.rateType === 'hourly') {
          calculatedPrice = rate * durationHours;
        } else {
          // For daily rates, assume minimum 4 hours for half day, 8+ hours for full day
          calculatedPrice = durationHours >= 8 ? rate : rate * 0.5;
        }

        priceDetails = {
          rateType: pricingData.rateType,
          weekdayRate: pricingData.weekdayRate,
          weekendRate: pricingData.weekendRate,
          appliedRate: rate,
          durationHours: durationHours,
          isWeekend: isWeekend,
          calculationMethod: pricingData.rateType === 'hourly' ? 'hourly' : 'daily',
          frontendEstimatedPrice: estimatedPrice || null,
        };

        console.log('Price calculation details:', {
          resourceId: selectedHall,
          rateType: pricingData.rateType,
          weekdayRate: pricingData.weekdayRate,
          weekendRate: pricingData.weekendRate,
          appliedRate: rate,
          durationHours: durationHours,
          isWeekend: isWeekend,
          calculatedPrice: calculatedPrice,
          frontendEstimatedPrice: estimatedPrice,
        });
      } else {
        console.log('No pricing found for resource:', selectedHall);
        // Use frontend estimated price if no pricing is set
        calculatedPrice = estimatedPrice || 0;
      }
    } catch (pricingError: unknown) {
      console.error('Error calculating price:', pricingError);
      // Use frontend estimated price if calculation fails
      calculatedPrice = estimatedPrice || 0;
    }

    // Generate a human-readable unique booking code with collision check: BK-YYYYMMDD-ABCDE
    const ymd = bookingDate.replace(/-/g, '');
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    function randomSuffix(len = 5) {
      let s = '';
      for (let i = 0; i < len; i++) s += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      return s;
    }
    async function createUniqueBookingCode(): Promise<string> {
      const maxAttempts = 12;
      for (let i = 0; i < maxAttempts; i++) {
        const candidate = `BK-${ymd}-${randomSuffix(5)}`;
        const checkQ = query(collection(db, 'bookings'), where('bookingCode', '==', candidate));
        const check = await getDocs(checkQ);
        if (check.empty) return candidate;
      }
      throw new Error('Could not allocate a unique booking code');
    }
    let bookingCode: string | null = null;
    try {
      bookingCode = await createUniqueBookingCode();
    } catch (err) {
      console.warn('bookingCode generation failed (non-blocking):', (err as Error)?.message || err);
    }

    // Pre-create the document ID to ensure we can set a fallback code on initial write
    const preCreatedRef = doc(collection(db, 'bookings'));
    if (!bookingCode) {
      const fallback = `BK-${ymd}-${preCreatedRef.id.slice(-6).toUpperCase()}`;
      bookingCode = fallback;
      console.log('Using precomputed fallback bookingCode:', fallback);
    }

    // Create booking data
    const bookingData = {
      customerId: customerId || null,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: cleanedPhone,
      customerAvatar: customerAvatar || null,
      eventType: eventType,
      selectedHall: selectedHall,
      hallName: hallData.name,
      bookingDate: bookingDate,
      startTime: startTime,
      endTime: endTime,
      guestCount: guestCount || null,
      additionalDescription: additionalDescription || '',
      hallOwnerId: hallOwnerId,
      calculatedPrice: calculatedPrice,
      priceDetails: priceDetails,
      status: 'pending',
      bookingSource: bookingSource || 'website',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(bookingCode ? { bookingCode } : {}),
    };

    // Save to Firestore (single write including bookingCode)
    await setDoc(preCreatedRef, bookingData);
    const docRef = preCreatedRef;

    console.log('Booking created successfully:', docRef.id);

    // Create notification for hall owner
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: hallOwnerId,
        type: 'new_booking',
        title: 'New Booking Request',
        message: `New booking request from ${customerName} for ${bookingDate}`,
        data: {
          bookingId: docRef.id,
          ...(bookingCode ? { bookingCode } : {}),
          customerName: customerName,
          bookingDate: bookingDate,
          hallName: hallData.name,
        },
        isRead: false,
        createdAt: serverTimestamp(),
      });

      console.log('Notification created for hall owner');
    } catch (notificationError: unknown) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the booking if notification creation fails
    }

    // Send emails to customer and hall owner
    try {
      // Send confirmation email to customer
      await emailService.sendBookingConfirmationToCustomer({
        bookingId: docRef.id,
        ...(bookingCode ? { bookingCode } : {}),
        customerName: customerName,
        customerEmail: customerEmail,
        eventType: eventType,
        hallName: hallData.name,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        guestCount: guestCount,
        calculatedPrice: calculatedPrice,
      });

      console.log('Confirmation email sent to customer:', customerEmail);

      // Send notification email to hall owner
      await emailService.sendBookingNotificationToHallOwner({
        bookingId: docRef.id,
        ...(bookingCode ? { bookingCode } : {}),
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: cleanedPhone,
        eventType: eventType,
        hallName: hallData.name,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
        guestCount: guestCount,
        calculatedPrice: calculatedPrice,
        hallOwnerEmail: hallOwnerData.email,
      });

      console.log('Notification email sent to hall owner:', hallOwnerData.email);
    } catch (emailError: unknown) {
      console.error('Error sending emails:', emailError);
      // Don't fail the booking if email sending fails
      // But log it for monitoring
    }

    return NextResponse.json({
      message: 'Booking created successfully',
      bookingId: docRef.id,
      bookingCode: bookingCode,
      bookingSource: bookingSource || 'website',
      calculatedPrice: calculatedPrice,
      status: 'pending',
    });
  } catch (error: unknown) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


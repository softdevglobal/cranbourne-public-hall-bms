import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { hallOwnerId: string } }
) {
  try {
    const { hallOwnerId } = params;

    // Get hall owner data to verify they exist
    const userDocRef = doc(db, 'users', hallOwnerId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData.role !== 'hall_owner') {
      return NextResponse.json(
        { message: 'Hall owner not found' },
        { status: 404 }
      );
    }

    // Get all pricing for this hall owner
    const pricingQuery = query(
      collection(db, 'pricing'),
      where('hallOwnerId', '==', hallOwnerId)
    );
    const pricingSnapshot = await getDocs(pricingQuery);

    const pricing = pricingSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        resourceId: data.resourceId || '',
        resourceName: data.resourceName || '',
        rateType: data.rateType || 'hourly',
        weekdayRate: data.weekdayRate || 0,
        weekendRate: data.weekendRate || 0,
        description: data.description || '',
        hallOwnerId: data.hallOwnerId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    }).sort((a, b) => {
      // Sort by resource name
      return a.resourceName.localeCompare(b.resourceName);
    });

    return NextResponse.json(pricing);
  } catch (error: any) {
    console.error('Error fetching public pricing:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


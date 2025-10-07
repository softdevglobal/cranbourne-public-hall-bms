import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

type ResourceItem = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  code: string;
  description: string;
  hallOwnerId: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hallOwnerId: string }> }
) {
  try {
    const { hallOwnerId } = await context.params;

    // Get hall owner data to verify they exist and get their information
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

    // Get all resources for this hall owner
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('hallOwnerId', '==', hallOwnerId)
    );
    const resourcesSnapshot = await getDocs(resourcesQuery);

    const resources: ResourceItem[] = resourcesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        type: data.type || 'hall',
        capacity: data.capacity || 0,
        code: data.code || '',
        description: data.description || '',
        hallOwnerId: data.hallOwnerId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    }).sort((a, b) => {
      // Sort by name
      return a.name.localeCompare(b.name);
    });

    // Include hall owner information
    const hallOwnerInfo = {
      name: userData.name || userData.businessName || 'Hall Owner',
      address: userData.address || 'Address not provided',
      phone: userData.phone || userData.contactNumber || 'Phone not provided',
      email: userData.email || 'Email not provided',
      businessName: userData.businessName || userData.name || 'Business Name',
    };

    return NextResponse.json({
      resources,
      hallOwner: hallOwnerInfo,
    });
  } catch (error: unknown) {
    console.error('Error fetching public resources:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


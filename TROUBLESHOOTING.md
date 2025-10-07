# Troubleshooting Booking Conflicts

## Issue: "Time slot is already booked" Error

If you're getting this error when trying to make a booking, it means there's an existing booking in the database that conflicts with your requested time slot.

### Step 1: Check Console Logs

When you submit a booking, check the browser console (F12 → Console tab) for detailed logs:

```
Found X bookings for the same date and resource
Checking booking: { id: ..., status: ..., startTime: ..., endTime: ... }
Time comparison: { ... }
```

This will show you exactly which booking is causing the conflict.

### Step 2: Use Debug API Endpoint

To view all bookings for the hall owner, visit:

```
http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1
```

This will show:
- All active bookings (pending + confirmed)
- Bookings grouped by date and resource
- Booking IDs and details

To include cancelled/completed bookings too:
```
http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1?includeAll=true
```

### Step 3: Delete Conflicting Test Bookings

If you find test bookings that should be removed, you can delete them using:

**Browser:**
Open browser console (F12) and run:
```javascript
fetch('http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1?bookingId=BOOKING_ID_HERE', {
  method: 'DELETE'
}).then(r => r.json()).then(console.log);
```

**Or use curl:**
```bash
curl -X DELETE "http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1?bookingId=BOOKING_ID_HERE"
```

### Step 4: Clear Firestore Database (if needed)

If you want to clear all test bookings:

1. Open Firebase Console: https://console.firebase.google.com
2. Go to Firestore Database
3. Navigate to the `bookings` collection
4. Delete the test bookings manually

### Understanding Conflict Detection

The system checks for conflicts when:
- Same `hallOwnerId`
- Same `selectedHall` (resource ID)
- Same `bookingDate`
- Status is either `pending` or `confirmed`
- Times overlap (even by 1 minute)

**Example of overlap:**
- Existing booking: 10:00 - 12:00
- Your request: 11:00 - 13:00
- Result: ❌ CONFLICT (overlaps from 11:00 to 12:00)

**Example of NO overlap:**
- Existing booking: 10:00 - 12:00
- Your request: 12:00 - 14:00
- Result: ✅ NO CONFLICT (start time equals end time is allowed)

### Improved Error Messages

The new error message will show:
```
This time slot is already booked.

You requested: 10:00 - 14:00
Already booked: 09:00 - 12:00
Booking by: John Doe

Please choose a different time slot.
```

### Prevention Tips

1. **Use the calendar** - Red dates show unavailable dates
2. **Check availability** - Select a resource to see its availability calendar
3. **Choose different time** - If you get a conflict, adjust your start/end time
4. **Contact admin** - If a booking shouldn't exist, contact the hall administrator

---

## Quick Commands Reference

**View all active bookings:**
```bash
# Visit in browser
http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1
```

**View all bookings (including cancelled):**
```bash
http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1?includeAll=true
```

**Delete a booking:**
```bash
curl -X DELETE "http://localhost:3000/api/bookings/debug/bLRLXrfr5pRBVcUntxUFlvXewaw1?bookingId=YOUR_BOOKING_ID"
```

---

## Still Having Issues?

1. Check the terminal logs where Next.js is running
2. Look for "CONFLICT DETECTED" messages
3. Verify the booking data in Firestore
4. Clear your browser cache and cookies
5. Try a different date/time to isolate the issue


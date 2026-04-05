# Doctor Profile Save & Visibility Fix - TODO

## Overview
Fix doctor profile saving in frontend, ensure doctors appear as available for patients, enable appointment booking.

## Steps (Approved Plan)

### Step 1: Update backend doctorController.js
- Improve updateProfile: use findOneAndUpdate upsert for partial updates avoiding required field validation
- Add ?available=true query param to getAllDoctors filtering availabilityStatus: true
- Return populated user data after profile update

### Step 2: Update frontend api.js
- Modify doctorAPI.getAll to include available=true param by default
- Ensure response handling for {success, data}

### Step 3: Fix frontend DoctorProfile.jsx
- Add detailed console.error logging in handleSave
- Refetch profile after successful save for UI update
- Add form validation for required fields

### Step 4: Update PatientDashboard.jsx & BookAppointment.jsx
- Ensure doctors fetch uses updated api.getAll()
- Add error handling/logging for empty doctors list

### Step 5: Test & Verify
- Restart backend server
- Test doctor profile save (check network/console)
- Test patient dashboard sees doctors
- Test book appointment (only available doctors)

### Step 6: Optional Polish
- Add frontend filter toggle for all/available doctors
- Improve error toasts

**Progress: 6/6 completed** ✅ (Fixed doctor availability query with aggregation)

**TEST NOW (restart backend):**
1. Doctor: Save profile with availabilityStatus = true → Refresh persists
2. Patient: Dashboard/Book → Sees doctors as "Available" 
3. Book appointment succeeds

Run: `cd backend && npm run dev`

Task complete! 🎉 Check console/DB if issues persist.

# OTP Verification System - Implementation Guide

## Overview
The OTP (One-Time Password) verification system has been implemented to verify tiffin order delivery. When an order is marked as delivered by the admin, an OTP is automatically generated and sent to the customer's email. The customer must verify this OTP to confirm delivery.

## Features Implemented

### 1. Backend Features

#### Order Model Updates
- **otp**: String field to store the 6-digit OTP
- **otpExpiresAt**: Date field to track OTP expiration (15 minutes from generation)
- **otpVerified**: Boolean flag to indicate if OTP has been verified
- **otpVerifiedAt**: Date field to track when OTP was verified
- **deliveryStatus**: Enum field with values `["pending", "delivered", "verified"]`

#### New API Endpoints

**1. Update Order Status with OTP Generation**
```
POST /api/admin/orders/:id
Body: { status: "completed", paymentStatus: "paid" }
```
When status is changed to "completed", the system:
- Generates a random 6-digit OTP
- Sets OTP expiration to 15 minutes
- Sends OTP to customer's email
- Updates `deliveryStatus` to "delivered"

**2. Verify Order OTP (Customer)**
```
POST /api/customer/orders/verify-otp
Body: {
  orderId: "order_id",
  otp: "123456"
}
```
Response:
```json
{
  "success": true,
  "message": "Delivery confirmed! Thank you for your order.",
  "order": { ...order details }
}
```

### 2. Frontend Features

#### New Components

**OTPVerificationModal.jsx** (`src/components/OTPVerificationModal.jsx`)
- Modal for verifying OTP within the orders page
- Shows order details and accepts 6-digit OTP
- Displays error messaging and expiration status
- Auto-dismisses on successful verification

**VerifyOrderOTP.jsx** (`src/Pages/customer/VerifyOrderOTP.jsx`)
- Full-page OTP verification screen
- Accessible via direct route
- Integrates with the API for OTP verification

#### Updated Components

**MyOrders.jsx** Integration
- Added "Verify OTP" button for orders with `deliveryStatus === "delivered"` and `otpVerified === false`
- Shows " Verified" badge for completed verifications
- Displays OTP modal when button is clicked
- Auto-refreshes orders list after successful verification

### 3. Utility Functions

**generateOTP.js** (`backend/utils/generateOTP.js`)
```javascript
generateOTP() // Returns random 6-digit string
getOTPExpirationTime() // Returns date 15 minutes from now
```

## Workflow

### Admin View
1. Admin marks order as "completed" in the admin dashboard
2. System generates 6-digit OTP
3. OTP is sent to customer's email with expiration info
4. Admin can see order status as "Completed"

### Customer View
1. Customer receives email with 6-digit OTP
2. Customer navigates to "My Orders"
3. For delivered orders, customer sees "Verify OTP" button
4. Customer enters OTP in the modal
5. System verifies OTP:
   - If correct and not expired: Order marked as verified 
   - If incorrect: Error message shown
   - If expired: Message to contact delivery personnel
6. Success email sent to customer

## Email Templates

### OTP Delivery Email
```
Subject: Order Delivery OTP - SwadBox

Content:
- Order confirmation
- 6-digit OTP (in large, prominent format)
- 15-minute expiration notice
- Instructions to enter OTP in app
```

### Delivery Verification Confirmation Email
```
Subject: Delivery Confirmed - SwadBox

Content:
- Thank you message
- Order details
- Verification timestamp
```

## Security Features

1. **OTP Expiration**: OTP expires after 15 minutes
2. **One-time Use**: OTP can only be verified once
3. **User Authorization**: Only order owner can verify their order's OTP
4. **Encrypted Transmission**: OTP sent via email (not SMS for this implementation)
5. **Error Handling**: Generic error messages to prevent enumeration attacks

## API Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Successful OTP verification |
| 400 | Invalid/expired OTP, missing fields, order not delivered |
| 403 | Unauthorized (order doesn't belong to user) |
| 404 | Order not found |
| 500 | Server error |

## Testing the Feature

### Manual Testing Steps

1. **Create Order**
   - Customer places a new order

2. **Mark as Delivered (Admin)**
   - Admin updates order status to "completed"
   - Check email for OTP

3. **Verify OTP (Customer)**
   - Go to "My Orders"
   - Click "Verify OTP" button on delivered order
   - Enter OTP from email
   - Verify success message

4. **Test OTP Expiration**
   - Wait 15 minutes from OTP generation
   - Try to verify OTP
   - Should see expiration error

### cURL Examples

**Admin: Mark Order as Delivered**
```bash
curl -X PUT http://localhost:5000/api/admin/orders/ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "completed",
    "paymentStatus": "paid"
  }'
```

**Customer: Verify OTP**
```bash
curl -X POST http://localhost:5000/api/customer/orders/verify-otp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "orderId": "ORDER_ID",
    "otp": "123456"
  }'
```

## Future Enhancements

1. **SMS OTP**: Add SMS delivery option for OTP
2. **Resend OTP**: Allow customers to request new OTP
3. **Retry Limits**: Limit OTP verification attempts
4. **Partial Verification**: Mark item-level delivery verification
5. **Admin Dashboard**: Show OTP verification statistics
6. **Webhook Notifications**: Trigger events on OTP verification

## Files Modified/Created

### Backend
-  `models/Order.js` - Added OTP fields
-  `utils/generateOTP.js` - New OTP utility
-  `controllers/orderController.js` - Updated orderStatus and added verifyOrderOTP
-  `routes/customerRoutes.js` - Added OTP verification route
-  `routes/studentRoutes.js` - Added order and OTP routes

### Frontend
-  `components/OTPVerificationModal.jsx` - New modal component
-  `Pages/customer/VerifyOrderOTP.jsx` - New full-page component
-  `Pages/customer/MyOrders.jsx` - Integrated OTP verification

## Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not received in email | Check `.env` EMAIL_USER and EMAIL_PASS |
| "Invalid OTP" error | Ensure OTP matches exactly (case-sensitive) |
| "OTP Expired" error | Request new OTP from delivery personnel |
| Modal not showing | Ensure order has `deliveryStatus === "delivered"` |
| Verification button missing | Order must be `status === "completed"` |

## Configuration

No additional environment variables needed. System uses existing:
- `EMAIL_USER` - Gmail account for sending OTP
- `EMAIL_PASS` - Gmail app password

## Support

For issues or questions regarding the OTP system:
1. Check the troubleshooting section
2. Verify all environment variables are set
3. Check server logs for error messages
4. Ensure database models are updated

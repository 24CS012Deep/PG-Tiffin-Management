import User from "../models/User.js";
import sendEmail from "./sendEmail.js";

/**
 * Notifies all active customers about a new tiffin plan after a 1-minute delay.
 * @param {Object} plan - The tiffin plan object
 */
export const notifyCustomersOfNewMenu = async (plan) => {
  // We don't want to block the response, but we catch internal errors
  try {
    console.log(`Scheduling customer notification for plan ${plan.planNumber} in 1 minute...`);

    // 1 minute delay as requested
    setTimeout(async () => {
      try {
        // Fetch only customers who are not blocked
        const customers = await User.find({ role: "customer", isBlocked: false });

        if (customers.length === 0) {
          console.log(" No customers found to notify.");
          return;
        }

        const emails = customers.map(c => c.email);

        // Format items for email
        const itemsList = plan.items
          ? plan.items.split(/[,\n]/).map(item => `<li style="margin-bottom: 8px;">${item.trim()}</li>`).join("")
          : "<li>Check website for details</li>";

        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; color: #333;">
            <div style="background: linear-gradient(to right, #f97316, #fb923c); padding: 40px 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">Today's Menu is Live! </h1>
              <p style="margin-top: 10px; opacity: 0.9; font-size: 16px;">Fresh, healthy, and home-cooked meals are ready for you.</p>
            </div>
            
            <div style="padding: 30px;">
              <div style="background: #fff7ed; padding: 25px; border-radius: 15px; border-left: 6px solid #f97316; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #f97316; font-size: 22px;">${plan.planNumber}</h2>
                <p style="margin: 5px 0; font-size: 18px;"><strong>Price:</strong> ₹${plan.tiffinPrice} <span style="font-size: 14px; color: #666;">/ meal</span></p>
                
                <h3 style="margin: 20px 0 10px 0; font-size: 16px; text-transform: uppercase; color: #666; letter-spacing: 1px;">What's on the menu:</h3>
                <ul style="padding-left: 20px; margin: 0; font-size: 16px;">
                  ${itemsList}
                </ul>
                
                ${plan.description ? `<p style="margin-top: 20px; font-style: italic; color: #555; background: white; padding: 10px; border-radius: 8px; font-size: 14px;">${plan.description}</p>` : ''}
              </div>
              
              <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/tiffin-plans" 
                   style="background: #f97316; color: white; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 5px 15px rgba(249, 115, 22, 0.3);">
                   Log in to Subscribe
                </a>
                <p style="margin-top: 15px; color: #666; font-size: 14px;">Log in to your portal to manage your orders.</p>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee;">
              <p style="margin: 0;">© 2026 SwadBox PG-Tiffin Management. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">You are receiving this email because you are a registered customer at SwadBox.</p>
            </div>
          </div>
        `;

        // Send using BCC for privacy
        await sendEmail({
          to: process.env.EMAIL_USER,
          bcc: emails.join(", "),
          subject: ` Today's Menu: ${plan.planNumber} is now Active!`,
          html
        });

        console.log(` Menu notification email sent to ${emails.length} customers.`);
      } catch (err) {
        console.error(" Delayed notification failed:", err);
      }
    }, 60000); // 1 minute delay
  } catch (error) {
    console.error(" Notification scheduling error:", error);
  }
};

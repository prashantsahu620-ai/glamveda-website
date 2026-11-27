# Glamveda® Watermelon & Collagen Skincare Storefront

A 100% free, zero-backend static e-commerce website featuring:
- **15-second luxury commercial hero player** with spa audio toggle
- **Amazon / Flipkart-style `Add to Cart` and `Buy Now` actions** on the Combo, Face Wash (100ml), and Peel Off Mask (100gm.)
- **Slide-over Shopping Cart drawer** with live quantity & total calculation
- **4-Step Checkout Flow after clicking Buy Now / Proceed to Buy:**
  1. Order Summary review
  2. Full **Delivery Address** entry form (Name, Mobile, Pincode, House/Apartment, Area, City, State, Home/Work type + Saved Address memory)
  3. Payment Method selection (Cash on Delivery / UPI via WhatsApp)
  4. Order Confirmation screen with Order ID, WhatsApp send, Instagram DM receipt copy, and `My Orders` history

## Optional: Set Your WhatsApp Business Number
Edit line 4 of `script.js`:
```js
const WHATSAPP_NUMBER = "919876543210";
```

## 100% Free Hosting (₹0 / $0)
1. **Netlify Drop (30 seconds):** Open https://app.netlify.com/drop and drag the entire `glamveda-website` folder onto the page.
2. **GitHub Pages:** Push this folder to a GitHub repo and enable **Settings → Pages → Deploy from branch**.
3. **Cloudflare Pages:** Upload the folder in Cloudflare Workers & Pages → Upload assets.

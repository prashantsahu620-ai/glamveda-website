// Glamveda Watermelon & Collagen Storefront with Amazon/Flipkart-Style Cart, Buy Now & Address Checkout
(() => {
  // Keep empty for privacy — or use private Google Sheet / Telegram / Instagram DM order flow
  const WHATSAPP_NUMBER = "";

  const PRODUCTS = {
    combo: {
      id: "combo",
      name: "Glamveda® Rice & Ceramide Korean Glass Skin Combo (Face Wash 100ml + Peel Off Mask 100gm)",
      shortName: "Rice & Ceramide Combo",
      price: 262,
      mrp: 550,
      img: "assets/rice-ceramide-combo.webp",
    },
  };

  const STORAGE_CART = "glamveda_cart_v1";
  const STORAGE_ADDR = "glamveda_saved_address_v1";
  const STORAGE_ORDERS = "glamveda_orders_v1";

  let cart = loadJson(STORAGE_CART, []).filter((i) => PRODUCTS[i.id]);
  let checkoutItems = [];
  let currentAddress = loadJson(STORAGE_ADDR, null);
  let orders = loadJson(STORAGE_ORDERS, []);
  let latestOrderRecord = null;

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore quota errors
    }
  }

  const toastEl = document.getElementById("toastMsg");
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  // Hero video sound toggle
  const heroVideo = document.getElementById("heroVideo");
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  if (heroVideo && audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      heroVideo.muted = !heroVideo.muted;
      if (!heroVideo.muted) {
        heroVideo.play().catch(() => {});
        audioToggleBtn.textContent = "🔊 Spa Music On";
      } else {
        audioToggleBtn.textContent = "🔇 Tap for Spa Music";
      }
    });
  }

  // Mobile nav
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      const open = mobileDrawer.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(open));
    });
    mobileDrawer.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Cart UI
  const cartDrawerBackdrop = document.getElementById("cartDrawerBackdrop");
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartFooter = document.getElementById("cartFooter");
  const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");

  function renderCart() {
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCountBadge.textContent = String(totalQty);

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align:center;color:#6f4a55;padding:30px 10px;">Your cart is empty. Add your Glamveda® combo to get started!</p>`;
      cartFooter.hidden = true;
      return;
    }

    cartFooter.hidden = false;
    let total = 0;
    cartItemsContainer.innerHTML = cart
      .map((item) => {
        const p = PRODUCTS[item.id];
        if (!p) return "";
        total += p.price * item.qty;
        return `
          <div class="cart-item-row">
            <img src="${p.img}" alt="${p.shortName}" />
            <div>
              <div class="cart-item-title">${p.shortName}</div>
              <div class="cart-item-price">₹${p.price} <span style="text-decoration:line-through;color:#9b7a84;font-weight:500;">₹${p.mrp}</span></div>
              <div class="qty-controls">
                <button class="qty-btn" data-action="dec" data-id="${p.id}" type="button">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${p.id}" type="button">+</button>
                <button class="remove-item-btn" data-action="rem" data-id="${p.id}" type="button">Remove</button>
              </div>
            </div>
            <strong>₹${p.price * item.qty}</strong>
          </div>`;
      })
      .join("");

    cartSubtotalEl.textContent = `₹${total}`;
    cartTotalEl.textContent = `₹${total}`;
  }

  function addToCart(id) {
    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, qty: 1 });
    }
    saveJson(STORAGE_CART, cart);
    renderCart();
    showToast(`Added ${PRODUCTS[id].shortName} to Cart`);
  }

  function openCart() {
    renderCart();
    cartDrawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartDrawerBackdrop.hidden = true;
    document.body.style.overflow = "";
  }

  cartItemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const idx = cart.findIndex((i) => i.id === id);
    if (idx === -1) return;

    if (action === "inc") cart[idx].qty += 1;
    if (action === "dec") {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    if (action === "rem") cart.splice(idx, 1);

    saveJson(STORAGE_CART, cart);
    renderCart();
  });

  if (openCartBtn) openCartBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartDrawerBackdrop) {
    cartDrawerBackdrop.addEventListener("click", (e) => {
      if (e.target === cartDrawerBackdrop) closeCart();
    });
  }

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.getAttribute("data-id"));
    });
  });

  // Checkout Modal (Amazon/Flipkart Multi-Step: Order Summary -> Address -> Payment -> Confirmation)
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutModal = document.getElementById("closeCheckoutModal");
  const checkoutItemsList = document.getElementById("checkoutItemsList");
  const stepDots = document.querySelectorAll(".step-dot");
  const panes = [
    document.getElementById("checkoutStep1"),
    document.getElementById("checkoutStep2"),
    document.getElementById("checkoutStep3"),
    document.getElementById("checkoutStep4"),
  ];

  function setStep(stepNum) {
    panes.forEach((p, idx) => {
      p.hidden = idx + 1 !== stepNum;
    });
    stepDots.forEach((dot) => {
      const s = Number(dot.getAttribute("data-step"));
      dot.classList.toggle("active", s <= stepNum);
    });
  }

  function renderCheckoutSummary() {
    let count = 0;
    let mrpTotal = 0;
    let total = 0;

    checkoutItemsList.innerHTML = checkoutItems
      .map((item) => {
        const p = PRODUCTS[item.id];
        count += item.qty;
        mrpTotal += p.mrp * item.qty;
        total += p.price * item.qty;
        return `
          <div class="cart-item-row">
            <img src="${p.img}" alt="${p.shortName}" />
            <div>
              <div class="cart-item-title">${p.name}</div>
              <div class="qty-controls">
                <button class="qty-btn co-qty" data-act="dec" data-id="${p.id}" type="button">−</button>
                <span>Qty: ${item.qty}</span>
                <button class="qty-btn co-qty" data-act="inc" data-id="${p.id}" type="button">+</button>
              </div>
            </div>
            <strong>₹${p.price * item.qty}</strong>
          </div>`;
      })
      .join("");

    document.getElementById("summaryItemCount").textContent = String(count);
    document.getElementById("summaryMrp").textContent = `₹${mrpTotal}`;
    document.getElementById("summaryDiscount").textContent = `− ₹${mrpTotal - total}`;
    document.getElementById("summaryTotal").textContent = `₹${total}`;
    document.getElementById("paymentTotal").textContent = `₹${total}`;
  }

  checkoutItemsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".co-qty");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    const item = checkoutItems.find((i) => i.id === id);
    if (!item) return;
    if (act === "inc") item.qty += 1;
    if (act === "dec" && item.qty > 1) item.qty -= 1;
    renderCheckoutSummary();
  });

  function startCheckout(items) {
    checkoutItems = items.map((i) => ({ ...i }));
    renderCheckoutSummary();
    populateSavedAddress();
    setStep(1);
    checkoutModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    checkoutModal.hidden = true;
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".buy-now-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      startCheckout([{ id, qty: 1 }]);
    });
  });

  if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      closeCart();
      startCheckout(cart);
    });
  }

  if (closeCheckoutModal) closeCheckoutModal.addEventListener("click", closeCheckout);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckout();
    });
  }

  // Step 1 -> Step 2 (Address Form)
  document.getElementById("toAddressBtn").addEventListener("click", () => setStep(2));
  document.getElementById("backToStep1Btn").addEventListener("click", () => setStep(1));
  document.getElementById("backToStep2Btn").addEventListener("click", () => setStep(2));

  function populateSavedAddress() {
    const box = document.getElementById("savedAddressBox");
    const preview = document.getElementById("savedAddressPreview");
    if (!currentAddress) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    preview.textContent = `${currentAddress.name} (${currentAddress.type}) — ${currentAddress.house}, ${currentAddress.area}, ${currentAddress.city}, ${currentAddress.state} - ${currentAddress.pincode} | Ph: ${currentAddress.phone}`;
  }

  function fillAddressInputs(addr) {
    if (!addr) return;
    document.getElementById("addrName").value = addr.name || "";
    document.getElementById("addrPhone").value = addr.phone || "";
    document.getElementById("addrPincode").value = addr.pincode || "";
    document.getElementById("addrCity").value = addr.city || "";
    document.getElementById("addrHouse").value = addr.house || "";
    document.getElementById("addrArea").value = addr.area || "";
    document.getElementById("addrState").value = addr.state || "";
  }

  document.getElementById("useSavedAddressBtn").addEventListener("click", () => {
    fillAddressInputs(currentAddress);
    showToast("Saved address filled!");
  });

  // Step 2 -> Step 3 (Payment)
  const addressForm = document.getElementById("addressForm");
  addressForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const addrTypeEl = document.querySelector('input[name="addrType"]:checked');
    currentAddress = {
      name: document.getElementById("addrName").value.trim(),
      phone: document.getElementById("addrPhone").value.trim(),
      pincode: document.getElementById("addrPincode").value.trim(),
      city: document.getElementById("addrCity").value.trim(),
      house: document.getElementById("addrHouse").value.trim(),
      area: document.getElementById("addrArea").value.trim(),
      state: document.getElementById("addrState").value.trim(),
      type: addrTypeEl ? addrTypeEl.value : "Home",
    };
    saveJson(STORAGE_ADDR, currentAddress);
    document.getElementById("deliveringToPreview").textContent =
      `${currentAddress.name}, ${currentAddress.house}, ${currentAddress.city} - ${currentAddress.pincode}`;
    setStep(3);
  });

  // Step 3 -> Step 4 (Place Order & Confirmation)
  document.getElementById("confirmOrderBtn").addEventListener("click", () => {
    const payEl = document.querySelector('input[name="payMethod"]:checked');
    const payMethod = payEl ? payEl.value : "Cash on Delivery";
    const total = checkoutItems.reduce((acc, i) => acc + PRODUCTS[i.id].price * i.qty, 0);
    const itemsSummary = checkoutItems.map((i) => `${PRODUCTS[i.id].shortName} × ${i.qty}`).join(", ");
    const orderId = `GV-${Math.floor(100000 + Math.random() * 900000)}`;

    latestOrderRecord = {
      orderId,
      date: new Date().toLocaleString(),
      itemsSummary,
      total,
      payMethod,
      address: currentAddress,
    };

    orders.unshift(latestOrderRecord);
    saveJson(STORAGE_ORDERS, orders);
    updateOrdersBadge();

    // Clear cart if checkout started from cart
    if (cart.length > 0 && checkoutItems.length === cart.length) {
      cart = [];
      saveJson(STORAGE_CART, cart);
      renderCart();
    }

    document.getElementById("confirmedOrderId").textContent = `#${orderId}`;
    document.getElementById("confirmedAddressText").textContent =
      `${currentAddress.name} (${currentAddress.type}) • ${currentAddress.house}, ${currentAddress.area}, ${currentAddress.city}, ${currentAddress.state} - ${currentAddress.pincode} • Ph: ${currentAddress.phone}`;
    document.getElementById("confirmedItemsText").textContent = itemsSummary;
    document.getElementById("confirmedPaymentText").textContent = payMethod;
    document.getElementById("confirmedTotalText").textContent = `₹${total}`;
    document.getElementById("checkoutFeedback").textContent = "";

    setStep(4);
  });

  function formatOrderReceipt(rec) {
    const a = rec.address;
    return [
      `GLAMVEDA® Order #${rec.orderId}`,
      `• Items: ${rec.itemsSummary}`,
      `• Total: ₹${rec.total} (${rec.payMethod})`,
      `• Delivery Address (${a.type}): ${a.name}, ${a.house}, ${a.area}, ${a.city}, ${a.state} - ${a.pincode}`,
      `• Phone: ${a.phone}`,
    ].join("\n");
  }

  document.getElementById("sendWhatsappOrderBtn").addEventListener("click", () => {
    if (!latestOrderRecord) return;
    const msg = encodeURIComponent(formatOrderReceipt(latestOrderRecord));
    const url = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
    document.getElementById("checkoutFeedback").textContent = "Opening WhatsApp with your complete order & address!";
  });

  document.getElementById("copyReceiptBtn").addEventListener("click", async () => {
    if (!latestOrderRecord) return;
    try {
      await navigator.clipboard.writeText(formatOrderReceipt(latestOrderRecord));
      document.getElementById("checkoutFeedback").textContent = "Order receipt copied! Paste in Instagram DM.";
    } catch {
      document.getElementById("checkoutFeedback").textContent = "Could not copy automatically — please take a screenshot.";
    }
  });

  document.getElementById("continueShoppingBtn").addEventListener("click", closeCheckout);

  // My Orders History Modal
  const ordersModal = document.getElementById("ordersModal");
  const myOrdersBtn = document.getElementById("myOrdersBtn");
  const mobileOrdersBtn = document.getElementById("mobileOrdersBtn");
  const closeOrdersModal = document.getElementById("closeOrdersModal");
  const ordersCountBadge = document.getElementById("ordersCountBadge");
  const ordersHistoryList = document.getElementById("ordersHistoryList");

  function updateOrdersBadge() {
    if (!ordersCountBadge) return;
    ordersCountBadge.textContent = String(orders.length);
    ordersCountBadge.hidden = orders.length === 0;
  }

  function openOrders() {
    if (orders.length === 0) {
      ordersHistoryList.innerHTML = `<p style="color:#6f4a55;">No orders placed yet. Click <strong>Buy Now</strong> on any product to place your first order!</p>`;
    } else {
      ordersHistoryList.innerHTML = orders
        .map(
          (o) => `
          <div class="history-card">
            <p><strong>#${o.orderId}</strong> • <span style="color:#2e7d32;font-weight:700;">Confirmed</span> • ₹${o.total}</p>
            <p>${o.itemsSummary}</p>
            <p style="color:#6f4a55;">Deliver to: ${o.address.name}, ${o.address.house}, ${o.address.city} - ${o.address.pincode}</p>
            <p style="font-size:0.78rem;color:#9b7a84;">${o.date} • ${o.payMethod}</p>
          </div>`
        )
        .join("");
    }
    ordersModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  if (myOrdersBtn) myOrdersBtn.addEventListener("click", openOrders);
  if (mobileOrdersBtn) mobileOrdersBtn.addEventListener("click", openOrders);
  if (closeOrdersModal) {
    closeOrdersModal.addEventListener("click", () => {
      ordersModal.hidden = true;
      document.body.style.overflow = "";
    });
  }
  if (ordersModal) {
    ordersModal.addEventListener("click", (e) => {
      if (e.target === ordersModal) {
        ordersModal.hidden = true;
        document.body.style.overflow = "";
      }
    });
  }

  // Lightbox
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeLightbox = document.getElementById("closeLightbox");

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      lightboxImg.src = item.getAttribute("data-src") || "";
      lightboxImg.alt = item.getAttribute("data-title") || "";
      lightboxCaption.textContent = item.getAttribute("data-title") || "";
      lightboxModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  function closeBox() {
    lightboxModal.hidden = true;
    document.body.style.overflow = "";
  }
  if (closeLightbox) closeLightbox.addEventListener("click", closeBox);
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) closeBox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!checkoutModal.hidden) closeCheckout();
      if (!cartDrawerBackdrop.hidden) closeCart();
      if (!ordersModal.hidden) {
        ordersModal.hidden = true;
        document.body.style.overflow = "";
      }
      if (!lightboxModal.hidden) closeBox();
    }
  });

  renderCart();
  updateOrdersBadge();
})();

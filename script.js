// In script.js, inside your DOMContentLoaded listener

// --- Add these new selectors at the top with your other selectors ---
const userIconLink = document.getElementById('user-icon-link');
const authModalEl = document.getElementById('authModal');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');

// --- Add this new modal instance at the top ---
const authModal = new bootstrap.Modal(authModalEl);

// --- Add these new event listeners anywhere inside the main function ---

// Listener to open the Sign In / Sign Up modal
userIconLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the link from navigating
    authModal.show();
});

// Placeholder handler for the Sign In form
signInForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload
    // In a real application, you would send this data to a server
    alert('Sign In functionality is a demo. No data is being sent.');
    authModal.hide(); // Hide the modal on "submission"
});

// Placeholder handler for the Sign Up form
signUpForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload
    // In a real application, you would send this data to a server
    alert('Sign Up functionality is a demo. No data is being sent.');
    authModal.hide(); // Hide the modal on "submission"
});






document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const cartCountElement = document.getElementById('cart-count');
    const cartIconWrapper = document.getElementById('cart-icon-wrapper');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));

    let cart = [];

    productGrid.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('add-to-cart')) {
            const id = target.dataset.id;
            const name = target.dataset.name;
            const price = parseFloat(target.dataset.price);
            addToCart(id, name, price);
        } else if (target.classList.contains('buy-now-btn')) {
            const button = target;
            const price = parseFloat(button.dataset.price);
            const productId = button.dataset.id;

            showConfirmationModal(price, productId);
        }
    });

    cartIconWrapper.addEventListener('click', () => {
        cartModal.show();
    });

    cartItemsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-from-cart-btn')) {
            const id = event.target.dataset.id;
            removeFromCart(id);
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        const totalCartPrice = getCartTotal();
        const transactionId = 'CART-CHECKOUT-' + Date.now();
        showConfirmationModal(totalCartPrice, transactionId);
    });

    function showConfirmationModal(price, productId) {
        const vat = price * 0.13;
        const deliveryCharge = 100;
        const total = price + vat + deliveryCharge;

        const modalHTML = `
<div id="confirmationModal" class="modal fade show" tabindex="-1" style="display: block; background-color: rgba(0, 0, 0, 0.5);" aria-modal="true" role="dialog">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content rounded-4 shadow-lg border-0">
      <div class="modal-header bg-success text-white rounded-top-4">
        <h5 class="modal-title fw-semibold">Confirm Payment</h5>
        <button type="button" class="btn-close btn-close-white" id="cancelModalBtn" aria-label="Close"></button>
      </div>
      <div class="modal-body px-5 py-4">
        <ul class="list-unstyled mb-3 fs-6">
          <li class="d-flex justify-content-between mb-3"><span>Subtotal:</span> <span>Rs. <strong>${price.toFixed(2)}</strong></span></li>
          <li class="d-flex justify-content-between mb-3"><span>VAT (13%):</span> <span>Rs. <strong>${vat.toFixed(2)}</strong></span></li>
          <li class="d-flex justify-content-between mb-3"><span>Delivery Charge:</span> <span>Rs. <strong>${deliveryCharge.toFixed(2)}</strong></span></li>
        </ul>
        <hr>
        <div class="d-flex justify-content-between fs-5 fw-bold">
          <span>Total:</span>
          <span class="text-success">Rs. ${total.toFixed(2)}</span>
        </div>
      </div>
      <div class="modal-footer border-0 d-flex justify-content-between px-5 pb-4">
        <button type="button" id="cancelModalBtn2" class="btn btn-outline-secondary w-45">Cancel</button>
        <button type="button" id="confirmPaymentBtn" class="btn btn-success w-45">Proceed</button>
      </div>
    </div>
  </div>
</div>`;

        const tempModal = document.createElement('div');
        tempModal.innerHTML = modalHTML;
        document.body.appendChild(tempModal);
        document.body.style.overflow = 'hidden';

        tempModal.querySelector('#confirmPaymentBtn').addEventListener('click', () => {
            document.body.removeChild(tempModal);
            document.body.style.overflow = '';
            initiateEsewaPayment(price, productId);
        });

        const cancelBtns = tempModal.querySelectorAll('#cancelModalBtn, #cancelModalBtn2');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(tempModal);
                document.body.style.overflow = '';
            });
        });
    }

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        showToast(`${name} added to cart!`);
        updateCart();
    }

    function removeFromCart(id) {
        const itemToRemove = cart.find(item => item.id === id);
        if (itemToRemove) {
            showToast(`${itemToRemove.name} removed from cart.`, 'error');
        }
        cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    function updateCart() {
        updateCartCount();
        updateCartModal();
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    function updateCartModal() {
        cartItemsList.innerHTML = '';
        const totalPrice = getCartTotal();

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item text-center text-muted">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                const itemTotal = item.price * item.quantity;
                li.innerHTML = `
                    <div class="me-auto">${item.name} <span class="text-muted">x${item.quantity}</span></div>
                    <span class="fw-bold me-3">Rs. ${itemTotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger remove-from-cart-btn" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>`;
                cartItemsList.appendChild(li);
            });
        }

        cartTotalPriceElement.textContent = `Rs. ${totalPrice.toFixed(2)}`;
    }

    function getCartTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type === 'error' ? 'is-error' : ''}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }

    const style = document.createElement('style');
    style.innerHTML = `
.toast-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #28a745;
    color: white;
    padding: 12px 25px;
    border-radius: 50px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    opacity: 0;
    transition: opacity 0.5s, bottom 0.5s;
    z-index: 2000;
}
.toast-notification.is-error {
    background-color: #dc3545;
}
.toast-notification.show {
    opacity: 1;
    bottom: 40px;
}`;
    document.head.appendChild(style);

    function initiateEsewaPayment(price, productId) {
        const amount = parseFloat(price).toFixed(2);
        const tax = (amount * 0.13).toFixed(2);
        const delivery = 100.00;
        const serviceCharge = 0.00;
        const total = (parseFloat(amount) + parseFloat(tax) + delivery).toFixed(2);

        const esewaConfig = {
            amount: amount,
            tax_amount: tax,
            product_service_charge: serviceCharge.toFixed(2),
            product_delivery_charge: delivery.toFixed(2),
            product_code: 'EPAYTEST',
            success_url: 'http://192.168.10.66:5501/success.html',
            failure_url: 'http://192.168.10.66:5501/failure.html',
            secret_key: '8gBm/:&EnhH.1/q',
            total_amount: total
        };

        const transaction_uuid = `chrono-${Date.now()}-${productId}`;
        const signature = createEsewaSignature(esewaConfig, transaction_uuid);

        document.getElementById('amount').value = esewaConfig.amount;
        document.getElementById('tax_amount').value = esewaConfig.tax_amount;
        document.getElementById('total_amount').value = esewaConfig.total_amount;
        document.getElementById('transaction_uuid').value = transaction_uuid;
        document.getElementById('product_code').value = esewaConfig.product_code;
        document.getElementById('product_service_charge').value = esewaConfig.product_service_charge;
        document.getElementById('product_delivery_charge').value = esewaConfig.product_delivery_charge;
        document.getElementById('success_url').value = esewaConfig.success_url;
        document.getElementById('failure_url').value = esewaConfig.failure_url;
        document.getElementById('signature').value = signature;

        document.getElementById('esewa-payment-form').submit();
    }

    function createEsewaSignature(config, uuid) {
        const message = `total_amount=${config.total_amount},transaction_uuid=${uuid},product_code=${config.product_code}`;
        const hash = CryptoJS.HmacSHA256(message, config.secret_key);
        return CryptoJS.enc.Base64.stringify(hash);
    }
});

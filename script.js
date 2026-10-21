// --- HELPER FUNCTION: SANITIZE HTML (XSS PREVENTION) ---
function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Gambar cadangan jika link Unsplash gagal dimuat
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';

// --- DATA MENU RESTORAN ---
const MENU_DATA = [
  {
    id: '1',
    name: 'Espresso Single Shot',
    category: 'kopi',
    price: 18000,
    description: 'Ekstrak biji kopi arabika murni dengan aroma pekat dan krema lembut.',
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
    tags: ['Pekat'],
    available: true
  },
  {
    id: '2',
    name: 'Iced Caramel Macchiato',
    category: 'kopi',
    price: 28000,
    description: 'Perpaduan espresso, susu segar, dan sirup karamel gurih manis.',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80',
    tags: ['Favorit'],
    available: true
  },
  {
    id: '3',
    name: 'Matcha Oat Latte',
    category: 'non-kopi',
    price: 30000,
    description: 'Matcha Uji Jepang otentik disajikan dengan susu gandum (Oat Milk).',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    tags: ['Bestseller'],
    available: true
  },
  {
    id: '4',
    name: 'Nasi Goreng Wagyu',
    category: 'makanan',
    price: 45000,
    description: 'Nasi goreng rempah istimewa disajikan dengan potongan daging sapi Wagyu dan telur ceplok.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    tags: ['Pedas', 'Chef Special'],
    available: true
  },
  {
    id: '5',
    name: 'Truffle Fries',
    category: 'camilan',
    price: 25000,
    description: 'Kentang goreng renyah dengan minyak truffle aromatik dan taburan keju parmesan.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tags: ['Camilan'],
    available: true
  },
  {
    id: '6',
    name: 'Classic Lava Cake',
    category: 'penutup',
    price: 27000,
    description: 'Kue cokelat hangat dengan lelehan cokelat murni di tengah dan es krim vanila.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    tags: ['Manis'],
    available: true
  }
];

const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: 'fa-border-all' },
  { id: 'kopi', label: 'Kopi', icon: 'fa-mug-hot' },
  { id: 'non-kopi', label: 'Non-Kopi', icon: 'fa-glass-water' },
  { id: 'makanan', label: 'Makanan', icon: 'fa-utensils' },
  { id: 'camilan', label: 'Camilan', icon: 'fa-cookie-bite' },
  { id: 'penutup', label: 'Penutup', icon: 'fa-ice-cream' }
];

// --- STATE APLIKASI ---
let currentCategory = 'semua';
let searchQuery = '';
let cart = {}; 
let tableNumber = '05';
const WHATSAPP_NUMBER = '6281234567890'; // Ganti dengan nomor WA Kafe Anda

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('meja')) {
    const rawTable = urlParams.get('meja');
    tableNumber = sanitizeHTML(rawTable).trim() || '05';
  }
  document.getElementById('tableNumberDisplay').textContent = tableNumber;
  
  renderCategories();
  renderMenu();
});

// --- RENDER CATEGORIES ---
function renderCategories() {
  const container = document.getElementById('categoryTabs');
  container.innerHTML = CATEGORIES.map(cat => `
    <button 
      type="button"
      onclick="selectCategory('${cat.id}')"
      class="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
        currentCategory === cat.id 
          ? 'bg-brand-gold text-black font-semibold shadow-md shadow-brand-gold/20' 
          : 'bg-brand-cardBg text-gray-400 hover:text-white border border-white/5'
      }"
    >
      <i class="fa-solid ${cat.icon}"></i>
      <span>${sanitizeHTML(cat.label)}</span>
    </button>
  `).join('');
}

function selectCategory(catId) {
  currentCategory = catId;
  renderCategories();
  renderMenu();
}

function handleSearch() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
  renderMenu();
}

// --- RENDER MENU ITEMS ---
function renderMenu() {
  const container = document.getElementById('menuContainer');
  const emptyState = document.getElementById('emptyState');

  const filtered = MENU_DATA.filter(item => {
    const matchesCategory = currentCategory === 'semua' || item.category === currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery) || item.description.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = filtered.map(item => {
    const qty = cart[item.id] || 0;
    return `
      <div class="bg-brand-cardBg border border-white/5 rounded-2xl p-3 flex space-x-3 hover:border-brand-gold/30 transition shadow-lg">
        <div class="relative w-24 h-24 rounded-xl overflow-hidden bg-brand-accentBg flex-shrink-0">
          <img 
            src="${item.image}" 
            alt="${sanitizeHTML(item.name)}" 
            class="w-full h-full object-cover"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          >
          ${item.tags && item.tags.length > 0 ? `
            <span class="absolute top-1 left-1 bg-black/70 backdrop-blur-md text-brand-gold text-[9px] font-bold px-1.5 py-0.5 rounded">
              ${sanitizeHTML(item.tags[0])}
            </span>
          ` : ''}
        </div>

        <div class="flex-1 flex flex-col justify-between py-0.5">
          <div>
            <h3 class="text-sm font-semibold text-white line-clamp-1">${sanitizeHTML(item.name)}</h3>
            <p class="text-[11px] text-gray-400 line-clamp-2 mt-0.5">${sanitizeHTML(item.description)}</p>
          </div>

          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-bold text-brand-gold">Rp ${item.price.toLocaleString('id-ID')}</span>
            
            ${qty === 0 ? `
              <button 
                type="button"
                onclick="updateCart('${item.id}', 1)"
                class="bg-brand-accentBg hover:bg-brand-gold hover:text-black border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1"
              >
                <i class="fa-solid fa-plus text-[10px]"></i>
                <span>Tambah</span>
              </button>
            ` : `
              <div class="flex items-center space-x-2 bg-brand-accentBg px-2 py-1 rounded-lg border border-brand-gold/40">
                <button type="button" onclick="updateCart('${item.id}', -1)" class="text-brand-gold hover:text-white px-1">
                  <i class="fa-solid fa-minus text-[10px]"></i>
                </button>
                <span class="text-xs font-bold text-white">${qty}</span>
                <button type="button" onclick="updateCart('${item.id}', 1)" class="text-brand-gold hover:text-white px-1">
                  <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- CART MANAGEMENT ---
function updateCart(itemId, change) {
  const currentQty = cart[itemId] || 0;
  const newQty = currentQty + change;

  if (newQty <= 0) {
    delete cart[itemId];
  } else {
    cart[itemId] = newQty;
  }

  renderMenu();
  updateCartBar();
  
  const modal = document.getElementById('cartModal');
  if (!modal.classList.contains('pointer-events-none')) {
    renderCartModalItems();
  }
}

function updateCartBar() {
  const cartBar = document.getElementById('cartBar');
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  if (totalItems > 0) {
    cartBar.classList.remove('translate-y-full');
  } else {
    cartBar.classList.add('translate-y-full');
  }

  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  document.getElementById('cartCountBadge').textContent = totalItems;
  document.getElementById('cartTotalPrice').textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function calculateSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU_DATA.find(m => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
}

// --- MODAL & CHECKOUT ---
function toggleCartModal(show) {
  const modal = document.getElementById('cartModal');
  const modalContent = document.getElementById('cartModalContent');

  if (show) {
    renderCartModalItems();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('translate-y-full');
  } else {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContent.classList.add('translate-y-full');
  }
}

function renderCartModalItems() {
  const container = document.getElementById('cartItemsContainer');
  const items = Object.entries(cart);

  if (items.length === 0) {
    container.innerHTML = '<p class="text-center text-xs text-gray-400 py-6">Keranjang Anda masih kosong.</p>';
    toggleCartModal(false);
    return;
  }

  container.innerHTML = items.map(([id, qty]) => {
    const item = MENU_DATA.find(m => m.id === id);
    if (!item) return '';
    return `
      <div class="flex items-center justify-between bg-brand-darkBg p-3 rounded-xl border border-white/5">
        <div class="flex items-center space-x-3">
          <img 
            src="${item.image}" 
            class="w-12 h-12 rounded-lg object-cover"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          >
          <div>
            <p class="text-xs font-semibold text-white">${sanitizeHTML(item.name)}</p>
            <p class="text-[11px] text-brand-gold font-bold">Rp ${(item.price * qty).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div class="flex items-center space-x-2 bg-brand-accentBg px-2 py-1 rounded-lg">
          <button type="button" onclick="updateCart('${item.id}', -1)" class="text-brand-gold hover:text-white px-1">
            <i class="fa-solid fa-minus text-[10px]"></i>
          </button>
          <span class="text-xs font-bold text-white">${qty}</span>
          <button type="button" onclick="updateCart('${item.id}', 1)" class="text-brand-gold hover:text-white px-1">
            <i class="fa-solid fa-plus text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  document.getElementById('summarySubtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  document.getElementById('summaryTax').textContent = `Rp ${tax.toLocaleString('id-ID')}`;
  document.getElementById('summaryTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function changeTableNumber() {
  const newNum = prompt("Masukkan Nomor Meja Anda:", tableNumber);
  if (newNum !== null && newNum.trim() !== "") {
    tableNumber = sanitizeHTML(newNum.trim());
    document.getElementById('tableNumberDisplay').textContent = tableNumber;
  }
}

// --- INTEGRASI WHATSAPP ---
function sendOrderToWhatsApp() {
  const items = Object.entries(cart);
  if (items.length === 0) return;

  const rawNotes = document.getElementById('orderNotes').value.trim();
  const notes = sanitizeHTML(rawNotes);
  const subtotal = calculateSubtotal();
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  let message = `*PESANAN BARU - AURA CAFE*\n`;
  message += `----------------------------------\n`;
  message += `📍 *Nomor Meja:* ${tableNumber}\n`;
  message += `📅 *Waktu:* ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n`;
  message += `----------------------------------\n\n`;
  message += `*Rincian Pesanan:*\n`;

  items.forEach(([id, qty]) => {
    const item = MENU_DATA.find(m => m.id === id);
    if (item) {
      message += `• ${item.name} x${qty} = Rp ${(item.price * qty).toLocaleString('id-ID')}\n`;
    }
  });

  message += `\n----------------------------------\n`;
  message += `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
  message += `Pajak (10%): Rp ${tax.toLocaleString('id-ID')}\n`;
  message += `*TOTAL BAYAR: Rp ${total.toLocaleString('id-ID')}*\n`;
  
  if (notes) {
    message += `\n📝 *Catatan:* ${notes}\n`;
  }
  message += `----------------------------------\n`;
  message += `Mohon segera diproses, Terima Kasih!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  window.location.href = whatsappUrl;
}

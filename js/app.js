(function(){
  var C = window.ETC, P = window.PRODUCTS || [];
  var KEY = 'etc_cart_v1';
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var money = function(n){ return 'GHC ' + Number(n).toLocaleString('en-GH'); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var wa = function(text){ return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text); };

  /* ---- cart store (localStorage, guarded) ---- */
  function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function save(c){ try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(e){} }
  var cart = load();
  function count(){ return Object.keys(cart).reduce(function(n,k){ return n + cart[k]; }, 0); }
  function find(id){ return P.filter(function(p){ return p.id === id; })[0]; }
  function total(){ return Object.keys(cart).reduce(function(t,k){ var p = find(k); return t + (p ? p.price * cart[k] : 0); }, 0); }

  /* ---- shared chrome ---- */
  var page = document.body.getAttribute('data-page') || '';
  function link(href, label, key){ return '<a href="' + href + '"' + (page === key ? ' class="active"' : '') + '>' + label + '</a>'; }
  var header = $('#site-header');
  if (header) header.innerHTML =
    '<nav class="topnav"><a class="brand" href="index.html">Es<b>Terra</b> Craft</a><div class="links">' +
    link('shop.html','Shop','shop') + link('custom.html','Custom','custom') + link('artist.html','The Artist','artist') +
    '<button class="cartbtn" id="openCart" aria-label="Open cart">Cart<span class="count" id="cartCount">0</span></button></div></nav>';

  var footer = $('#site-footer');
  if (footer) footer.innerHTML =
    '<footer class="foot"><div class="wrap"><div class="cols"><div><img src="images/logo.png" alt="EsTerra Craft"><p style="margin-top:14px;font-size:.9rem;opacity:.8;max-width:30ch">Handmade copper, silver &amp; brass jewelry. Made to order in Ghana.</p></div>' +
    '<div><h4>Explore</h4><a href="shop.html">Shop designs</a><a href="custom.html">Custom order</a><a href="artist.html">The artist</a></div>' +
    '<div><h4>Contact</h4><a href="' + wa('Hello EsTerra Craft!') + '" target="_blank" rel="noopener">WhatsApp</a>' +
    (C.instagram ? '<a href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a>' : '') + '</div></div>' +
    '<p class="legal">&copy; ' + new Date().getFullYear() + ' EsTerra Craft. All rights reserved.</p></div></footer>';

  /* ---- cart drawer ---- */
  var drawer = document.createElement('div');
  drawer.innerHTML =
    '<div class="scrim" id="scrim"></div><aside class="drawer" id="drawer" aria-label="Cart"><header><h3>Your cart</h3><button class="x" id="closeCart" aria-label="Close">&times;</button></header>' +
    '<div class="items" id="items"></div><footer id="cartFoot"></footer></aside>';
  document.body.appendChild(drawer);

  function render(){
    var n = count();
    $('#cartCount').textContent = n;
    var box = $('#items'), foot = $('#cartFoot');
    var ids = Object.keys(cart).filter(function(k){ return find(k); });
    if (!ids.length){
      box.innerHTML = '<p class="note" style="padding:30px 0;text-align:center">Your cart is empty.</p>';
      foot.innerHTML = '<a class="btn ghost" href="shop.html" style="text-align:center">Browse the shop</a>';
      return;
    }
    box.innerHTML = ids.map(function(id){
      var p = find(id);
      return '<div class="item"><div class="thumb ' + p.material + '" style="' + (p.image ? 'background-image:url(images/products/' + esc(p.image) + ')' : '') + '"></div>' +
        '<div><b>' + esc(p.name) + '</b><small>' + money(p.price) + ' &middot; ' + p.material + '</small>' +
        '<div class="qty"><button data-d="-1" data-id="' + id + '">&minus;</button><span>' + cart[id] + '</span><button data-d="1" data-id="' + id + '">+</button></div></div>' +
        '<button class="rm" data-rm="' + id + '">Remove</button></div>';
    }).join('');
    foot.innerHTML =
      '<div class="total"><span>Total</span><span>' + money(total()) + '</span></div>' +
      '<input id="cName" placeholder="Your name" autocomplete="name"><textarea id="cNote" rows="2" placeholder="Notes (ring size, delivery area, etc.)" style="min-height:70px"></textarea>' +
      '<button class="btn wa" id="checkout">Order on WhatsApp</button>' +
      '<p class="note">Opens WhatsApp with your order filled in. Tap send, and we will confirm payment and delivery with you there.</p>';
  }
  function setCart(c){ cart = c; save(cart); render(); }
  function open(v){ $('#drawer').classList.toggle('open', v); $('#scrim').classList.toggle('open', v); }

  document.addEventListener('click', function(e){
    var t = e.target;
    if (t.closest('#openCart')) { open(true); return; }
    if (t.closest('#closeCart') || t.id === 'scrim') { open(false); return; }
    var add = t.closest('[data-add]');
    if (add){ var id = add.getAttribute('data-add'); cart[id] = (cart[id] || 0) + 1; setCart(cart); open(true); return; }
    var q = t.closest('[data-d]');
    if (q){ var qi = q.getAttribute('data-id'); cart[qi] = (cart[qi] || 0) + Number(q.getAttribute('data-d')); if (cart[qi] <= 0) delete cart[qi]; setCart(cart); return; }
    var rm = t.closest('[data-rm]');
    if (rm){ delete cart[rm.getAttribute('data-rm')]; setCart(cart); return; }
    if (t.closest('#checkout')){
      var lines = Object.keys(cart).filter(find).map(function(id){ var p = find(id); return '- ' + cart[id] + ' x ' + p.name + ' (' + p.material + ') = ' + money(p.price * cart[id]); });
      var nm = ($('#cName').value || '').trim(), note = ($('#cNote').value || '').trim();
      var msg = 'Hello EsTerra Craft! I would like to order:\n' + lines.join('\n') + '\nTotal: ' + money(total()) + (nm ? '\nName: ' + nm : '') + (note ? '\nNotes: ' + note : '');
      window.open(wa(msg), '_blank');
    }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') open(false); });
  render();

  /* ---- shop grid ---- */
  function card(p){
    var bg = p.image ? ' style="background-image:url(images/products/' + esc(p.image) + ')"' : '';
    return '<article class="card"><div class="pic ' + p.material + '"' + bg + (p.image ? ' data-zoom="images/products/' + esc(p.image) + '"' : '') + '><span class="tag">' + p.material + '</span></div>' +
      '<div class="body"><h3>' + esc(p.name) + '</h3><p class="desc">' + esc(p.desc || '') + '</p>' +
      '<div class="row"><span class="price">' + money(p.price) + '</span><button class="add" data-add="' + p.id + '">Add to cart</button></div></div></article>';
  }
  var grid = $('#grid');
  if (grid){
    var state = { m:'all' };
    var drawGrid = function(){
      var list = P.filter(function(p){ return state.m === 'all' || p.material === state.m; });
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">New designs are coming soon. In the meantime, <a href="custom.html" style="text-decoration:underline">request a custom piece</a>.</p>';
    };
    var f = $('#filters');
    f.addEventListener('click', function(e){
      var b = e.target.closest('[data-m]'); if (!b) return;
      state.m = b.getAttribute('data-m');
      [].forEach.call(f.children, function(c){ c.classList.toggle('on', c === b); });
      drawGrid();
    });
    drawGrid();
  }
  var feat = $('#featured');
  if (feat){ if (P.length) feat.innerHTML = P.slice(0, 3).map(card).join(''); else feat.closest('section').style.display = 'none'; }

  /* ---- lightbox ---- */
  var lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
  document.addEventListener('click', function(e){
    var z = e.target.closest('[data-zoom]');
    if (z){ lb.firstChild.src = z.getAttribute('data-zoom'); lb.classList.add('open'); }
    else if (lb.classList.contains('open')) lb.classList.remove('open');
  });

  /* ---- custom order form ---- */
  var form = $('#customForm');
  if (form){
    var dep = C.depositGHS, live = !!C.paystackKey;
    $('#depAmt').textContent = money(dep);
    var btn = $('#payBtn'), out = $('#formMsg');
    btn.textContent = live ? 'Pay ' + money(dep) + ' deposit & send' : 'Send request on WhatsApp';
    if (!live) $('#depNote').textContent = 'We will confirm your design and share deposit payment details (mobile money or card) on WhatsApp.';

    var details = function(d, ref){
      return 'Hello EsTerra Craft! I would like a CUSTOM piece.\n' +
        'Name: ' + d.name + '\nPhone: ' + d.phone + (d.email ? '\nEmail: ' + d.email : '') +
        '\nItem: ' + d.type + '\nMetal: ' + d.metal + (d.size ? '\nSize/length: ' + d.size : '') + (d.date ? '\nNeeded by: ' + d.date : '') +
        '\nDescription: ' + d.desc + '\n' + (ref ? 'Deposit ' + money(dep) + ' PAID. Paystack ref: ' + ref : 'Deposit ' + money(dep) + ' to be arranged.') +
        '\n(I will send inspiration photos here.)';
    };
    form.addEventListener('submit', function(e){
      e.preventDefault();
      out.className = 'msg';
      var d = {}; new FormData(form).forEach(function(v, k){ d[k] = String(v).trim(); });
      if (!live){ window.open(wa(details(d)), '_blank'); out.className = 'msg ok'; out.textContent = 'WhatsApp opened with your request. Tap send to submit it.'; return; }
      if (!window.PaystackPop){ out.className = 'msg err'; out.textContent = 'Payment could not load. Check your connection and retry, or message us on WhatsApp.'; return; }
      if (!d.email){ out.className = 'msg err'; out.textContent = 'Please enter your email for the payment receipt.'; return; }
      btn.disabled = true;
      PaystackPop.setup({
        key: C.paystackKey, email: d.email, amount: dep * 100, currency: 'GHS',
        channels: ['mobile_money', 'card'],
        ref: 'ETC-' + Date.now(),
        metadata: { custom_fields: [
          { display_name:'Name', variable_name:'name', value:d.name }, { display_name:'Phone', variable_name:'phone', value:d.phone },
          { display_name:'Item', variable_name:'item', value:d.type + ' / ' + d.metal } ] },
        callback: function(r){
          btn.disabled = false;
          out.className = 'msg ok'; out.textContent = 'Deposit received (ref ' + r.reference + '). Opening WhatsApp so we get your design details.';
          window.open(wa(details(d, r.reference)), '_blank');
          form.reset();
        },
        onClose: function(){ btn.disabled = false; }
      }).openIframe();
    });
  }
})();

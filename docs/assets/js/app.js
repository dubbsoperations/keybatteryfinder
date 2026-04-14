let vehicleIndex = null;
let products = null;

async function loadData() {
  const base = document.querySelector('meta[name="base-url"]')?.content || '';
  const [vi, pr] = await Promise.all([
    fetch(`${base}/data/vehicle_index.json`).then(r => r.json()),
    fetch(`${base}/data/products.json`).then(r => r.json())
  ]);
  vehicleIndex = vi;
  products = pr;
}

function makeSlug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function populateMakes(selectEl) {
  const makes = Object.keys(vehicleIndex).sort();
  selectEl.innerHTML = '<option value="">Select Make</option>';
  makes.forEach(make => {
    const opt = document.createElement('option');
    opt.value = make;
    opt.textContent = make;
    selectEl.appendChild(opt);
  });
}

function populateModels(make, selectEl) {
  const models = Object.keys(vehicleIndex[make] || {}).sort();
  selectEl.innerHTML = '<option value="">Select Model</option>';
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = false;
}

function populateYears(make, model, selectEl) {
  const years = Object.keys(vehicleIndex[make]?.[model] || {}).sort((a, b) => b - a);
  selectEl.innerHTML = '<option value="">Select Year</option>';
  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = false;
}

function renderCards(skus, container) {
  container.innerHTML = '';
  if (!skus.length) {
    container.innerHTML = `<div class="no-results">
      <h3>No key fobs found</h3>
      <p>Try a different year or check the model name.</p>
    </div>`;
    return;
  }
  const base = document.querySelector('meta[name="base-url"]')?.content || '';
  skus.forEach(sku => {
    const p = products[sku];
    if (!p) return;
    const slug = makeSlug(sku);
    const card = document.createElement('a');
    card.className = 'product-card';
    card.href = `${base}/fob/${slug}.html`;
    card.innerHTML = `
      <div class="card-image-wrap">
        <img src="${p.image_url}" alt="${p.original_title}" loading="lazy"
          onerror="this.src='${base}/assets/img/placeholder.png'">
      </div>
      <div class="card-body">
        <span class="battery-badge">🔋 ${p.battery}</span>
        <div class="card-title">${p.original_title}</div>
        <div class="card-compat">${(p.compatibility_clean || '').substring(0, 100)}</div>
        <div class="card-arrow">View details →</div>
      </div>`;
    container.appendChild(card);
  });
}

async function initSearch() {
  const makeEl = document.getElementById('sel-make');
  const modelEl = document.getElementById('sel-model');
  const yearEl = document.getElementById('sel-year');
  const btnEl = document.getElementById('btn-search');
  const resultsEl = document.getElementById('results');
  const resultsHeader = document.getElementById('results-header');

  await loadData();
  populateMakes(makeEl);

  makeEl.addEventListener('change', () => {
    modelEl.innerHTML = '<option value="">Select Model</option>';
    yearEl.innerHTML = '<option value="">Select Year</option>';
    yearEl.disabled = true;
    btnEl.disabled = true;
    if (makeEl.value) {
      modelEl.disabled = false;
      populateModels(makeEl.value, modelEl);
    } else {
      modelEl.disabled = true;
    }
  });

  modelEl.addEventListener('change', () => {
    yearEl.innerHTML = '<option value="">Select Year</option>';
    btnEl.disabled = true;
    if (modelEl.value) {
      yearEl.disabled = false;
      populateYears(makeEl.value, modelEl.value, yearEl);
    } else {
      yearEl.disabled = true;
    }
  });

  yearEl.addEventListener('change', () => {
    btnEl.disabled = !yearEl.value;
  });

  btnEl.addEventListener('click', () => {
    const make = makeEl.value;
    const model = modelEl.value;
    const year = yearEl.value;
    if (!make || !model || !year) return;

    const skus = vehicleIndex[make]?.[model]?.[year] || [];
    resultsHeader.innerHTML = `
      <h2>${year} ${make} ${model} Key Fob Batteries</h2>
      <p>Found <strong>${skus.length}</strong> compatible key fob${skus.length !== 1 ? 's' : ''}</p>`;
    resultsEl.innerHTML = `<div class="loading"><div class="loading-spinner"></div>Loading results...</div>`;
    setTimeout(() => renderCards(skus, resultsEl), 80);

    const url = new URL(window.location);
    url.searchParams.set('make', make);
    url.searchParams.set('model', model);
    url.searchParams.set('year', year);
    window.history.pushState({}, '', url);
    document.getElementById('results-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Handle URL params on load
  const params = new URLSearchParams(window.location.search);
  const make = params.get('make');
  const model = params.get('model');
  const year = params.get('year');
  if (make && model && year) {
    makeEl.value = make;
    populateModels(make, modelEl);
    modelEl.value = model;
    populateYears(make, model, yearEl);
    yearEl.value = year;
    btnEl.disabled = false;
    btnEl.click();
  }
}

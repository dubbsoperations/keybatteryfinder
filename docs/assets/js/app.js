// KeyBatteryFinder - Main App JS
const YT_CHANNEL = 'https://www.youtube.com/@KeyBatteryFinder';
let vehicleIndex = null;
let products = null;

// Load data
async function loadData() {
  const base = document.querySelector('meta[name="base-url"]')?.content || '';
  const [vi, pr] = await Promise.all([
    fetch(`${base}/data/vehicle_index.json`).then(r => r.json()),
    fetch(`${base}/data/products.json`).then(r => r.json())
  ]);
  vehicleIndex = vi;
  products = pr;
  return { vehicleIndex, products };
}

// Populate make dropdown
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

// Populate model dropdown based on make
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

// Populate year dropdown based on make + model
function populateYears(make, model, selectEl) {
  const years = Object.keys(vehicleIndex[make]?.[model] || {}).sort((a,b) => b-a);
  selectEl.innerHTML = '<option value="">Select Year</option>';
  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    selectEl.appendChild(opt);
  });
  selectEl.disabled = false;
}

// Get SKUs for make/model/year
function getSKUs(make, model, year) {
  return vehicleIndex[make]?.[model]?.[year] || [];
}

// Render product cards
function renderCards(skus, container) {
  container.innerHTML = '';
  if (!skus.length) {
    container.innerHTML = `<div class="no-results">
      <h3>No key fobs found</h3>
      <p>Try a different make, model, or year combination.</p>
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
      <img class="card-image" src="${p.image}" alt="${p.title}" onerror="this.src='${base}/assets/img/no-image.png'" loading="lazy">
      <div class="card-body">
        <div class="battery-badge">🔋 ${p.battery}</div>
        <div class="card-title">${p.title}</div>
        <div class="card-compat">${p.compatibility?.substring(0, 100) || ''}</div>
      </div>`;
    container.appendChild(card);
  });
}

function makeSlug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Search page init
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
    if (makeEl.value) populateModels(makeEl.value, modelEl);
    else modelEl.disabled = true;
  });

  modelEl.addEventListener('change', () => {
    yearEl.innerHTML = '<option value="">Select Year</option>';
    btnEl.disabled = true;
    if (modelEl.value) populateYears(makeEl.value, modelEl.value, yearEl);
    else yearEl.disabled = true;
  });

  yearEl.addEventListener('change', () => {
    btnEl.disabled = !yearEl.value;
  });

  btnEl.addEventListener('click', () => {
    const make = makeEl.value;
    const model = modelEl.value;
    const year = yearEl.value;
    if (!make || !model || !year) return;

    const skus = getSKUs(make, model, year);
    resultsHeader.innerHTML = `
      <h2>${year} ${make} ${model} Key Fob Batteries</h2>
      <p>Found ${skus.length} compatible key fob${skus.length !== 1 ? 's' : ''}</p>`;
    resultsEl.innerHTML = `<div class="loading"><div class="loading-spinner"></div>Loading results...</div>`;
    setTimeout(() => renderCards(skus, resultsEl), 100);

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('make', make);
    url.searchParams.set('model', model);
    url.searchParams.set('year', year);
    window.history.pushState({}, '', url);
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

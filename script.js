'use strict';
// Product information and saved IDs are separate arrays.
const products = [
  { id: 'loaf', name: 'Signature Loaf' },
  { id: 'pastry', name: 'Pastry selection' },
  { id: 'cake', name: 'Celebration cake' }
];
const storageKey = 'northStarFavorites';
let favorites = [];
let storageAvailable = true;
function loadFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    favorites = Array.isArray(stored)
      ? [...new Set(stored.filter(id => products.some(p => p.id === id)))] : [];
  } catch (error) {
    favorites = [];
    // A damaged value should not stop the page from working.
  }
}
function saveFavorites() {
  try { localStorage.setItem(storageKey, JSON.stringify(favorites)); }
  catch (error) { storageAvailable = false; }
}
function renderFavorites() {
  const list = document.getElementById('favorite-products');
  if (!list) return;
  list.replaceChildren();
  products.forEach(product => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const saved = favorites.includes(product.id);
    button.type = 'button';
    button.textContent = `${saved ? 'Remove' : 'Save'} ${product.name}`;
    button.setAttribute('aria-pressed', String(saved));
    button.addEventListener('click', () => toggleFavorite(product.id));
    item.append(button);
    list.append(item);
  });
  const names = products.filter(p => favorites.includes(p.id)).map(p => p.name);
  document.getElementById('favorite-summary').textContent = names.length
    ? `Saved favorites (${names.length}): ${names.join(', ')}.` : 'No favorites saved yet.';
  document.getElementById('storage-note').textContent = storageAvailable
    ? 'Favorites are remembered in this browser when you return.'
    : 'Browser storage is unavailable; favorites will last only while this page stays open.';
}
function toggleFavorite(id) {
  if (!products.some(p => p.id === id)) return;
  favorites = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
  saveFavorites();
  renderFavorites();
}
function validateValues(values) {
  const errors = {};
  if (values.name.length < 2) errors['customer-name'] = 'Enter a name with at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email, such as name@example.com.';
  if (!['preorder', 'question'].includes(values.request)) errors['request-type'] = 'Choose a request type.';
  if (values.details.length < 10 || values.details.length > 1500)
    errors['item-details'] = 'Enter between 10 and 1,500 characters.';
  if (values.request === 'preorder' && !values.pickup) errors['pickup-date'] = 'Choose a preferred pickup date for your preorder.';
  if (values.pickup) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.pickup) || values.pickup < today)
      errors['pickup-date'] = 'Choose today or a future pickup date.';
  }
  if (values.allergies.length > 500) errors['allergy-notes'] = 'Keep allergy notes to 500 characters or fewer.';
  return errors;
}
function readForm() {
  const value = id => document.getElementById(id).value.trim();
  return { name: value('customer-name'), email: value('email'), request: value('request-type'),
    details: value('item-details'), pickup: value('pickup-date'), allergies: value('allergy-notes') };
}
function showErrors(errors) {
  ['customer-name','email','request-type','pickup-date','item-details','allergy-notes'].forEach(id => {
    document.getElementById(id+'-error').textContent = errors[id] || '';
    document.getElementById(id).setAttribute('aria-invalid', String(Boolean(errors[id])));
  });
}
function setupForm() {
  const form = document.querySelector('form');
  if (!form) return;
  // Disable native popups only once custom validation is running.
  form.noValidate = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors = validateValues(readForm());
    showErrors(errors);
    const ids = Object.keys(errors);
    document.getElementById('form-status').textContent = ids.length
      ? 'Please correct the marked fields. Your entries have been kept.'
      : 'Your request passed validation. This classroom demo has not sent an order or saved your contact details.';
    if (ids.length) document.getElementById(ids[0]).focus();
  });
  form.addEventListener('input', () => {
    showErrors(validateValues(readForm()));
    document.getElementById('form-status').textContent = '';
  });
  form.addEventListener('change', () => showErrors(validateValues(readForm())));
}
loadFavorites();
renderFavorites();
setupForm();

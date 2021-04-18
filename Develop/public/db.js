let db;
// create db request
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
  store.clear();
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log(`Error ${event.target.errorCode}`);
};

function saveRecord(record) {
  // create a transaction on db
  const transaction = db.transaction(['pending'], 'readwrite');

  // access your pending object store
  const store = transaction.objectStore('pending');

  // add record with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on db
  const transaction = db.transaction(['pending'], 'readwrite');
  // access pending object store
  const store = transaction.objectStore('pending');
  const getAll = store.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(() => {
          // if successful open a transaction on db
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          store.clear();
        });
    }
  };
}

// listen for app
window.addEventListener('online', checkDatabase);
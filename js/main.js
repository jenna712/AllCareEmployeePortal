/* Shared JS for All Care Central (vanilla) */
document.addEventListener('DOMContentLoaded', initUI);

function initUI(){
  const search = document.getElementById('globalSearch');
  if(search){
    search.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        const q = search.value.trim();
        if(q) window.open('https://drive.google.com/drive/search?q=' + encodeURIComponent(q), '_blank');
      }
    });
  }

  // Load dynamic content (apps, resources, forms)
  loadResources();
  loadForms();
}

function openExternal(url){
  if(url) window.open(url, '_blank');
}

function openResource(name, url){
  try{
    const raw = localStorage.getItem('ac_recent_resources');
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(r=>r.name !== name);
    filtered.unshift({name: name, url: url, ts: Date.now()});
    const sliced = filtered.slice(0,8);
    localStorage.setItem('ac_recent_resources', JSON.stringify(sliced));
    renderRecentResources();
    if(url && url !== '#') window.open(url, '_blank');
  }catch(err){console.error(err)}
}

function renderRecentResources(){
  const el = document.getElementById('recentResources');
  if(!el) return;
  const raw = localStorage.getItem('ac_recent_resources');
  const list = raw ? JSON.parse(raw) : [];
  el.innerHTML = '';
  if(list.length === 0){
    el.innerHTML = '<div class="muted">No recent resources yet. Open a resource to see it here.</div>';
    return;
  }
  list.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'resource-item';
    const left = document.createElement('div');
    left.innerHTML = '<strong>'+item.name+'</strong><div class="muted" style="font-size:0.9rem">Opened '+new Date(item.ts).toLocaleString()+'</div>';
    const right = document.createElement('div');
    const a = document.createElement('a');
    a.className = 'btn btn-ghost';
    a.href = item.url || '#';
    a.textContent = 'Open';
    a.addEventListener('click', function(e){ e.preventDefault(); openResource(item.name, item.url); });
    right.appendChild(a);
    div.appendChild(left);
    div.appendChild(right);
    el.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', renderRecentResources);

// Load resources from JSON and render into both Home and Resources pages
function loadResources(){
  fetch('data/resources.json').then(r=>{
    if(!r.ok) throw new Error('Failed to load resources.json');
    return r.json();
  }).then(list=>{
    renderQuickResources(list);
    renderResourcesList(list);
  }).catch(err=>{console.error(err)});
}

function renderQuickResources(list){
  const el = document.getElementById('quickResourcesGrid');
  if(!el) return;
  el.innerHTML = '';
  // show up to 6 resources in defined order
  list.slice(0,6).forEach(item=>{
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'favorite-card';
    btn.onclick = ()=> openExternal(item.url);
    btn.innerHTML = '<span class="favorite-icon" aria-hidden="true">📄</span><span>'+item.title+'</span>';
    el.appendChild(btn);
  });
}

function renderResourcesList(list){
  const el = document.getElementById('resourcesLibrary');
  if(!el) return;
  el.innerHTML = '';
  list.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'resource-item';
    const left = document.createElement('div');
    left.innerHTML = '<strong>'+item.title+'</strong><div class="muted">'+(item.description||'')+'</div>';
    const right = document.createElement('div');
    const a = document.createElement('a');
    a.className = 'btn btn-ghost';
    a.href = '#';
    a.textContent = 'View';
    a.addEventListener('click', function(e){ e.preventDefault(); openExternal(item.url); });
    right.appendChild(a);
    row.appendChild(left);
    row.appendChild(right);
    el.appendChild(row);
  });
}

// Load forms from JSON and render on the Forms page
function loadForms(){
  fetch('data/forms.json').then(r=>{
    if(!r.ok) throw new Error('Failed to load forms.json');
    return r.json();
  }).then(list=>{
    renderFormsList(list);
  }).catch(err=>{console.error(err)});
}

function renderFormsList(list){
  const el = document.getElementById('formsLibrary');
  if(!el) return;
  el.innerHTML = '';
  list.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'resource-item';
    const left = document.createElement('div');
    left.innerHTML = '<strong>'+item.title+'</strong><div class="muted">'+(item.description||'')+'</div>';
    const right = document.createElement('div');
    const a = document.createElement('a');
    a.className = 'btn btn-ghost';
    a.href = '#';
    a.textContent = 'View';
    a.addEventListener('click', function(e){ e.preventDefault(); openExternal(item.url); });
    right.appendChild(a);
    row.appendChild(left);
    row.appendChild(right);
    el.appendChild(row);
  });
}

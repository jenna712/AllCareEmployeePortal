/* Lightweight UI helpers (currently minimal) */
// Reserved for future shared components (modals, toasts)
(function(){
  window.acUI = {
    toast(msg, timeout=2400){
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position = 'fixed';
      el.style.right = '18px';
      el.style.bottom = '18px';
      el.style.background = 'rgba(0,0,0,0.7)';
      el.style.color='#fff';
      el.style.padding='10px 14px';
      el.style.borderRadius='8px';
      document.body.appendChild(el);
      setTimeout(()=>{el.remove()}, timeout);
    }
  };
})();

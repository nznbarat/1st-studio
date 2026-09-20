/* ══════════════════════════════════════════════════════════════════════
   Захиалгын маягт — аюулгүй илгээлт.

   Ботын түлхүүр энэ файлд БАЙХГҮЙ. Маягт нь өөрсдийн сервер рүү
   (/api/order) явуулдаг ба сервер нь л Telegram руу дамжуулна.
   Сервер тохируулаагүй, эсвэл интернэт тасарсан үед хэрэглэгчид
   утас, имэйлийг нь харуулж, ямар ч тохиолдолд холбогдох боломж үлдээнэ.
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const ENDPOINT = '/api/order';
  const CONTACT = {
    phone: '+976 9114 1516',
    email: 'info@1ststudio.mn'
  };
  const fallback = 'Уучлаарай, яг одоо илгээж чадсангүй.\n\n' +
    'Шууд холбогдоорой:\n📞 ' + CONTACT.phone + '\n✉ ' + CONTACT.email;

  /**
   * Захиалга илгээнэ.
   * @param {{name,phone,service,message,website}} f  маягтын утгууд
   * @param {HTMLElement} [btn]  илгээх товч (ажиллах үед түгжинэ)
   * @returns {Promise<boolean>} амжилттай эсэх
   */
  root.sendOrder = async function (f, btn) {
    const name = (f.name || '').trim(), phone = (f.phone || '').trim();
    if (!name || !phone) {
      alert('Нэр болон утасны дугаараа оруулна уу!');
      return false;
    }
    const old = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'ИЛГЭЭЖ БАЙНА…'; }

    let okDone = false;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name, phone: phone,
          service: (f.service || '').trim(),
          message: (f.message || '').trim(),
          website: f.website || ''          /* робот барих хавх */
        })
      });
      if (res.ok) {
        okDone = true;
      } else {
        let msg = '';
        try { msg = (await res.json()).error || ''; } catch (e) { }
        alert(res.status === 501 ? fallback : (msg || fallback));
      }
    } catch (e) {
      alert(fallback);
    }
    if (btn) { btn.disabled = false; btn.textContent = old; }
    if (okDone) alert('Захиалга амжилттай илгээгдлээ! 🎵\n24 цагийн дотор хариулна.');
    return okDone;
  };
})(window);

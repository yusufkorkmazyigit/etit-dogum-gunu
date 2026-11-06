# 🎂 ETİT Üyeleri Doğum Günü İşaretleme Sistemi

ETİT üyelerinin takvimden doğum günlerini işaretleyip isimlerini yazdığı basit bir web sayfası.

- Takvimden güne tıkla → adını yaz → kaydet
- Yaklaşan doğum günleri listesi, "bugün doğum günü" uyarısı
- Üyelik/giriş yok; herkes kendi kaydını kendi tarayıcısından güncelleyip silebilir
- Sayfa **GitHub Pages**'te, kayıtlar **Google E-Tablo**'da durur (ücretsiz)

## Kurulum (bir kerelik, ~5 dk)

### 1. Google E-Tablo ve Apps Script
1. [sheets.new](https://sheets.new) ile yeni bir e-tablo aç, adını "ETİT Doğum Günleri" yap.
2. Menüden **Uzantılar → Apps Script**'i aç.
3. Açılan `Code.gs` dosyasının içini sil, bu repodaki [`apps-script/Code.gs`](apps-script/Code.gs) içeriğini yapıştır, kaydet.
4. Sağ üstten **Dağıt → Yeni dağıtım**:
   - Tür: **Web uygulaması**
   - Şu kullanıcı olarak çalıştır: **Ben**
   - Erişimi olanlar: **Herkes**
5. **Dağıt**'a bas, Google izin isterse onayla ("Gelişmiş → güvenli olmayan sayfaya git" adımı normal, script senin).
6. Verilen **Web uygulaması URL'sini** kopyala (`https://script.google.com/macros/s/.../exec`).

### 2. Sayfaya bağla
`index.html` içinde en alttaki şu satırı bul ve URL'yi yapıştır:

```js
const API_URL = "https://script.google.com/macros/s/.../exec";
```

### 3. GitHub Pages
Repo **Settings → Pages → Source: Deploy from a branch → `main` / root** → Save.
Birkaç dakika sonra sayfa `https://<kullanici-adi>.github.io/<repo-adi>/` adresinde yayında olur.

## Yönetim
- Tüm kayıtlar e-tablodaki **Kayitlar** sayfasında görünür. Yanlış/şaka bir kaydı silmek için satırı silmen yeterli.
- `token` sütunu kimseye gösterilmez; kişinin kendi kaydını düzenleyebilmesini sağlar. Düzenleme yapma.
- `Code.gs`'i değiştirirsen **Dağıt → Dağıtımları yönet → Düzenle → Yeni sürüm** ile güncelle (URL aynı kalır).

## Notlar
- Kayıt yalnızca gün ve aydan oluşur; doğum yılı tutulmaz.
- 29 Şubat doğumlular artık olmayan yıllarda 28 Şubat'ta gösterilir.
- Sayfa her dakika kayıtları yeniler.

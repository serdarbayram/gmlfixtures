# GameMaker Fixture Editor

## Türkçe Tanıtım

**GameMaker Fixture Editor**, GameMaker Studio 2 için fiziksel çarpışma şekilleri oluşturup düzenleyebileceğiniz, tarayıcıda çalışan bir araçtır. Ek yazılım kurmadan sprite üzerinde fixture tasarlayabilir ve doğrudan kopyalayabileceğiniz GML kodu üretebilirsiniz.

### Özellikler

- **Sprite Yükleme:** Fixture noktalarını doğru yerleştirmek için sprite’ınızı referans olarak yükleyin.
- **Hazır Şekiller:** Daire, elips, dikdörtgen, kare, eşkenar üçgen ve düzgün çokgen oluşturun.
- **Boyut Ayarları:** Şeklin boyutunu, dönüş açısını ve nokta sayısını ayarlayın.
- **Elle Çizim:** Noktalar yerleştirerek dışbükey veya içbükey şekiller çizin.
- **Bağımsız Şekiller:** Birden fazla şekil oluşturun, isimlendirin ve her birini ayrı düzenleyin.
- **Nokta Düzenleme:** Noktaları seçin, taşıyın, silin ve yatay veya dikey hizalayın.
- **Piksel Ölçümü:** Şeklin çapını veya genişliğini belirlemek için sprite üzerinde yatay ya da dikey mesafe ölçün.
- **Izgara ve Gezinme:** Hassas düzenleme için ızgaraya hizalama, yakınlaştırma ve tuvali kaydırma araçlarını kullanın.
- **Geri ve İleri Alma:** Düzenleme işlemlerini geri alın veya yeniden uygulayın.
- **Fizik Ayarları:** Yoğunluk, esneklik, sürtünme, çarpışma grubu, sensör ve uyanıklık durumunu ayarlayın.
- **GML Üretimi:** Fixture kodu oluşturun; içbükey şekiller ve sekizden fazla noktası olan çokgenler otomatik olarak üçgenlere bölünür.
- **Hata Ayıklama Çizimi:** GameMaker’da fixture çizgilerini göstermek için isteğe bağlı Draw Event kodu üretin.
- **Proje Kaydetme:** Şekilleri, isimlerini ve ayarları JSON dosyalarına kaydedip tekrar yükleyin.
- **İki Dilli Arayüz:** Türkçe ve İngilizce arasında geçiş yapın.
- **Kurulum Gerektirmez:** `index.html` dosyasını tarayıcıda açıp düzenlemeye başlayın.

## English Overview

**GameMaker Fixture Editor** is a browser-based tool for creating and editing physics collision shapes for GameMaker Studio 2. Design fixtures over your sprites and generate ready-to-copy GML code without installing additional software.

### Features

- **Sprite Import:** Load a sprite as a reference for precise fixture placement.
- **Preset Shapes:** Create circles, ellipses, rectangles, squares, equilateral triangles, and regular polygons.
- **Custom Dimensions:** Adjust shape size, rotation, and point count.
- **Manual Drawing:** Draw convex or concave shapes by placing points.
- **Independent Shapes:** Create multiple shapes, name them, and edit each separately.
- **Point Editing:** Select, move, delete, and align points horizontally or vertically.
- **Pixel Measurement:** Measure horizontal or vertical distances on a sprite to set a shape’s diameter or width.
- **Grid and Navigation:** Use grid snapping, zoom, and canvas panning for accurate editing.
- **Undo and Redo:** Revert or restore editing actions.
- **Physics Settings:** Configure density, restitution, friction, collision group, sensor status, and awake state.
- **GML Generation:** Generate fixture code, with automatic triangulation for concave shapes and polygons exceeding eight points.
- **Debug Drawing:** Generate optional Draw Event code to display fixture outlines in GameMaker.
- **Project Saving:** Save and load shapes, names, and settings as JSON files.
- **Bilingual Interface:** Switch between English and Turkish.
- **No Setup Required:** Open `index.html` in your browser and start editing.

---

[Türkçe](#türkçe) | [English](#english)

## Türkçe

GameMaker Studio 2 için fixture noktalarını düzenleyen ve GML kodu üreten tarayıcı uygulaması.

### Çalıştırma

`index.html` dosyasını tarayıcıda açın. Kurulum, derleme veya sunucu gerekmez.
Dosyayı taşırken `css` ve `js` klasörlerini de aynı dizinde tutun.

### Dosya düzeni

| Dosya | Sorumluluk |
| --- | --- |
| `index.html` | Arayüz yapısı ve sıralı script yükleme |
| `css/styles.css` | Anlamlı sınıf adlarıyla tüm stiller |
| `js/state.js` | Paylaşılan editör durumu |
| `js/app.js` | Başlatma ve temel olay bağlantıları |
| `js/editor.js` | Nokta düzenleme, seçim, hizalama, yakınlaştırma ve sprite yükleme |
| `js/renderer.js` | Canvas çizimi |
| `js/geometry.js` | Nokta sıralama ve üçgenleme |
| `js/presets.js` | Hazır şekil üretimi, boyutlar, döndürme ve yerleştirme önizlemesi |
| `js/measurement.js` | İki tıklamayla yatay/dikey çap ölçümü ve ölçü çizgisi |
| `js/shapes.js` | Bağımsız şekiller, aktif şekil seçimi, isimlendirme ve silme |
| `js/codegen.js` | GML üretimi ve kopyalama |
| `js/project.js` | JSON kaydetme/yükleme ve fizik ayarları |
| `js/history.js` | Geri/ileri alma ve geçmiş takibi |
| `js/i18n.js` | Dil seçimi, yedek dil ve parametreli çeviri |
| `js/locales/en.js`, `js/locales/tr.js` | İngilizce ve Türkçe metinler |

Scriptler doğrudan dosyadan açılabilmesi için klasik JavaScript kullanır ve ortak
duruma erişir. `index.html` içindeki yükleme sırasını koruyun; `app.js` son yüklenir.

### Çeviri ekleme

Her iki dil dosyasına aynı anahtarı ekleyin. Metinler için `data-i18n="anahtar"`,
araç ipuçları ve erişilebilir adlar için `data-i18n-title="anahtar"` kullanın.
JavaScript içinde `t('anahtar')` veya `t('code_part', { n: 2 })` çağrılır.
Eksik çeviriler İngilizceye, bilinmeyen anahtarlar anahtar adına döner.
HTML yalnızca `js/i18n.js` içindeki açık izin listesinde yer alan metinlerde işlenir.
Dil tercihi tarayıcı depolamasına erişilebildiğinde saklanır.

Dil değişimi mevcut GML çıktısının yalnızca yorumlarını çevirir; fixture değerlerini
değiştirmez. Yüklenen sprite bilgisi de korunur.

Mevcut geometri algoritmaları korunmuştur: `getConvexHull` adına rağmen mevcut
işlev noktaları merkez etrafında sıralar; gerçek bir dışbükey zarf hesaplamaz.
Bu nedenle dışbükey moddaki açıklama gerçek davranışa göre düzeltilmiştir.

### Kontrol

Node.js varsa `node tests/smoke.cjs` komutu dosya bağlantılarını, çeviri anahtarlarını,
başlatmayı ve temel düzenleme/kod üretme akışlarını kontrol eder.

### Hazır geometrik şekiller

Aktif şekil listesinin altındaki **Şekil adı** alanına isim yazıp Enter'a basın
veya alandan çıkın. İsimler JSON projesinde ve geri/ileri alma geçmişinde korunur.
İsmi boş bırakırsanız varsayılan Şekil 1, Şekil 2 adlandırması kullanılır.

**GameMaker’da fixture çizgilerini göster** seçeneği ayrı bir **Draw Event Kodu**
alanı açar. Buradaki kodu objenin Draw Event'ine kopyalayın; fixture oluşturma
koduyla ayrı tutulur. Objeye sprite atadığınızdan emin olun. Bu tercih de JSON
projesiyle saklanır.

1. Daire, elips, dikdörtgen/kare, eşkenar üçgen veya düzgün çokgen seçin.
2. Boyutları ve dönüş açısını girin. Daire, elips ve çokgen için 3–64 nokta
   seçilebilir. Üçgen 3, dikdörtgen 4 nokta kullanır. Üçgen ve düzgün çokgende
   çap, köşelerin üzerinde bulunduğu çemberin çapıdır.
3. **Onayla ve Yerleştir** düğmesine basın. Tuvalde fareyi hareket ettirerek
   önizlemeyi görün; şeklin merkezini yerleştirmek için sol tıklayın.
   `Esc` veya **İptal** yerleştirmeyi iptal eder.

Her ekleme bağımsız bir şekil oluşturur. **Aktif şekil** listesinden bir şekil
seçerek noktalarını düzenleyebilirsiniz. Yeni şeklin tüm noktaları seçilir ve
taşıma aracı açılır; bir noktasından sürükleyerek şeklin tamamını taşıyabilirsiniz.
**Aktif Şekli Sil** yalnızca seçili şekli kaldırır. Noktalar bölümündeki
**Temizle** de yalnızca aktif şeklin noktalarını temizler.

Hazır şekiller yerleştirildiğinde otomatik tamamlanır ve listede **✓** ile gösterilir.
Sonrasında **Ekle** ile nokta koymak veya **İçbükey / Dışbükey** seçmek yeni,
bağımsız bir çizim başlatır. Tamamlanan şeklin noktaları ve algoritması korunur.
Elle çizilen şekilleri **Şekli Tamamla** düğmesiyle bitirip bir sonraki bağımsız
şekle geçebilirsiniz. Tamamlanan şekillerin noktaları hâlâ taşınabilir ve silinebilir;
yeni nokta ekleme ayrı bir şekil oluşturur. Tamamlanma durumu projeyle ve geçmişle saklanır.
**Şekli Tamamla** çizimi anında bitirir, taşıma moduna geçer ve GML çıktısını
günceller; tuvale ek bir tıklama gerekmez. Yeni çizim için **Ekle** veya
**İçbükey / Dışbükey** düğmesini seçin.

Izgaraya hizalama yerleştirme sırasında merkeze uygulanır; şeklin oranları korunur.
Eklemeler ve silmeler Ctrl+Z / Ctrl+Shift+Z ile geri/ileri alınabilir.
JSON projeleri tüm şekilleri içerir; önceki tek şekilli JSON dosyaları açılabilir.
Fizik ayarları tüm şekiller için ortaktır. GML çıktısı tüm şekilleri aynı nesneye
bağlar; 8’den fazla noktalı şekiller üçgenlere ayrılarak ayrı fixture’lar oluşturur.
Ondalıklı koordinatlar 6 basamağa kadar korunur.

#### Sprite üzerinden çap ölçme

**Çap / Genişlik Ölç** düğmesine basıp sprite üzerinde ilk noktaya tıklayın.
Fareyi hareket ettirdiğinizde baskın yöne göre yatay veya dikey bir çizgi ve
canlı piksel ölçüsü görünür. İkinci tıklama, o eksendeki mesafeyi çap / genişlik
alanına iki ondalık basamağa kadar yazar. Ölçüm ızgaraya yapışmaz ve yakınlaştırmadan
etkilenmez; sprite’ın özgün piksel ölçeğini kullanır. `Esc` veya **İptal** ölçümü
sonlandırır. Sonrasında **Onayla ve Yerleştir** ile şekli yerleştirebilirsiniz.

---

## English

A browser application for editing fixture points and generating GML code for GameMaker Studio 2.

### Getting started

Open `index.html` in your browser. No installation, build step, or server is required.
When moving the application, keep the `css` and `js` folders alongside `index.html`.

### File structure

| File | Responsibility |
| --- | --- |
| `index.html` | Interface structure and ordered script loading |
| `css/styles.css` | All styles, organized with descriptive class names |
| `js/state.js` | Shared editor state |
| `js/app.js` | Initialization and core event handlers |
| `js/editor.js` | Point editing, selection, alignment, zooming, and sprite loading |
| `js/renderer.js` | Canvas rendering |
| `js/geometry.js` | Point ordering and triangulation |
| `js/presets.js` | Preset geometry, dimensions, rotation, and placement preview |
| `js/measurement.js` | Horizontal/vertical diameter measurement with two clicks and a measurement line |
| `js/shapes.js` | Independent shapes, active shape selection, naming, and deletion |
| `js/codegen.js` | GML generation and copying |
| `js/project.js` | JSON saving/loading and physics settings |
| `js/history.js` | Undo/redo and history tracking |
| `js/i18n.js` | Language selection, fallback language, and parameterized translations |
| `js/locales/en.js`, `js/locales/tr.js` | English and Turkish strings |

The application uses classic JavaScript scripts with shared state so it can run
directly from a local file. Preserve the loading order in `index.html`; `app.js`
is loaded last.

### Adding translations

Add the same key to both language files. Use `data-i18n="key"` for text and
`data-i18n-title="key"` for tooltips and accessible names. In JavaScript, call
`t('key')` or `t('code_part', { n: 2 })`.
Missing translations fall back to English; unknown keys display the key itself.
HTML is processed only for strings explicitly allowed in `js/i18n.js`.
The language preference is saved when browser storage is available.

Switching languages translates only the comments in the existing GML output;
fixture values and loaded sprite information are preserved.

The existing geometry algorithms have been preserved: despite its name,
`getConvexHull` sorts points around their center rather than calculating a true
convex hull. The convex mode description reflects this behavior.

### Checks

With Node.js installed, run `node tests/smoke.cjs` to check file references,
translation keys, initialization, and core editing/code generation workflows.

### Preset geometric shapes

Enter a name in the **Shape name** field below the active shape list, then press
Enter or leave the field. Names are preserved in JSON projects and undo/redo
history. Leave the field empty to use the default Shape 1, Shape 2 naming.

The **Show fixture outlines in GameMaker** option opens a separate **Draw Event Code**
section. Copy its code into the object's Draw Event; it is kept separate from
fixture creation code. Make sure a sprite is assigned to the object. This
preference is also saved in the JSON project.

1. Choose a circle, ellipse, rectangle/square, equilateral triangle, or regular polygon.
2. Enter dimensions and rotation. Circles, ellipses, and polygons support 3–64 points.
   Triangles use 3 points and rectangles use 4. For triangles and regular polygons,
   the diameter refers to the circle passing through their vertices.
3. Click **Confirm and Place**. Move the mouse over the canvas to see the preview,
   then left-click to place the shape's center. Press `Esc` or **Cancel** to cancel placement.

Each placement creates an independent shape. Select a shape from the **Active shape**
list to edit its points. All points of a newly placed shape are selected and the
move tool is activated; drag one of its points to move the whole shape.
**Delete Active Shape** removes only the selected shape. **Clear** in the Points
section clears only the active shape's points.

Preset shapes are finished automatically upon placement and marked with **✓** in
the list. Adding points with **Add** or choosing **Concave / Convex** afterward
starts a new independent drawing. The finished shape's points and algorithm are
preserved. Use **Finish Shape** to finish a hand-drawn shape before starting another.
Points in finished shapes can still be moved or deleted; adding new points creates
a separate shape. Completion status is saved in projects and history.
**Finish Shape** ends drawing immediately, switches to move mode, and updates the
GML output without requiring another canvas click. Select **Add** or
**Concave / Convex** to start drawing again.

Grid snapping applies to the center during placement, preserving the shape's
proportions. Additions and deletions can be undone/redone with Ctrl+Z / Ctrl+Shift+Z.
JSON projects contain all shapes, and older single-shape JSON files can still be
opened. Physics settings are shared by all shapes. GML output binds every shape
to the same object; shapes with more than 8 points are split into triangles,
each creating a separate fixture. Decimal coordinates retain up to 6 decimal places.

#### Measuring a diameter on a sprite

Click **Measure Diameter / Width**, then click the first point on the sprite.
As you move the mouse, a horizontal or vertical line follows the dominant direction
and displays a live pixel measurement. The second click writes the distance along
that axis into the diameter / width field, rounded to two decimal places.
Measurement ignores grid snapping and is independent of zoom; it uses the sprite's
original pixel scale. Press `Esc` or **Cancel** to end measurement. You can then
use **Confirm and Place** to position the shape.
